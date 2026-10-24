import { EntityKind, HitboxModel } from "./game-entity.interface";

export interface EntityConfig {
    src: string,
    // source image pixels per art pixel (final size: see GAME_PIXEL_SIZE)
    sourcePixelSize: number,
    // px/s towards the left; if groundRelative, added to the ground speed
    speed: number,
    groundRelative: boolean,
    flipX: boolean,
    hitbox: HitboxModel,
    // seconds between two spawns [min, max]
    spawnInterval: [number, number],
    // distance between the top of the ground and the sprite's centre [min, max]
    spawnHeight: [number, number],
    // fraction of the height resting on the ground (null = flying sprite)
    groundAnchor: number | null,
    // vertical offset in px applied to grounded sprites (positive = lower)
    offsetY: number,
    wave: { amplitude: number, frequency: number } | null,
    // rainbow attached to the sprite, like the character's
    trail: TrailConfig | null,
    // sprite drawn in front of and centred on the sprite, like the character's sparks
    overlay: OverlayConfig | null,
    isEnemy: boolean,
    // enemy: stomps needed, points and coins dropped when defeated
    stomp?: { hitPoints: number, points: number, coins: number },
    // moves by hopping: initial speed [min, max] in px/s, gravity in px/s²
    hop?: { velocity: [number, number], gravity: number },
    // rises out of the ground as it approaches the player
    emergeFromGround?: boolean,
    // appears at the top of the screen, ahead of the player, and falls to the ground
    fallFromSky?: { gravity: number },
    // reappears further ahead of the player then falls again; flickers `warning` seconds before
    teleport?: { interval: [number, number], count: number, warning: number },
    // permanent glitch visual effect
    glitch?: boolean,
    // comes in from the left, behind the player, and moves right
    fromBehind?: boolean
}

export interface TrailConfig {
    src: string,
    sourcePixelSize: number,
    // attachment point in the sprite's source image (unflipped):
    // rainbow's right edge in X, rainbow's top in Y
    anchorX: number,
    anchorY: number
}

export interface OverlayConfig {
    src: string,
    sourcePixelSize: number
}

export const GOLD_COLLECTED_SRC: string = 'game/gold-touch.gif';

