import { PlayerPgsDisplaySet } from '../../models/player.interface';

// Blu-ray image subtitles (PGS). The main process sends the track's display sets (one per subtitle
// appearing, changing or disappearing); they are decoded here into RGBA images and drawn on a canvas.
//
// A display set is a list of segments: composition (PCS: which objects are shown, where, with which
// palette), palettes (PDS), objects (ODS: run-length encoded bitmaps) and windows (WDS, not needed here).
// Palettes and objects live for a whole "epoch": a display set may only change the palette or the
// composition, so a frame is decoded by replaying the display sets from the start of its epoch.

const SEGMENT_PALETTE = 0x14;
const SEGMENT_OBJECT = 0x15;
const SEGMENT_COMPOSITION = 0x16;

const EPOCH_START = 0x80;
const ACQUISITION_POINT = 0x40;
const OBJECT_FIRST_IN_SEQUENCE = 0x80;
const OBJECT_CROPPED = 0x80;

// Frames decoded lately, kept to be drawn again (resize, controls shown...) without decoding
const FRAME_CACHE_SIZE = 16;

export interface PgsImage {
  x: number,
  y: number,
  width: number,
  height: number,
  rgba: Uint8ClampedArray
}

// What is on screen from pts until the next display set. width / height: the coordinate space of x / y
// (the video size the subtitles were made for).
export interface PgsFrame {
  pts: number,
  width: number,
  height: number,
  images: PgsImage[]
}

interface Rect {
  x: number,
  y: number,
  width: number,
  height: number
}

interface CompositionObject {
  objectId: number,
  x: number,
  y: number,
  crop: Rect | null
}

interface Composition {
  width: number,
  height: number,
  state: number,
  paletteId: number,
  objects: CompositionObject[]
}

interface PaletteSegment {
  id: number,
  entries: { index: number, y: number, cr: number, cb: number, alpha: number }[]
}

interface ObjectSegment {
  id: number,
  first: boolean,
  width: number,
  height: number,
  data: Uint8Array
}

interface ParsedDisplaySet {
  composition: Composition | null,
  palettes: PaletteSegment[],
  objects: ObjectSegment[]
}

const u16 = (data: Uint8Array, offset: number): number => (data[offset] << 8) | data[offset + 1];

function parseDisplaySet(data: Uint8Array): ParsedDisplaySet {
  const parsed: ParsedDisplaySet = { composition: null, palettes: [], objects: [] };
  let offset = 0;
  while (offset + 3 <= data.length) {
    const type = data[offset];
    const size = u16(data, offset + 1);
    const payload = data.subarray(offset + 3, offset + 3 + size);
    offset += 3 + size;

    if (type === SEGMENT_COMPOSITION && payload.length >= 11) {
      const objects: CompositionObject[] = [];
      let position = 11;
      for (let i = 0; i < payload[10] && position + 8 <= payload.length; i++) {
        const flags = payload[position + 3];
        const object: CompositionObject = {
          objectId: u16(payload, position),
          x: u16(payload, position + 4),
          y: u16(payload, position + 6),
          crop: null
        };
        position += 8;
        if (flags & OBJECT_CROPPED && position + 8 <= payload.length) {
          object.crop = {
            x: u16(payload, position),
            y: u16(payload, position + 2),
            width: u16(payload, position + 4),
            height: u16(payload, position + 6)
          };
          position += 8;
        }
        objects.push(object);
      }
      parsed.composition = {
        width: u16(payload, 0),
        height: u16(payload, 2),
        state: payload[7],
        paletteId: payload[9],
        objects
      };
    } else if (type === SEGMENT_PALETTE && payload.length >= 2) {
      const entries = [];
      for (let position = 2; position + 5 <= payload.length; position += 5) {
        entries.push({
          index: payload[position],
          y: payload[position + 1],
          cr: payload[position + 2],
          cb: payload[position + 3],
          alpha: payload[position + 4]
        });
      }
      parsed.palettes.push({ id: payload[0], entries });
    } else if (type === SEGMENT_OBJECT && payload.length >= 4) {
      const first = (payload[3] & OBJECT_FIRST_IN_SEQUENCE) !== 0;
      parsed.objects.push(first && payload.length >= 11
        ? { id: u16(payload, 0), first, width: u16(payload, 7), height: u16(payload, 9), data: payload.subarray(11) }
        : { id: u16(payload, 0), first: false, width: 0, height: 0, data: payload.subarray(4) });
    }
  }
  return parsed;
}

const clampByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

// Limited range YCbCr -> RGBA, packed for a little-endian Uint32Array over RGBA bytes.
// Same conversion as ffmpeg's PGS decoder: BT.709 above SD, BT.601 otherwise.
function toPackedRgba(y: number, cr: number, cb: number, alpha: number, bt709: boolean): number {
  const luma = (y - 16) * (255 / 219);
  const u = cb - 128;
  const v = cr - 128;
  const r = bt709 ? luma + 1.7927 * v : luma + 1.5960 * v;
  const g = bt709 ? luma - 0.2132 * u - 0.5329 * v : luma - 0.3917 * u - 0.8129 * v;
  const b = bt709 ? luma + 2.1124 * u : luma + 2.0172 * u;
  return ((alpha << 24) | (clampByte(b) << 16) | (clampByte(g) << 8) | clampByte(r)) >>> 0;
}

// PGS run-length encoding -> one palette index per pixel
export function decodePgsRle(data: Uint8Array, width: number, height: number): Uint8Array {
  const pixels = new Uint8Array(width * height);
  let x = 0;
  let y = 0;
  let position = 0;
  while (position < data.length && y < height) {
    let color = data[position++];
    let count = 1;
    if (color === 0) {
      const flags = data[position++];
      if (flags === 0) {
        // end of line
        x = 0;
        y++;
        continue;
      }
      count = flags & 0x3F;
      if (flags & 0x40) count = (count << 8) | data[position++];
      color = flags & 0x80 ? data[position++] : 0;
    }
    if (color !== 0 && x < width) {
      pixels.fill(color, y * width + x, y * width + Math.min(width, x + count));
    }
    x += count;
  }
  return pixels;
}

interface DecodedObject {
  width: number,
  height: number,
  parts: Uint8Array[]
}

// Palettes and objects of an epoch, built by applying its display sets in order
class EpochState {

  private readonly palettes = new Map<number, Uint32Array>();
  private readonly objects = new Map<number, DecodedObject>();
  private bt709 = true;

  public apply(displaySet: ParsedDisplaySet): void {
    if (displaySet.composition) {
      if (displaySet.composition.state === EPOCH_START) {
        this.palettes.clear();
        this.objects.clear();
      }
      this.bt709 = displaySet.composition.height > 576;
    }
    for (const segment of displaySet.palettes) {
      // Index 0 and every index not defined stay transparent
      const palette = this.palettes.get(segment.id) ?? new Uint32Array(256);
      for (const entry of segment.entries) {
        palette[entry.index] = toPackedRgba(entry.y, entry.cr, entry.cb, entry.alpha, this.bt709);
      }
      this.palettes.set(segment.id, palette);
    }
    for (const segment of displaySet.objects) {
      if (segment.first) {
        this.objects.set(segment.id, { width: segment.width, height: segment.height, parts: [segment.data] });
      } else {
        // Large objects are split over several segments
        this.objects.get(segment.id)?.parts.push(segment.data);
      }
    }
  }

  public render(composition: Composition, pts: number): PgsFrame {
    const palette = this.palettes.get(composition.paletteId);
    const images: PgsImage[] = [];
    for (const placement of composition.objects) {
      const object = this.objects.get(placement.objectId);
      if (!palette || !object || object.width === 0 || object.height === 0) continue;

      const data = object.parts.length === 1 ? object.parts[0] : concat(object.parts);
      const indexes = decodePgsRle(data, object.width, object.height);
      const crop = placement.crop ?? { x: 0, y: 0, width: object.width, height: object.height };
      const width = Math.max(0, Math.min(crop.width, object.width - crop.x));
      const height = Math.max(0, Math.min(crop.height, object.height - crop.y));
      if (width === 0 || height === 0) continue;

      const rgba = new Uint8ClampedArray(width * height * 4);
      const packed = new Uint32Array(rgba.buffer);
      for (let row = 0; row < height; row++) {
        const source = (crop.y + row) * object.width + crop.x;
        for (let column = 0; column < width; column++) {
          packed[row * width + column] = palette[indexes[source + column]];
        }
      }
      images.push({ x: placement.x, y: placement.y, width, height, rgba });
    }
    return { pts, width: composition.width, height: composition.height, images };
  }
}

