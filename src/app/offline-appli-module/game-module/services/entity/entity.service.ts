import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { SpriteObserver } from '../sprite-observer.service';
import { CharacterService } from '../character/character.service';
import { PlateformService } from '../plateform/plateform.service';
import { ScoreService } from '../score/score.service';
import { GameStateService } from '../game-state/game-state.service';
import { AttachedSpriteModel, EntityKind, GameEntity, RectModel, TrailModel } from '../../models/game-entity.interface';
import { ENTITY_CONFIGS, EntityConfig, GOLD_COLLECTED_SRC, OverlayConfig, TrailConfig } from '../../models/entity-config';
import { getHitboxRect, intersects, randomBetween } from '../../models/collision';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private readonly KINDS: EntityKind[] = Object.keys(ENTITY_CONFIGS) as EntityKind[];
  private readonly COIN_GRAVITY: number = 2200;
  private readonly STATE_ANIMATION_DURATION_S: number = 0.48;
  private readonly POWERUP_DROP_INTERVAL_S: number = 0.9;
  private readonly POWERUP_BURST_COINS: number = 6;
  private readonly MIN_ENEMY_GAP_S: number = 1.2;
  private readonly FIRST_ENEMY_DELAY_S: number = 3;
  // top part of the enemy you can bounce on
  private readonly STOMP_TOLERANCE: number = 0.45;
  private readonly HIT_COOLDOWN_S: number = 0.4;
  // after bouncing off an enemy, another contact from above still counts as a stomp
  private readonly STOMP_GRACE_S: number = 0.15;
  private readonly EMERGE_DURATION_S: number = 0.6;
  // rises once it has crossed this ratio of the screen; pushed back to EMERGE_AFTER_HIT when hit
  private readonly EMERGE_START_RATIO: number = 0.8;
  private readonly EMERGE_AFTER_HIT: number = 0.4;
  // luck: coin attraction radius and speed
  private readonly MAGNET_RADIUS: number = 450;
  private readonly MAGNET_SPEED: number = 900;
  // minimum distance ahead of the player where an enemy may fall or teleport
  private readonly SAFE_DISTANCE: number = 300;
  // warning delay before an enemy coming from behind enters the screen
  private readonly FROM_BEHIND_WARNING_S: number = 1;
  private readonly POINTS: Record<'gold' | 'angelBonus', number> = { gold: 1, angelBonus: 5 };

  // one template sprite per kind: preloads the image and gives the width/height ratio
  private templates: Record<EntityKind, SpriteObserver> = this.KINDS.reduce((templates, kind) => {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    templates[kind] = new SpriteObserver(config.src, 0, 0, 0, config.speed, config.sourcePixelSize);
    return templates;
  }, {} as Record<EntityKind, SpriteObserver>);

  private trailTemplates: Partial<Record<EntityKind, SpriteObserver>> = this.KINDS.reduce((templates, kind) => {
    const trail: TrailConfig | null = ENTITY_CONFIGS[kind].trail;
    if (trail) {
      templates[kind] = new SpriteObserver(trail.src, 0, 0, 0, 0, trail.sourcePixelSize);
    }
    return templates;
  }, {} as Partial<Record<EntityKind, SpriteObserver>>);

  private overlayTemplates: Partial<Record<EntityKind, SpriteObserver>> = this.KINDS.reduce((templates, kind) => {
    const overlay: OverlayConfig | null = ENTITY_CONFIGS[kind].overlay;
    if (overlay) {
      templates[kind] = new SpriteObserver(overlay.src, 0, 0, 0, 0, overlay.sourcePixelSize);
    }
    return templates;
  }, {} as Partial<Record<EntityKind, SpriteObserver>>);

  private entities: GameEntity[] = [];
  private pendingEntities: GameEntity[] = [];
  private spawnTimers: Record<EntityKind, number> = {} as Record<EntityKind, number>;
  private lastEnemySpawn: number = 0;
  // stored before collisions: a bounce must not cancel stomping a second enemy
  private characterFalling: boolean = false;
  private stompGraceTimer: number = 0;
  private nextId: number = 0;
  private widthWindows: number = window.innerWidth;

  constructor(private readonly characterService: CharacterService,
    private readonly plateformService: PlateformService,
    private readonly scoreService: ScoreService,
    private readonly gameStateService: GameStateService
  ) {
    this.templates.gold.getImageDimensions(GOLD_COLLECTED_SRC);
    this.reset();
  }

  public getEntities(): GameEntity[] {
    return this.entities;
  }

  public getSpritesIsLoad(): Observable<boolean> {
    const sprites: SpriteObserver[] = [
      ...Object.values(this.templates),
      ...Object.values(this.trailTemplates),
      ...Object.values(this.overlayTemplates)
    ];
    return combineLatest(sprites.map((sprite: SpriteObserver) => sprite.getSpriteIsLoad())).pipe(
      map((states: boolean[]) => states.every(Boolean))
    );
  }

  public setWidthWindows(width: number): void {
    this.widthWindows = width;
  }

  public reset(): void {
    this.entities.length = 0;
    this.pendingEntities.length = 0;
    this.lastEnemySpawn = 0;
    this.stompGraceTimer = 0;
    this.KINDS.forEach((kind) => {
      const config: EntityConfig = ENTITY_CONFIGS[kind];
      this.spawnTimers[kind] = randomBetween(config.spawnInterval) + (config.isEnemy ? this.FIRST_ENEMY_DELAY_S : 0);
    });
  }

  public update(deltaTime: number): void {
    const groundY: number | null = this.plateformService.getGroundY();
    if (groundY === null) {
      return;
    }
    this.updateSpawns(deltaTime, groundY);

    const characterHitbox: RectModel = this.characterService.getHitbox();
    this.characterFalling = this.characterService.isFalling();
    this.stompGraceTimer = Math.max(this.stompGraceTimer - deltaTime, 0);
    let writeIndex: number = 0;
    for (const entity of this.entities) {
      if (this.updateEntity(entity, deltaTime, groundY)) {
        if (entity.state === 'active') {
          this.checkCollision(entity, characterHitbox);
        }
        this.entities[writeIndex++] = entity;
      }
    }
    this.entities.length = writeIndex;
    this.entities.push(...this.pendingEntities);
    this.pendingEntities.length = 0;
  }

  // Progressive difficulty: from 1 to 2.2 in ~2 minutes
  private getDifficulty(): number {
    return Math.min(1 + this.gameStateService.getElapsedTime() / 100, 2.2);
  }

  private updateSpawns(deltaTime: number, groundY: number): void {
    const difficulty: number = this.getDifficulty();
    const elapsed: number = this.gameStateService.getElapsedTime();
    let dueEnemy: EntityKind | null = null;
    for (const kind of this.KINDS) {
      const config: EntityConfig = ENTITY_CONFIGS[kind];
      this.spawnTimers[kind] -= deltaTime;
      if (this.spawnTimers[kind] > 0 || !this.isKindLoaded(kind)) {
        continue;
      }
      // pending enemies go from most to least overdue (queue),
      // otherwise the first in the list would always take the slot and the last ones would almost never appear
      if (config.isEnemy) {
        if (dueEnemy === null || this.spawnTimers[kind] < this.spawnTimers[dueEnemy]) {
          dueEnemy = kind;
        }
        continue;
      }
      this.spawn(kind, groundY, difficulty);
      this.spawnTimers[kind] = randomBetween(config.spawnInterval);
    }
    // two enemies too close together would make the passage impossible
    if (dueEnemy !== null && elapsed - this.lastEnemySpawn >= this.MIN_ENEMY_GAP_S) {
      this.spawn(dueEnemy, groundY, difficulty);
      this.lastEnemySpawn = elapsed;
      this.spawnTimers[dueEnemy] = randomBetween(ENTITY_CONFIGS[dueEnemy].spawnInterval) / difficulty;
    }
  }

  private isKindLoaded(kind: EntityKind): boolean {
    return this.templates[kind].isLoad() &&
      this.trailTemplates[kind]?.isLoad() !== false &&
      this.overlayTemplates[kind]?.isLoad() !== false;
  }

  private createEntity(kind: EntityKind, x: number, y: number): GameEntity {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    const width: number = this.templates[kind].getWidth();
    const height: number = this.templates[kind].getHeight();
    return {
      id: this.nextId++,
      kind,
      image: config.src,
      flipX: config.flipX,
      x,
      y,
      width,
      height,
      trail: this.createTrail(kind, width, height),
      overlay: this.createOverlay(kind, width, height),
      vx: 0,
      vy: 0,
      baseY: y,
      age: 0,
      falling: false,
      state: 'active',
      stateTime: 0,
      dropCooldown: this.POWERUP_DROP_INTERVAL_S,
      hitPoints: config.stomp?.hitPoints ?? 1,
      hitCooldown: 0,
      emerge: config.emergeFromGround ? 0 : 1,
      teleportTimer: config.teleport ? randomBetween(config.teleport.interval) : 0,
      teleportsLeft: config.teleport?.count ?? 0
    };
  }

  // The rainbow attaches to the sprite like the character's; flipped with it.
  // Its visible part is limited to the screen width.
  private createTrail(kind: EntityKind, width: number, height: number): TrailModel | null {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    const template: SpriteObserver | undefined = this.trailTemplates[kind];
    if (!config.trail || !template) {
      return null;
    }
    const scale: number = height / this.templates[kind].getOriginelDimension().height;
    const anchorX: number = config.trail.anchorX * scale;
    const visibleWidth: number = Math.min(template.getWidth(), this.widthWindows);
    return {
      image: config.trail.src,
      x: config.flipX ? width - anchorX : anchorX - visibleWidth,
      y: config.trail.anchorY * scale,
      width: visibleWidth,
      height: template.getHeight(),
      imageWidth: template.getWidth()
    };
  }

  // Drawn in front of the sprite and centred on it, like the character's sparks
  private createOverlay(kind: EntityKind, width: number, height: number): AttachedSpriteModel | null {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    const template: SpriteObserver | undefined = this.overlayTemplates[kind];
    if (!config.overlay || !template) {
      return null;
    }
    return {
      image: config.overlay.src,
      x: (width - template.getWidth()) / 2,
      y: (height - template.getHeight()) / 2,
      width: template.getWidth(),
      height: template.getHeight()
    };
  }

  private spawn(kind: EntityKind, groundY: number, difficulty: number): void {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    const height: number = this.templates[kind].getHeight();
    const y: number = config.groundAnchor !== null
      ? this.getGroundedY(config, height, groundY)
      : groundY - randomBetween(config.spawnHeight) - height / 2;
    const entity: GameEntity = this.createEntity(kind, this.widthWindows, y);
    const speed: number = config.speed * (config.isEnemy ? 1 + (difficulty - 1) * 0.4 : 1);
    entity.vx = -(speed + (config.groundRelative ? this.plateformService.getGroundSpeed() : 0));
    if (config.fromBehind) {
      entity.vx = speed;
      entity.x = -entity.width - speed * this.FROM_BEHIND_WARNING_S;
    }
    if (config.fallFromSky) {
      entity.x = this.getPositionAheadOfCharacter(entity.width);
      entity.y = -entity.height;
      entity.falling = true;
    }
    entity.age = Math.random() * Math.PI * 2;
    if (config.hop) {
      entity.vy = -randomBetween(config.hop.velocity);
    }
    if (config.emergeFromGround) {
      entity.y += height;
    }
    this.pendingEntities.push(entity);
  }

  // Coin that pops out of a position then falls back to the ground
  private dropCoin(fromX: number, fromY: number, spreadX: number): void {
    const coin: GameEntity = this.createEntity('gold', fromX, fromY);
    coin.falling = true;
    coin.vx = -this.plateformService.getGroundSpeed() + spreadX;
    coin.vy = randomBetween([-700, -300]);
    this.pendingEntities.push(coin);
  }

  private dropCoinBurst(entity: GameEntity, count: number): void {
    for (let i = 0; i < count; i++) {
      const spread: number = (i - (count - 1) / 2) * 90;
      this.dropCoin(entity.x + entity.width / 2, entity.y + entity.height / 2, spread);
    }
  }

  // Luck: nearby coins fly towards the character
  private attractToCharacter(entity: GameEntity, deltaTime: number): void {
    const target: RectModel = this.characterService.getHitbox();
    const dx: number = target.x + target.width / 2 - (entity.x + entity.width / 2);
    const dy: number = target.y + target.height / 2 - (entity.y + entity.height / 2);
    const distance: number = Math.hypot(dx, dy);
    if (distance > 1 && distance < this.MAGNET_RADIUS) {
      const step: number = Math.min(distance, this.MAGNET_SPEED * deltaTime);
      entity.x += dx / distance * step;
      entity.y += dy / distance * step;
    }
  }

  private getPositionAheadOfCharacter(width: number): number {
    const maxX: number = this.widthWindows - width;
    const character: RectModel = this.characterService.getHitbox();
    const minX: number = Math.min(character.x + character.width + this.SAFE_DISTANCE, maxX);
    return randomBetween([minX, maxX]);
  }

  private teleport(entity: GameEntity, config: EntityConfig, groundY: number): void {
    entity.x = this.getPositionAheadOfCharacter(entity.width);
    entity.y = groundY - randomBetween(config.spawnHeight) - entity.height / 2;
    entity.vy = 0;
    entity.falling = true;
    entity.teleportsLeft--;
    entity.teleportTimer = config.teleport ? randomBetween(config.teleport.interval) : 0;
  }

  private getGroundedY(config: EntityConfig, height: number, groundY: number): number {
    return groundY - height * (config.groundAnchor ?? 1) + config.offsetY;
  }

  // Returns false when the entity must be removed
  private updateEntity(entity: GameEntity, deltaTime: number, groundY: number): boolean {
    const config: EntityConfig = ENTITY_CONFIGS[entity.kind];
    entity.age += deltaTime;
    entity.x += entity.vx * deltaTime;

    if (entity.state !== 'active') {
      entity.stateTime += deltaTime;
      return entity.stateTime < this.STATE_ANIMATION_DURATION_S;
    }

    if (entity.hitCooldown > 0) {
      entity.hitCooldown -= deltaTime;
    }

    if (entity.falling) {
      const landingY: number = config.groundAnchor !== null
        ? this.getGroundedY(config, entity.height, groundY)
        : groundY - entity.height;
      entity.vy += (config.fallFromSky?.gravity ?? this.COIN_GRAVITY) * deltaTime;
      entity.y += entity.vy * deltaTime;
      if (entity.y >= landingY) {
        entity.y = landingY;
        entity.falling = false;
        entity.vx = -this.plateformService.getGroundSpeed();
      }
    } else if (config.hop) {
      const groundedY: number = this.getGroundedY(config, entity.height, groundY);
      entity.vy += config.hop.gravity * deltaTime;
      entity.y += entity.vy * deltaTime;
      if (entity.y >= groundedY) {
        entity.y = groundedY;
        entity.vy = -randomBetween(config.hop.velocity);
      }
    } else if (config.groundAnchor !== null) {
      if (config.emergeFromGround && entity.x < this.widthWindows * this.EMERGE_START_RATIO) {
        entity.emerge = Math.min(entity.emerge + deltaTime / this.EMERGE_DURATION_S, 1);
      }
      entity.y = this.getGroundedY(config, entity.height, groundY) + (1 - entity.emerge) * entity.height;
    } else if (config.wave) {
      entity.y = entity.baseY + Math.sin(entity.age * config.wave.frequency) * config.wave.amplitude;
    }

    if (config.teleport && entity.teleportsLeft > 0 && !entity.falling) {
      entity.teleportTimer -= deltaTime;
      if (entity.teleportTimer <= 0) {
        this.teleport(entity, config, groundY);
      }
    }

    if (entity.kind === 'gold' && !entity.falling && this.gameStateService.isLucky()) {
      this.attractToCharacter(entity, deltaTime);
    }

    if (entity.kind === 'powerup') {
      entity.dropCooldown -= deltaTime;
      if (entity.dropCooldown <= 0 && entity.x + entity.width < this.widthWindows) {
        entity.dropCooldown = this.POWERUP_DROP_INTERVAL_S;
        this.dropCoin(entity.x + entity.width / 2, entity.y + entity.height / 2, randomBetween([-60, 60]));
      }
    }

    if (entity.vx > 0) {
      return entity.x < this.widthWindows;
    }
    // removed only once the rainbow and the overlay have left the screen too
    const right: number = Math.max(
      entity.width,
      entity.trail ? entity.trail.x + entity.trail.width : 0,
      entity.overlay ? entity.overlay.x + entity.overlay.width : 0
    );
    return entity.x + right > 0;
  }

  private checkCollision(entity: GameEntity, characterHitbox: RectModel): void {
    const config: EntityConfig = ENTITY_CONFIGS[entity.kind];
    const entityHitbox: RectModel = getHitboxRect(entity, config.hitbox, entity.flipX);
    if (entity.hitCooldown > 0 || !intersects(characterHitbox, entityHitbox)) {
      return;
    }
    switch (entity.kind) {
      case 'gold':
        this.scoreService.addScore(this.POINTS.gold * (this.gameStateService.isLucky() ? 2 : 1));
        this.setCollected(entity);
        this.resizeCentered(entity, GOLD_COLLECTED_SRC, entity.height * 2.5);
        break;
      case 'angel':
        if (!this.gameStateService.addLife()) {
          this.scoreService.addScore(this.POINTS.angelBonus);
        }
        this.setCollected(entity);
        break;
      case 'powerup':
        this.dropCoinBurst(entity, this.POWERUP_BURST_COINS);
        this.setCollected(entity);
        break;
      case 'paddy':
        this.gameStateService.startLucky();
        this.setCollected(entity);
        break;
      default:
        if (config.stomp && this.isStomp(characterHitbox, entityHitbox)) {
          this.stompEnemy(entity, config);
        } else if (config.isEnemy) {
          this.gameStateService.hurt();
        }
        break;
    }
  }

  private stompEnemy(entity: GameEntity, config: EntityConfig): void {
    this.characterService.bounce();
    this.stompGraceTimer = this.STOMP_GRACE_S;
    entity.hitPoints--;
    if (entity.hitPoints > 0) {
      entity.hitCooldown = this.HIT_COOLDOWN_S;
      if (config.emergeFromGround) {
        entity.emerge = this.EMERGE_AFTER_HIT;
      }
      return;
    }
    this.scoreService.addScore(config.stomp?.points ?? 0);
    this.scoreService.addKill();
    this.dropCoinBurst(entity, config.stomp?.coins ?? 0);
    entity.state = 'defeated';
    entity.stateTime = 0;
  }

  private isStomp(characterHitbox: RectModel, enemyHitbox: RectModel): boolean {
    const characterBottom: number = characterHitbox.y + characterHitbox.height;
    return (this.characterFalling || this.stompGraceTimer > 0) &&
      characterBottom <= enemyHitbox.y + enemyHitbox.height * this.STOMP_TOLERANCE;
  }

  private setCollected(entity: GameEntity): void {
    entity.state = 'collected';
    entity.stateTime = 0;
  }

  private resizeCentered(entity: GameEntity, image: string, size: number): void {
    entity.x -= (size - entity.width) / 2;
    entity.y -= (size - entity.height) / 2;
    entity.width = size;
    entity.height = size;
    entity.image = image;
  }

}
