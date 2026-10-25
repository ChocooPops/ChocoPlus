import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';
import { PlateformService } from '../plateform/plateform.service';
import { HitboxModel, RectModel } from '../../models/game-entity.interface';
import { getHitboxRect } from '../../models/collision';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  private srcCharacter: string = 'game/character.gif';
  private srcSparks: string = 'game/spark.gif';
  private srcRainbow: string = 'game/rainbow.gif';

  private character !: SpriteObserver;
  private sparks !: SpriteObserver;
  private rainbow !: SpriteObserver;

  private readonly SOURCE_PIXEL_SIZE: number = 5;
  private readonly RAINBOW_PIXEL_SIZE: number = 23 / 19;
  private readonly SPARKS_PIXEL_SIZE: number = 20;
  private readonly START_X: number = 100;
  private readonly MOVE_SPEED: number = 300;
  // faster when moving back: it goes the same way as the ground scrolling
  private readonly MOVE_BACK_SPEED: number = 450;
  private readonly JUMP_VELOCITY: number = 1750;
  private readonly GRAVITY: number = 3500;
  // speed kept when the jump key is released while rising (short jump)
  private readonly JUMP_CUT: number = 0.45;
  private readonly BOUNCE_RATIO: number = 0.65;
  // bounce off an enemy with the jump key held: higher than a normal jump
  private readonly SUPER_BOUNCE_RATIO: number = 1.15;
  // press tolerance before / after the impact to get the super bounce
  private readonly JUMP_BUFFER_S: number = 0.15;
  private readonly SUPER_BOUNCE_LATE_S: number = 0.12;
  private readonly HITBOX: HitboxModel = { left: 0.1, right: 0.9, top: 0.08, bottom: 0.95 };

  private keyRightActivate: boolean = false;
  private keyLeftActivate: boolean = false;
  private keyJumpActivate: boolean = false;
  private jumpBufferTimer: number = 0;
  private superBounceLateTimer: number = 0;

  private velocityY: number = 0;
  private grounded: boolean = true;

  constructor(private plateformService: PlateformService) {
    this.sparks = new SpriteObserver(this.srcSparks, 100, 0, 100, 0, this.SPARKS_PIXEL_SIZE);
    this.rainbow = new SpriteObserver(this.srcRainbow, 100, 0, 100, 0, this.RAINBOW_PIXEL_SIZE);
    this.character = new SpriteObserver(this.srcCharacter, this.START_X, 0, 100, this.MOVE_SPEED, this.SOURCE_PIXEL_SIZE);
  }

  public getCharacter(): SpriteObserver {
    return this.character;
  }

  public getRainbow(): SpriteObserver {
    return this.rainbow;
  }

  public getSparks(): SpriteObserver {
    return this.sparks;
  }

  public setKeyLeft(state: boolean): void {
    this.keyLeftActivate = state;
  }

  public setKeyRight(state: boolean): void {
    this.keyRightActivate = state;
  }

  public setKeyJump(state: boolean): void {
    if (state && !this.keyJumpActivate) {
      this.jumpBufferTimer = this.JUMP_BUFFER_S;
      // pressed right after a simple bounce: turn it into a super bounce
      if (this.superBounceLateTimer > 0) {
        this.superBounceLateTimer = 0;
        this.velocityY = -this.JUMP_VELOCITY * this.SUPER_BOUNCE_RATIO;
      }
    }
    if (!state && this.velocityY < 0) {
      this.velocityY *= this.JUMP_CUT;
    }
    this.keyJumpActivate = state;
  }

  public releaseKeys(): void {
    this.keyLeftActivate = false;
    this.keyRightActivate = false;
    this.keyJumpActivate = false;
    this.jumpBufferTimer = 0;
    this.superBounceLateTimer = 0;
  }

  public reset(): void {
    this.releaseKeys();
    this.velocityY = 0;
    this.grounded = true;
    const groundY: number | null = this.getGroundY();
    this.character.updateSprite({ x: this.START_X, ...(groundY !== null && { y: groundY }) });
    this.updateAttachedSprites();
  }

  public isFalling(): boolean {
    return !this.grounded && this.velocityY > 0;
  }

  public bounce(): void {
    const superBounce: boolean = this.keyJumpActivate || this.jumpBufferTimer > 0;
    // several enemies stomped at once: keep the strongest bounce
    this.velocityY = Math.min(this.velocityY, -this.JUMP_VELOCITY * (superBounce ? this.SUPER_BOUNCE_RATIO : this.BOUNCE_RATIO));
    this.superBounceLateTimer = superBounce || this.velocityY <= -this.JUMP_VELOCITY ? 0 : this.SUPER_BOUNCE_LATE_S;
    this.jumpBufferTimer = 0;
    this.grounded = false;
  }

  public getHitbox(): RectModel {
    return getHitboxRect({
      x: this.character.getX(),
      y: this.character.getY(),
      width: this.character.getWidth(),
      height: this.character.getHeight()
    }, this.HITBOX);
  }

  public update(deltaTime: number): void {
    const groundY: number | null = this.getGroundY();
    if (!this.character.isLoad() || groundY === null) {
      return;
    }
    this.jumpBufferTimer = Math.max(this.jumpBufferTimer - deltaTime, 0);
    this.superBounceLateTimer = Math.max(this.superBounceLateTimer - deltaTime, 0);

    const direction: number = Number(this.keyRightActivate) - Number(this.keyLeftActivate);
    const maxX: number = this.character.getWidthWindows() - this.character.getWidth();
    const speed: number = direction < 0 ? this.MOVE_BACK_SPEED : this.MOVE_SPEED;
    const x: number = Math.min(Math.max(this.character.getX() + direction * speed * deltaTime, 0), maxX);
    let y: number = this.character.getY();

    if (this.grounded) {
      if (this.keyJumpActivate) {
        this.velocityY = -this.JUMP_VELOCITY;
        this.grounded = false;
      } else {
        y = groundY;
      }
    }
    if (!this.grounded) {
      this.velocityY += this.GRAVITY * deltaTime;
      y += this.velocityY * deltaTime;
      if (y >= groundY) {
        y = groundY;
        this.velocityY = 0;
        this.grounded = true;
      }
    }

    this.character.updateSprite({ x, y });
    this.updateAttachedSprites();
  }

  private getGroundY(): number | null {
    const plateformY: number | null = this.plateformService.getGroundY();
    return plateformY === null ? null : plateformY - this.character.getHeight();
  }

  // The sparks (centred) and the rainbow (behind) follow the character; each one has its own size
  private updateAttachedSprites(): void {
    if (!this.character.isLoad() || !this.sparks.isLoad() || !this.rainbow.isLoad()) {
      return;
    }
    const x: number = this.character.getX();
    const y: number = this.character.getY();
    const characterWidth: number = this.character.getWidth();
    const characterHeight: number = this.character.getHeight();

    this.sparks.updateSprite({
      x: x - (this.sparks.getWidth() - characterWidth) / 2,
      y: y - (this.sparks.getHeight() - characterHeight) / 2
    });
    this.rainbow.updateSprite({
      x: x - this.rainbow.getWidth() + characterWidth * 0.3,
      y: y - (this.rainbow.getHeight() - characterHeight) / 2
    });
  }

}
