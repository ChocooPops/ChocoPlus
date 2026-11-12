import { PlayerSubtitleCue } from '../../models/player.interface';

// Cues of the text subtitle tracks, received while the media is read (see media-player.js),
// and conversion of their WebVTT text into styled lines displayed without innerHTML.

export interface SubtitleSegment {
  text: string,
  italic: boolean,
  bold: boolean,
  underline: boolean
}

export type SubtitleLine = SubtitleSegment[];

interface CueTrack {
  cues: PlayerSubtitleCue[],
  keys: Set<string>
}

// Cues starting this long before the current time are not looked at anymore
const MAX_CUE_DURATION = 30;

export class SubtitleCueStore {

  private readonly tracks = new Map<number, CueTrack>();

  // The same cues come again after each seek (the stream restarts before the seek point): they are kept once.
  public add(streamIndex: number, cues: PlayerSubtitleCue[]): void {
    let track = this.tracks.get(streamIndex);
    if (!track) {
      track = { cues: [], keys: new Set() };
      this.tracks.set(streamIndex, track);
    }
    let needsSort = false;
    for (const cue of cues) {
      const key = `${cue.start.toFixed(3)}|${cue.end.toFixed(3)}|${cue.text}`;
      if (track.keys.has(key)) continue;
      track.keys.add(key);
      const last = track.cues[track.cues.length - 1];
      if (last && cue.start < last.start) needsSort = true;
      track.cues.push(cue);
    }
    if (needsSort) {
      track.cues.sort((a, b) => a.start - b.start);
    }
  }

  public getActiveCues(streamIndex: number, time: number): PlayerSubtitleCue[] {
    const cues = this.tracks.get(streamIndex)?.cues;
    if (!cues || cues.length === 0) return [];

    // Last cue starting at or before the current time
    let low = 0;
    let high = cues.length - 1;
    let last = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (cues[middle].start <= time) {
        last = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    const active: PlayerSubtitleCue[] = [];
    for (let i = last; i >= 0 && time - cues[i].start <= MAX_CUE_DURATION; i--) {
      if (cues[i].end > time) active.unshift(cues[i]);
    }
    return active;
  }

  public clear(): void {
    this.tracks.clear();
  }
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', lrm: '‎', rlm: '‏', quot: '"', apos: "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|nbsp|lrm|rlm|quot|apos);/g, (_match, name: string) => ENTITIES[name]);
}

// "<i>Hello</i>\nworld" -> [[{ text: 'Hello', italic: true }], [{ text: 'world' }]]
// Only <i>, <b> and <u> are kept: the other tags (<font>, <c.class>, <v Name>...) are dropped.
export function parseCueText(text: string): SubtitleLine[] {
  const style = { italic: 0, bold: 0, underline: 0 };
  return text.split('\n').map((rawLine) => {
    const line: SubtitleLine = [];
    const tagPattern = /<(\/?)([a-zA-Z]+)[^>]*>/g;
    let position = 0;
    let match: RegExpExecArray | null;
    const pushText = (value: string) => {
      const decoded = decodeEntities(value);
      if (decoded) {
        line.push({ text: decoded, italic: style.italic > 0, bold: style.bold > 0, underline: style.underline > 0 });
      }
    };
    while ((match = tagPattern.exec(rawLine)) !== null) {
      pushText(rawLine.slice(position, match.index));
      position = tagPattern.lastIndex;
      const delta = match[1] === '/' ? -1 : 1;
      const tag = match[2].toLowerCase();
      if (tag === 'i') style.italic = Math.max(0, style.italic + delta);
      if (tag === 'b') style.bold = Math.max(0, style.bold + delta);
      if (tag === 'u') style.underline = Math.max(0, style.underline + delta);
    }
    pushText(rawLine.slice(position));
    return line;
  }).filter((line) => line.some((segment) => segment.text.trim() !== ''));
}
