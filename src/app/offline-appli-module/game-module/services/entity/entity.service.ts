import { Injectable } from '@angular/core';
import { combineLatest, from, map, Observable } from 'rxjs';
import { SpriteObserver } from '../sprite-observer.service';
import { CharacterService } from '../character/character.service';
import { PlateformService } from '../plateform/plateform.service';
import { ScoreService } from '../score/score.service';
import { GameStateService } from '../game-state/game-state.service';
import { AttachedSpriteModel, EntityKind, GameEntity, RectModel, TrailModel } from '../../models/game-entity.interface';
import { ENTITY_CONFIGS, EntityConfig, DEATH_SRC, GOLD_COLLECTED_SRC, HEART_SRC, OverlayConfig, TrailConfig, WARNING_SRC } from '../../models/entity-config';
import { getHitboxRect, intersects, randomBetween } from '../../models/collision';
import { SkyService } from '../sky/sky.service';
import { SpriteSelectionService } from '../sprite-selection/sprite-selection.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private readonly KINDS: EntityKind[] = Object.keys(ENTITY_CONFIGS) as EntityKind[];
  private readonly COIN_GRAVITY: number = 2200;
  private readonly STATE_ANIMATION_DURATION_S: number = 0.48;
  private readonly POWERUP_DROP_INTERVAL_S: number = 0.9;
  private readonly POWERUP_BURST_COINS: number = 6;
  private readonly MIN_ENEMY_GAP_S: number = 1;
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
  private readonly MAGNET_RADIUS: number = 900;
  private readonly MAGNET_SPEED: number = 900;
  // minimum distance ahead of the player where an enemy may fall or teleport
  private readonly SAFE_DISTANCE: number = 300;
  // warning delay before an enemy coming from behind enters the screen
  private readonly FROM_BEHIND_WARNING_S: number = 1;
  // drops: minimum spacing between two drop positions, and screen margin
  private readonly DROP_MIN_GAP: number = 250;
  private readonly DROP_SCREEN_MARGIN: number = 0.05;
  // explosion.gif: horizontal / vertical centre and bottom of the blast, as fractions of the image
  private readonly EXPLOSION_ANCHOR: { x: number, y: number, bottom: number } = { x: 0.5, y: 0.51, bottom: 1 };
  private readonly POINTS: Record<'gold' | 'angelBonus', number> = { gold: 1, angelBonus: 5 };

  // one template sprite per kind: preloads the image and gives the width/height ratio
  private templates: Record<EntityKind, SpriteObserver> = this.KINDS.reduce((templates, kind) => {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    templates[kind] = new SpriteObserver(config.src, 0, 0, 0, config.speed, config.sourcePixelSize / (config.scale ?? 1));
    return templates;
  }, {} as Record<EntityKind, SpriteObserver>);

  private trailTemplates: Partial<Record<EntityKind, SpriteObserver>> = this.KINDS.reduce((templates, kind) => {
    const trail: TrailConfig | null = ENTITY_CONFIGS[kind].trail;
    if (trail) {
      templates[kind] = new SpriteObserver(trail.src, 0, 0, 0, 0, trail.sourcePixelSize / (ENTITY_CONFIGS[kind].scale ?? 1));
    }
    return templates;
  }, {} as Partial<Record<EntityKind, SpriteObserver>>);

  private overlayTemplates: Partial<Record<EntityKind, SpriteObserver>> = this.KINDS.reduce((templates, kind) => {
    const overlay: OverlayConfig | null = ENTITY_CONFIGS[kind].overlay;
    if (overlay) {
      templates[kind] = new SpriteObserver(overlay.src, 0, 0, 0, 0, overlay.sourcePixelSize / (ENTITY_CONFIGS[kind].scale ?? 1));
    }
    return templates;
  }, {} as Partial<Record<EntityKind, SpriteObserver>>);

  // shown when a coin is collected: not a template, preloaded on its own
  private collectedImageLoad$: Observable<boolean>;

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
    private readonly gameStateService: GameStateService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly skyService: SkyService,
    private readonly spriteSelectionService: SpriteSelectionService
  ) {
    // shown when a coin is collected, the coming-from-behind warning, the lives
    // and the previews of the sprite selection panel
    const extraImages: string[] = [GOLD_COLLECTED_SRC, WARNING_SRC, HEART_SRC, DEATH_SRC, ...this.KINDS
      .map((kind: EntityKind) => ENTITY_CONFIGS[kind].previewSrc)
      .filter((src: string | undefined): src is string => !!src)];
    this.collectedImageLoad$ = from(this.imagePreloaderService.preloadImages(extraImages).then(() => true));
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
    return combineLatest([
      ...sprites.map((sprite: SpriteObserver) => sprite.getSpriteIsLoad()),
      this.collectedImageLoad$
    ]).pipe(
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
          this.checkCollision(entity, characterHitbox, groundY);
        }
        this.entities[writeIndex++] = entity;
      }
    }
    this.entities.length = writeIndex;
    for (const entity of this.pendingEntities) {
      // giant entities (and their huge trail) are drawn behind the others so they never hide them
      if ((ENTITY_CONFIGS[entity.kind].scale ?? 1) > 1) {
        this.entities.unshift(entity);
      } else {
        this.entities.push(entity);
      }
    }
    this.pendingEntities.length = 0;
  }

  // Progressive difficulty: from 1 to 2.2 in ~2 minutes
  private getDifficulty(): number {
    return Math.min(1 + this.gameStateService.getElapsedTime() / 100, 2.2);
  }

  private updateSpawns(deltaTime: number, groundY: number): void {
    const difficulty: number = this.getDifficulty();
    const elapsed: number = this.gameStateService.getElapsedTime();
    let nextEnemy: EntityKind | null = null;
    for (const kind of this.KINDS) {
      const config: EntityConfig = ENTITY_CONFIGS[kind];
      this.spawnTimers[kind] -= deltaTime;
      if (config.autoSpawn === false || !this.isKindLoaded(kind) || !this.spriteSelectionService.isEnabled(kind)) {
        continue;
      }
      // enemies wait for a slot; among those that can spawn, the most overdue goes first (queue),
      // otherwise the first in the list would always take the slot and the last ones would almost never appear
      if (config.isEnemy) {
        if (this.canEnemySpawn(kind) && (nextEnemy === null || this.spawnTimers[kind] < this.spawnTimers[nextEnemy])) {
          nextEnemy = kind;
        }
        continue;
      }
      if (this.spawnTimers[kind] <= 0) {
        this.spawn(kind, groundY, difficulty);
        this.spawnTimers[kind] = randomBetween(config.spawnInterval);
      }
    }
    // two enemies too close together would make the passage impossible: one enemy per MIN_ENEMY_GAP_S at most.
    // The slot is always filled once the game has started, even if no enemy is due yet, so that with only a few
    // sprites selected there are still as many enemies as the gap allows
    const slotFree: boolean = elapsed - this.lastEnemySpawn >= this.MIN_ENEMY_GAP_S;
    if (nextEnemy !== null && slotFree && (this.spawnTimers[nextEnemy] <= 0 || elapsed >= this.FIRST_ENEMY_DELAY_S)) {
      this.spawn(nextEnemy, groundY, difficulty);
      this.lastEnemySpawn = elapsed;
      this.spawnTimers[nextEnemy] = randomBetween(ENTITY_CONFIGS[nextEnemy].spawnInterval) / difficulty;
    }
  }

  private canEnemySpawn(kind: EntityKind): boolean {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    // a shooter that fires until defeated stays on screen: never two of them at the same spot
    if (config.shooter && config.shooter.shots === undefined && this.isKindActive(kind)) {
      return false;
    }
    return this.isSpawnAreaFree(kind);
  }

  // The previous entity of the same kind must have left its entry point, or they would be stacked
  private isSpawnAreaFree(kind: EntityKind): boolean {
    const config: EntityConfig = ENTITY_CONFIGS[kind];
    if (config.fallFromSky) {
      return true;
    }
    return ![...this.entities, ...this.pendingEntities].some((entity: GameEntity) =>
      entity.kind === kind && entity.state === 'active' &&
      (config.fromBehind ? entity.x < 0 : entity.x + entity.width > this.widthWindows)
    );
  }

  private isKindActive(kind: EntityKind): boolean {
    return this.entities.some((entity: GameEntity) => entity.kind === kind && entity.state === 'active');
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
    const id: number = this.nextId++;
    return {
      id,
      kind,
      image: config.uniqueImage ? `${config.src}?${id}` : config.src,
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
      teleportsLeft: config.teleport?.count ?? 0,
      dropTargets: [],
      shotsLeft: config.shooter ? config.shooter.shots ?? Infinity : 0,
      shotsFired: 0,
      shotTimer: 0,
      cruiseVx: 0,
      wanderTimer: config.wander ? randomBetween(config.wander.interval) : 0
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
    const anchorX: number = config.trail.anchorX * width;
    const visibleWidth: number = Math.min(template.getWidth(), this.widthWindows);
    return {
      image: config.trail.src,
      x: config.flipX ? width - anchorX : anchorX - visibleWidth,
      y: config.trail.anchorY * height,
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
    let y: number = groundY - randomBetween(config.spawnHeight) - height / 2;
    if (config.groundAnchor !== null) {
      y = this.getGroundedY(config, height, groundY);
    } else if (config.skyBand) {
      const sky: SpriteObserver = this.skyService.getSky();
      y = sky.getY() + sky.getHeight() / 2 + randomBetween(config.skyBand) - height / 2;
    }
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
    if (config.drops) {
      entity.dropTargets = this.pickDropTargets(entity, config, groundY);
    }
    entity.cruiseVx = entity.vx;
    this.pendingEntities.push(entity);
  }

  // Picks random landing spots on screen (spaced by at least DROP_MIN_GAP), then converts them into
  // drop positions: the dropped entity keeps the dropper's speed while falling, so it lands further on.
  // Sorted in the order they will be flown over.
  private pickDropTargets(entity: GameEntity, config: EntityConfig, groundY: number): number[] {
    if (!config.drops) {
      return [];
    }
    const droppedConfig: EntityConfig = ENTITY_CONFIGS[config.drops.kind];
    const droppedHeight: number = this.templates[config.drops.kind].getHeight();
    const landingY: number = droppedConfig.groundAnchor !== null
      ? groundY - droppedHeight * droppedConfig.groundAnchor
      : groundY - droppedHeight;
    const fallDistance: number = Math.max(landingY - (entity.y + entity.height * config.drops.anchorY), 0);
    const fallTime: number = Math.sqrt(2 * fallDistance / (droppedConfig.gravity ?? this.COIN_GRAVITY));
    const drift: number = entity.vx * config.drops.inheritSpeed * fallTime;

    // landing spots whose drop position is on screen
    const margin: number = this.widthWindows * this.DROP_SCREEN_MARGIN;
    const range: [number, number] = [
      Math.max(margin, drift),
      Math.min(this.widthWindows - margin, this.widthWindows + drift)
    ];
    const landings: number[] = [];
    for (let tries = 0; landings.length < config.drops.count && tries < 50; tries++) {
      const x: number = randomBetween(range);
      if (landings.every((landing: number) => Math.abs(landing - x) >= this.DROP_MIN_GAP)) {
        landings.push(x);
      }
    }
    return landings
      .map((landing: number) => landing - drift)
      .sort((a: number, b: number) => entity.vx < 0 ? b - a : a - b);
  }

  private getDropAnchorX(entity: GameEntity, config: EntityConfig): number {
    const anchorX: number = config.drops ? config.drops.anchorX : 0.5;
    return entity.x + entity.width * (config.flipX ? 1 - anchorX : anchorX);
  }

  // Drops `drops.kind` from the anchor point: it falls keeping the dropper's horizontal speed
  private dropFrom(entity: GameEntity, config: EntityConfig): void {
    if (!config.drops) {
      return;
    }
    const dropped: GameEntity = this.createEntity(config.drops.kind, 0, entity.y + entity.height * config.drops.anchorY);
    dropped.x = this.getDropAnchorX(entity, config) - dropped.width / 2;
    dropped.vx = entity.vx * config.drops.inheritSpeed;
    dropped.falling = true;
    this.pendingEntities.push(dropped);
  }

  // Approaches until `stopAt`, stops, fires every `interval`, then leaves with the ground
  private updateShooter(entity: GameEntity, config: EntityConfig, deltaTime: number, groundY: number): void {
    if (!config.shooter) {
      return;
    }
    if (entity.vx !== 0 && entity.x <= this.widthWindows * config.shooter.stopAt) {
      entity.vx = 0;
      entity.shotTimer = config.shooter.interval;
    }
    if (entity.vx !== 0) {
      return;
    }
    entity.shotTimer -= deltaTime;
    if (entity.shotTimer <= 0) {
      this.shoot(entity, config, groundY);
      entity.shotsFired++;
      entity.shotsLeft--;
      entity.shotTimer = config.shooter.interval;
      if (entity.shotsLeft === 0) {
        entity.vx = -this.plateformService.getGroundSpeed();
      }
    }
  }

  // Random forward / back moves once fully on screen; always forward while entering or at the left edge
  private updateWander(entity: GameEntity, config: EntityConfig, deltaTime: number): void {
    if (!config.wander) {
      return;
    }
    if (entity.x < 0) {
      entity.vx = entity.cruiseVx;
      return;
    }
    entity.wanderTimer -= deltaTime;
    if (entity.wanderTimer <= 0) {
      entity.wanderTimer = randomBetween(config.wander.interval);
      entity.vx = Math.random() < config.wander.backChance
        ? -entity.cruiseVx * config.wander.backSpeed
        : entity.cruiseVx;
    }
  }

  private shoot(entity: GameEntity, config: EntityConfig, groundY: number): void {
    if (!config.shooter) {
      return;
    }
    const heights: number[] = config.shooter.heights;
    const height: number = heights[entity.shotsFired % heights.length];
    const anchorX: number = config.flipX ? 1 - config.shooter.anchorX : config.shooter.anchorX;
    const bullet: GameEntity = this.createEntity(config.shooter.kind, 0, 0);
    bullet.x = entity.x + entity.width * anchorX - bullet.width / 2;
    bullet.y = groundY - height - bullet.height / 2;
    bullet.vx = config.flipX ? -config.shooter.speed : config.shooter.speed;
    this.pendingEntities.push(bullet);
  }

  // Replaces the entity by its explosion: on the ground if it has landed, centred on it otherwise
  private explode(entity: GameEntity, kind: EntityKind, groundY: number): void {
    const blast: GameEntity = this.createEntity(kind, 0, 0);
    blast.x = entity.x + entity.width / 2 - blast.width * this.EXPLOSION_ANCHOR.x;
    blast.y = (entity.falling
      ? entity.y + entity.height / 2 - blast.height * this.EXPLOSION_ANCHOR.y
      : groundY - blast.height * this.EXPLOSION_ANCHOR.bottom) + ENTITY_CONFIGS[kind].offsetY;
    blast.vx = -this.plateformService.getGroundSpeed();
    this.pendingEntities.push(blast);
    entity.state = 'removed';
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

    if (entity.state === 'removed' || (config.lifetime !== undefined && entity.age >= config.lifetime)) {
      return false;
    }
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
      entity.vy += (config.gravity ?? config.fallFromSky?.gravity ?? this.COIN_GRAVITY) * deltaTime;
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

    if (config.explodeInto && !entity.falling) {
      this.explode(entity, config.explodeInto, groundY);
      return false;
    }

    if (config.shooter && entity.shotsLeft > 0) {
      this.updateShooter(entity, config, deltaTime, groundY);
    }

    if (config.wander) {
      this.updateWander(entity, config, deltaTime);
    }

    if (entity.dropTargets.length > 0) {
      const anchorX: number = this.getDropAnchorX(entity, config);
      const target: number = entity.dropTargets[0];
      if (entity.vx < 0 ? anchorX <= target : anchorX >= target) {
        entity.dropTargets.shift();
        this.dropFrom(entity, config);
      }
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

  private checkCollision(entity: GameEntity, characterHitbox: RectModel, groundY: number): void {
    const config: EntityConfig = ENTITY_CONFIGS[entity.kind];
    // dropped coins can only be collected once they have landed
    if (entity.kind === 'gold' && entity.falling) {
      return;
    }
    const entityHitbox: RectModel = getHitboxRect(entity, config.hitbox, entity.flipX);
    if (entity.hitCooldown > 0 || !intersects(characterHitbox, entityHitbox)) {
      return;
    }
    switch (entity.kind) {
      case 'gold':
        this.scoreService.addScore(this.POINTS.gold * (this.gameStateService.isLucky() ? 2 : 1));
        this.setCollected(entity);
        // gold-touch.gif plays only once: its own URL makes each collection restart from the first frame
        this.resizeCentered(entity, `${GOLD_COLLECTED_SRC}?${entity.id}`, entity.height * 2.5);
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
        if (config.explodeInto) {
          this.gameStateService.hurt();
          this.explode(entity, config.explodeInto, groundY);
        } else if (config.stomp && this.isStomp(characterHitbox, entityHitbox, config.stomp.tolerance ?? this.STOMP_TOLERANCE)) {
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

  private isStomp(characterHitbox: RectModel, enemyHitbox: RectModel, tolerance: number): boolean {
    const characterBottom: number = characterHitbox.y + characterHitbox.height;
    return (this.characterFalling || this.stompGraceTimer > 0) &&
      characterBottom <= enemyHitbox.y + enemyHitbox.height * tolerance;
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
