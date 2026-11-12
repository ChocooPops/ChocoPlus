// Size and place of the mini player. The user moves and resizes it, the 16:9 ratio is kept,
// it always stays in the window (below the title bar) and is found again at the next session.

export interface MiniPlayerRect {
  left: number,
  top: number,
  width: number,
  height: number
}

export interface MiniPlayerViewport {
  width: number,
  height: number
}

// Stored form: the width and the distance to the nearest window edges, so that the player
// stays in its corner when the window is resized
export interface MiniPlayerGeometry {
  width: number,
  horizontal: 'left' | 'right',
  offsetX: number,
  vertical: 'top' | 'bottom',
  offsetY: number
}

// Edges and corners the mini player is resized from (not the bottom edge: the progress bar is there)
export type MiniResizeHandle = 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const MINI_RESIZE_HANDLES: MiniResizeHandle[] = ['top', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

// Same ratio as the CSS of the mini player
export const MINI_PLAYER_RATIO: number = 16 / 9;
export const MINI_PLAYER_MIN_WIDTH: number = 280;
// Distance kept to the window edges
const MARGIN: number = 8;
// Below the title bar: its drag region would catch the mouse
const TOP_LIMIT: number = 40;
const STORAGE_KEY: string = 'chocoplus.player.mini';
const DEFAULT_GEOMETRY: MiniPlayerGeometry = { width: 400, horizontal: 'right', offsetX: 24, vertical: 'bottom', offsetY: 24 };

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), Math.max(min, max));

function getMaxWidth(viewport: MiniPlayerViewport): number {
  return Math.min(viewport.width - 2 * MARGIN, (viewport.height - TOP_LIMIT - MARGIN) * MINI_PLAYER_RATIO);
}

// Keeps the size allowed and the whole player in the window
export function clampMiniRect(rect: MiniPlayerRect, viewport: MiniPlayerViewport): MiniPlayerRect {
  const width = clamp(rect.width, MINI_PLAYER_MIN_WIDTH, getMaxWidth(viewport));
  const height = width / MINI_PLAYER_RATIO;
  return {
    width,
    height,
    left: clamp(rect.left, MARGIN, viewport.width - width - MARGIN),
    top: clamp(rect.top, TOP_LIMIT, viewport.height - height - MARGIN)
  };
}

export function toMiniRect(geometry: MiniPlayerGeometry, viewport: MiniPlayerViewport): MiniPlayerRect {
  const width = geometry.width;
  const height = width / MINI_PLAYER_RATIO;
  return clampMiniRect({
    width,
    height,
    left: geometry.horizontal === 'left' ? geometry.offsetX : viewport.width - width - geometry.offsetX,
    top: geometry.vertical === 'top' ? geometry.offsetY : viewport.height - height - geometry.offsetY
  }, viewport);
}

// Attached to the edges nearest to its center
export function fromMiniRect(rect: MiniPlayerRect, viewport: MiniPlayerViewport): MiniPlayerGeometry {
  const horizontal = rect.left + rect.width / 2 < viewport.width / 2 ? 'left' : 'right';
  const vertical = rect.top + rect.height / 2 < viewport.height / 2 ? 'top' : 'bottom';
  return {
    width: Math.round(rect.width),
    horizontal,
    offsetX: Math.round(horizontal === 'left' ? rect.left : viewport.width - rect.left - rect.width),
    vertical,
    offsetY: Math.round(vertical === 'top' ? rect.top : viewport.height - rect.top - rect.height)
  };
}

export function moveMiniRect(start: MiniPlayerRect, dx: number, dy: number, viewport: MiniPlayerViewport): MiniPlayerRect {
  return clampMiniRect({ ...start, left: start.left + dx, top: start.top + dy }, viewport);
}

// The opposite edge / corner stays in place (an edge alone keeps the player centered on it)
export function resizeMiniRect(start: MiniPlayerRect, handle: MiniResizeHandle, dx: number, dy: number,
  viewport: MiniPlayerViewport): MiniPlayerRect {
  const sx = handle.includes('left') ? -1 : handle.includes('right') ? 1 : 0;
  const sy = handle.startsWith('top') ? -1 : handle.startsWith('bottom') ? 1 : 0;
  const widthFromX = start.width + sx * dx;
  const widthFromY = (start.height + sy * dy) * MINI_PLAYER_RATIO;
  // A corner follows the direction the mouse moved the most
  let width = sx === 0 ? widthFromY
    : sy === 0 ? widthFromX
      : Math.abs(widthFromX - start.width) >= Math.abs(widthFromY - start.width) ? widthFromX : widthFromY;

  // The fixed side limits the size: the player must not go out of the window
  let maxWidth = getMaxWidth(viewport);
  if (sx < 0) maxWidth = Math.min(maxWidth, start.left + start.width - MARGIN);
  if (sx > 0) maxWidth = Math.min(maxWidth, viewport.width - MARGIN - start.left);
  if (sy < 0) maxWidth = Math.min(maxWidth, (start.top + start.height - TOP_LIMIT) * MINI_PLAYER_RATIO);
  if (sy > 0) maxWidth = Math.min(maxWidth, (viewport.height - MARGIN - start.top) * MINI_PLAYER_RATIO);
  width = clamp(width, MINI_PLAYER_MIN_WIDTH, maxWidth);

  const height = width / MINI_PLAYER_RATIO;
  return clampMiniRect({
    width,
    height,
    left: sx < 0 ? start.left + start.width - width : sx > 0 ? start.left : start.left + (start.width - width) / 2,
    top: sy < 0 ? start.top + start.height - height : sy > 0 ? start.top : start.top + (start.height - height) / 2
  }, viewport);
}

export function loadMiniGeometry(): MiniPlayerGeometry {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (value && Number.isFinite(value.width) && Number.isFinite(value.offsetX) && Number.isFinite(value.offsetY)
      && (value.horizontal === 'left' || value.horizontal === 'right') && (value.vertical === 'top' || value.vertical === 'bottom')) {
      return { width: value.width, horizontal: value.horizontal, offsetX: value.offsetX, vertical: value.vertical, offsetY: value.offsetY };
    }
  } catch {
    // Unreadable: the default place
  }
  return { ...DEFAULT_GEOMETRY };
}

export function saveMiniGeometry(geometry: MiniPlayerGeometry): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(geometry));
  } catch {
    // Not saved: only the next session loses the place
  }
}
