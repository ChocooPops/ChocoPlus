import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';
import { PlateformService } from '../plateform/plateform.service';

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

  private keyRightActivate: boolean = false;
  private keyLeftActivate: boolean = false;
  private keySpaceActivate: boolean = false;

  private timerDeplacement: any | null;
  private fallingCharacter: boolean = false;

  private heightJump: number = 35;
  private gravity: number = this.heightJump;
  private incrementationGravity: number = 1.4;

  constructor(private plateformService: PlateformService) {
    this.sparks = new SpriteObserver(this.srcSparks, 100, 0, 100, 5);
    this.rainbow = new SpriteObserver(this.srcRainbow, 100, 0, 100, 5);
    this.character = new SpriteObserver(this.srcCharacter, 100, 0, 100, 6);
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

  public setKeySpace(state: boolean): void {
    this.keySpaceActivate = state;
  }

  public setYAccordingToPlateform(newY: number) {
    this.character.setY(newY - this.character.getHeight());
  }

  public moveForward(): void {
    const actualX: number = this.character.getX();
    const speed: number = this.character.getSpeed();
    this.character.setX(actualX + speed);
  }

  public moveBack(): void {
    const actualX: number = this.character.getX();
    const speed: number = this.character.getSpeed();
    this.character.setX(actualX - speed);
  }

  public setJump(): void {
    if (!this.fallingCharacter) {
      this.character.setY(this.character.getY() - this.gravity);
      this.gravity -= this.incrementationGravity;
      if (this.gravity <= 0) {
        this.fallingCharacter = true;
      }
    } else {
      this.character.setY(this.character.getY() + this.gravity);
      this.gravity += this.incrementationGravity;
      if (this.gravity > this.heightJump) {
        this.gravity = this.heightJump;
        this.keySpaceActivate = false;
        this.fallingCharacter = false;
        const newY = this.plateformService.getPlateform().getOffsetY();
        if (newY) {
          this.setYAccordingToPlateform(newY);
        }
      }
    }
  }

  private ifCharacterIsOutsideWindowLeft(): boolean {
    if (this.character.getX() - this.character.getSpeed() > 0) {
      return false;
    } else {
      return true;
    }
  }

  private ifCharacterOutsideWindowRight(): boolean {
    if (this.character.getX() + this.character.getWidth() + this.character.getSpeed() >= this.character.getWidthWindows()) {
      return true;
    } else {
      return false;
    }
  }

  public startTimer(): void {
    this.timerDeplacement = setInterval(() => {
      if (this.keyLeftActivate && !this.ifCharacterIsOutsideWindowLeft()) {
        this.moveBack();
      }
      if (this.keyRightActivate && !this.ifCharacterOutsideWindowRight()) {
        this.moveForward();
      }
      if (this.keySpaceActivate) {
        this.setJump();
      }
    }, 20)
  }

  public stopTimer(): void {
    clearInterval(this.timerDeplacement);
    this.timerDeplacement = null;
  }

  public setSparks(): void {
    const ratio: number = this.character.getOriginelDimension().height / this.character.getHeight();
    const height: number = this.sparks.getOriginelDimension().height / ratio;
    const width: number = this.sparks.getOriginelDimension().width / ratio;
    const x: number = this.character.getX() - (width - this.character.getWidth()) / 2;
    const y: number = this.character.getY() - (height - this.character.getHeight()) / 2;
    this.sparks.updateSprite({
      height: height,
      width: width,
      x: x,
      y: y
    })
  }

  public setRainbow(): void {
    const ratio: number = this.character.getOriginelDimension().height / this.character.getHeight();
    const height: number = this.rainbow.getOriginelDimension().height / ratio;
    const width: number = this.rainbow.getOriginelDimension().width / ratio;
    const x: number = this.character.getX() - width + this.character.getWidth() * 0.3;
    const y: number = this.character.getY() - (height - this.character.getHeight()) / 2;
    this.rainbow.updateSprite({
      height: height,
      width: width,
      x: x,
      y: y
    })
  }

}
