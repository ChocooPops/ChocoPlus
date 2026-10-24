// On-screen size of one pixel-art pixel: every sprite shares this scale,
// so the common skeleton (body + cat head) has the same size for all of them.
export const GAME_PIXEL_SIZE: number = 5;

// sourcePixelSize: number of source image pixels per art pixel
export function getPixelArtHeight(naturalHeight: number, sourcePixelSize: number): number {
    return naturalHeight / sourcePixelSize * GAME_PIXEL_SIZE;
}