function concat(parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

interface StoredDisplaySet {
  pts: number,
  data: Uint8Array,
  parsed?: ParsedDisplaySet
}

// Display sets of one PGS track, received while the media is read (again after each seek: kept once)
export class PgsTrackStore {

  private sets: StoredDisplaySet[] = [];
  private readonly keys = new Set<string>();
  private readonly frames = new Map<number, PgsFrame | null>();

  public add(displaySets: PlayerPgsDisplaySet[]): void {
    let inserted = false;
    for (const displaySet of displaySets) {
      const key = `${displaySet.pts.toFixed(4)}|${displaySet.data.length}`;
      if (this.keys.has(key)) continue;
      this.keys.add(key);
      const last = this.sets[this.sets.length - 1];
      if (last && displaySet.pts < last.pts) inserted = true;
      this.sets.push({ pts: displaySet.pts, data: displaySet.data });
    }
    if (inserted) {
      this.sets.sort((a, b) => a.pts - b.pts);
      // A display set added before others may change how they decode
      this.frames.clear();
    }
  }

  // What is displayed at this time (null: nothing)
  public getFrame(time: number): PgsFrame | null {
    const index = this.lastIndexAt(time);
    if (index < 0) return null;
    const pts = this.sets[index].pts;
    if (this.frames.has(pts)) return this.frames.get(pts) ?? null;

    const frame = this.decode(index);
    this.frames.set(pts, frame);
    if (this.frames.size > FRAME_CACHE_SIZE) {
      this.frames.delete(this.frames.keys().next().value as number);
    }
    return frame;
  }

  public clear(): void {
    this.sets = [];
    this.keys.clear();
    this.frames.clear();
  }

  private lastIndexAt(time: number): number {
    let low = 0;
    let high = this.sets.length - 1;
    let found = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (this.sets[middle].pts <= time) {
        found = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return found;
  }

  private parsed(index: number): ParsedDisplaySet {
    const stored = this.sets[index];
    stored.parsed ??= parseDisplaySet(stored.data);
    return stored.parsed;
  }

  private decode(index: number): PgsFrame | null {
    const composition = this.parsed(index).composition;
    // A composition without objects clears the screen
    if (!composition || composition.objects.length === 0) return null;

    let start = index;
    while (start > 0) {
      const state = this.parsed(start).composition?.state ?? 0;
      if (state === EPOCH_START || state === ACQUISITION_POINT) break;
      start--;
    }
    const epoch = new EpochState();
    for (let i = start; i <= index; i++) {
      epoch.apply(this.parsed(i));
    }
    const frame = epoch.render(composition, this.sets[index].pts);
    return frame.images.length > 0 ? frame : null;
  }
}

// Draws a frame over the video. contentRect: where the video picture is, in CSS pixels of the canvas.
export class PgsCanvasRenderer {

  private readonly bitmaps = new WeakMap<PgsImage, HTMLCanvasElement>();

  public draw(canvas: HTMLCanvasElement, frame: PgsFrame | null, contentRect: Rect): void {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!frame || frame.width === 0 || frame.height === 0) return;

    const scaleX = (contentRect.width / frame.width) * ratio;
    const scaleY = (contentRect.height / frame.height) * ratio;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    for (const image of frame.images) {
      context.drawImage(
        this.getBitmap(image),
        contentRect.x * ratio + image.x * scaleX,
        contentRect.y * ratio + image.y * scaleY,
        image.width * scaleX,
        image.height * scaleY
      );
    }
  }

  private getBitmap(image: PgsImage): HTMLCanvasElement {
    let bitmap = this.bitmaps.get(image);
    if (!bitmap) {
      bitmap = document.createElement('canvas');
      bitmap.width = image.width;
      bitmap.height = image.height;
      bitmap.getContext('2d')?.putImageData(new ImageData(image.rgba, image.width, image.height), 0, 0);
      this.bitmaps.set(image, bitmap);
    }
    return bitmap;
  }
}
