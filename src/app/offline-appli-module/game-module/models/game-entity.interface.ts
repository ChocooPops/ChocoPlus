export type EntityKind = 'gold' | 'devil' | 'melon' | 'zombie' | 'pumpkin' | 'wtf' | 'mexinyan' | 'troll' | 'usa' | 'bomb' | 'explosion' | 'angel' | 'powerup' | 'paddy';

export type EntityState = 'active' | 'collected' | 'defeated' | 'removed';

export type GameStatus = 'playing' | 'paused' | 'gameover';

export interface RectModel {
    x: number,
    y: number,
    width: number,
    height: number
}

// Actually visible area of the image, as a fraction of its size (unflipped image)
export interface HitboxModel {
    left: number,
    right: number,
    top: number,
    bottom: number
}

export interface GameEntity extends RectModel {
    id: number,
    kind: EntityKind,
    image: string,
    flipX: boolean,
    vx: number,
    vy: number,
    baseY: number,
    age: number,
    falling: boolean,
    state: EntityState,
    stateTime: number,
    dropCooldown: number,
    hitPoints: number,
    // remaining time during which the entity can't be hit again (after a hit)
    hitCooldown: number,
    // 0 = buried in the ground, 1 = fully out
    emerge: number,
    teleportTimer: number,
    teleportsLeft: number,
    // remaining screen X positions where the entity will drop something, in flight order
    dropTargets: number[],
    trail: TrailModel | null,
    overlay: AttachedSpriteModel | null
}

// Attached sprite, position relative to the main sprite
export interface AttachedSpriteModel extends RectModel {
    image: string
}

// width = visible part, imageWidth = width of the whole image
export interface TrailModel extends AttachedSpriteModel {
    imageWidth: number
}
