import { HitboxModel, RectModel } from "./game-entity.interface";

export function getHitboxRect(rect: RectModel, hitbox: HitboxModel, flipX: boolean = false): RectModel {
    const left: number = flipX ? 1 - hitbox.right : hitbox.left;
    const right: number = flipX ? 1 - hitbox.left : hitbox.right;
    return {
        x: rect.x + rect.width * left,
        y: rect.y + rect.height * hitbox.top,
        width: rect.width * (right - left),
        height: rect.height * (hitbox.bottom - hitbox.top)
    };
}

export function intersects(a: RectModel, b: RectModel): boolean {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

export function randomBetween([min, max]: [number, number]): number {
    return min + Math.random() * (max - min);
}
