import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ScoreService } from '../score/score.service';

@Injectable({
  providedIn: 'root'
})
export class GoldService {

  private srcGold: string = 'game/gold.gif';
  private srcGoldTouched: string = 'game/gold-touch.gif';
  private differenceHeightWithPlateform: number = 400;
  private timer: any | null;
  private minWidthToAppear !: number;
  private gold !: SpriteObserver;

  private isActivateSuject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isActivate$: Observable<boolean> = this.isActivateSuject.asObservable();

  private subscription: Subscription = new Subscription();

  constructor(private scoreService: ScoreService) {
    this.gold = new SpriteObserver(this.srcGold, 0, 0, 120, 5);
    this.subscription.add(
      this.gold.getSpriteIsLoad().subscribe((data: boolean) => {
        if (data) {
          this.changeIfGoldIsActivate(data);
          this.setMinWidthToAppear(this.gold.getWidthWindows());
          this.gold.setX(this.minWidthToAppear);
          this.subscription.unsubscribe();
          this.startTimer();
        }
      })
    )
  }

  public getGold(): SpriteObserver {
    return this.gold;
  }

  public setMinWidthToAppear(newMinWidth: number): void {
    if (newMinWidth > 1920) {
      this.minWidthToAppear = newMinWidth + this.gold.getWidth() + 10;
    } else {
      this.minWidthToAppear = 1920 + this.gold.getWidth() + 10;
    }
  }

  public setYAccordingToPlateform(newY: number): void {
    this.gold.setY(newY - this.differenceHeightWithPlateform - this.gold.getHeight());
  }

  public disableGold(): void {
    this.isActivateSuject.next(false);
  }

  public enableGold(): void {
    if (!this.isActivateSuject.value) {
      this.isActivateSuject.next(true);
    }
    this.gold.setX(this.minWidthToAppear);
    this.gold.setImageSrc(this.srcGold);
  }

  public ifGoldOutsideWindow(): void {
    if (this.gold.getX() < -(this.gold.getWidth())) {
      this.enableGold();
    }
  }

  public forwardGold(): void {
    this.gold.setX(this.gold.getX() - this.gold.getSpeed());
  }

  public startTimer(): void {
    this.timer = setInterval(() => {
      this.forwardGold();
    }, 20)
  }

  public stopTimer(): void {
    clearInterval(this.timer);
  }

  private changeIfGoldIsActivate(state: boolean): void {
    this.isActivateSuject.next(state);
  }

  public getIfGoldIsActivate(): Observable<boolean> {
    return this.isActivate$;
  }

  public checkCollisionWithOtherSprite(sprite: SpriteObserver): void {
    if (this.isActivateSuject.value && this.gold.checkCollisionWithOtherSprite(sprite)) {
      this.isActivateSuject.next(false);
      this.scoreService.incrementScore();
    }
  }

}