export const ENTITY_CONFIGS: Record<EntityKind, EntityConfig> = {
    gold: {
        src: 'game/gold.gif',
        sourcePixelSize: 5,
        speed: 250,
        groundRelative: false,
        flipX: false,
        hitbox: { left: 0.1, right: 0.9, top: 0.1, bottom: 0.9 },
        spawnInterval: [1.2, 2.6],
        spawnHeight: [180, 440],
        groundAnchor: null,
        offsetY: 0,
        wave: null,
        trail: null,
        overlay: null,
        isEnemy: false
    },
    devil: {
        src: 'game/devil.gif',
        sourcePixelSize: 20,
        speed: 200,
        groundRelative: true,
        flipX: true,
        hitbox: { left: 0.19, right: 0.9, top: 0.05, bottom: 0.85 },
        spawnInterval: [3, 6],
        spawnHeight: [0, 0],
        groundAnchor: 0.96,
        offsetY: 30,
        wave: null,
        trail: {
            src: 'game/rainbow-devil.gif',
            sourcePixelSize: 20,
            anchorX: 204,
            anchorY: 20
        },
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 1, points: 3, coins: 0 }
    },
    // in the air: stay on the ground to pass under it, or jump over it when it flies low
    melon: {
        src: 'game/melon.gif',
        sourcePixelSize: 7.5,
        speed: 330,
        groundRelative: false,
        flipX: true,
        hitbox: { left: 0.05, right: 0.8, top: 0.1, bottom: 0.88 },
        spawnInterval: [4, 8],
        spawnHeight: [220, 420],
        groundAnchor: null,
        offsetY: 0,
        wave: { amplitude: 50, frequency: 2.2 },
        trail: null,
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 1, points: 3, coins: 0 }
    },
    // rises out of the ground, slow but tough: it takes two stomps
    zombie: {
        src: 'game/zombie.gif',
        sourcePixelSize: 8,
        speed: 120,
        groundRelative: true,
        flipX: true,
        hitbox: { left: 0.15, right: 0.95, top: 0.05, bottom: 0.9 },
        spawnInterval: [6, 10],
        spawnHeight: [0, 0],
        groundAnchor: 0.95,
        offsetY: 0,
        wave: null,
        trail: null,
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 2, points: 5, coins: 0 },
        emergeFromGround: true
    },
    // hops with a variable height; drops coins when stomped
    pumpkin: {
        src: 'game/pumpkin.gif',
        sourcePixelSize: 8,
        speed: 80,
        groundRelative: true,
        flipX: true,
        hitbox: { left: 0.15, right: 0.95, top: 0.05, bottom: 0.9 },
        spawnInterval: [7, 12],
        spawnHeight: [0, 0],
        groundAnchor: 0.95,
        offsetY: 0,
        wave: null,
        trail: null,
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 1, points: 3, coins: 3 },
        hop: { velocity: [900, 1250], gravity: 2600 }
    },
    // glitched: falls from the sky then teleports ahead of the player
    wtf: {
        src: 'game/wtf.gif',
        sourcePixelSize: 8,
        speed: 0,
        groundRelative: true,
        flipX: false,
        hitbox: { left: 0.1, right: 0.9, top: 0.2, bottom: 0.92 },
        spawnInterval: [9, 14],
        // height it reappears at after teleporting
        spawnHeight: [250, 450],
        groundAnchor: 0.97,
        offsetY: 0,
        wave: null,
        trail: null,
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 1, points: 4, coins: 0 },
        fallFromSky: { gravity: 1800 },
        teleport: { interval: [1.2, 2], count: 3, warning: 0.35 },
        glitch: true
    },
    // comes from behind and overtakes the player
    mexinyan: {
        src: 'game/mexinyan.gif',
        sourcePixelSize: 8,
        speed: 450,
        groundRelative: false,
        flipX: false,
        hitbox: { left: 0.1, right: 0.95, top: 0.1, bottom: 0.9 },
        spawnInterval: [10, 16],
        spawnHeight: [0, 0],
        groundAnchor: 0.96,
        offsetY: 0,
        wave: null,
        trail: null,
        overlay: null,
        isEnemy: true,
        stomp: { hitPoints: 1, points: 4, coins: 0 },
        fromBehind: true
    },
    angel: {
        src: 'game/angel.gif',
        sourcePixelSize: 20,
        speed: 110,
        groundRelative: false,
        flipX: false,
        hitbox: { left: 0.4, right: 0.95, top: 0.05, bottom: 0.92 },
        spawnInterval: [20, 35],
        spawnHeight: [250, 380],
        groundAnchor: null,
        offsetY: 0,
        wave: { amplitude: 70, frequency: 1.5 },
        trail: null,
        overlay: null,
        isEnemy: false
    },
    powerup: {
        src: 'game/powerup.gif',
        sourcePixelSize: 6,
        speed: 140,
        groundRelative: false,
        flipX: false,
        hitbox: { left: 0.06, right: 0.9, top: 0.08, bottom: 0.92 },
        spawnInterval: [14, 24],
        spawnHeight: [450, 470],
        groundAnchor: null,
        offsetY: 0,
        wave: { amplitude: 20, frequency: 3 },
        trail: null,
        overlay: {
            src: 'game/spark.gif',
            sourcePixelSize: 20
        },
        isEnemy: false
    },
    // lucky clover: activates luck (coins x2 and attracted)
    paddy: {
        src: 'game/paddy.gif',
        sourcePixelSize: 258 / 34,
        speed: 150,
        groundRelative: false,
        flipX: false,
        hitbox: { left: 0.1, right: 0.95, top: 0.1, bottom: 0.95 },
        spawnInterval: [25, 40],
        spawnHeight: [260, 380],
        groundAnchor: null,
        offsetY: 0,
        wave: { amplitude: 40, frequency: 2 },
        trail: null,
        overlay: null,
        isEnemy: false
    }
};
