import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameStatus } from '../../models/game-entity.interface';
import { ScoreService } from '../score/score.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  public readonly START_LIVES: number = 3;
  public readonly MAX_LIVES: number = 5;
  private readonly INVINCIBILITY_DURATION_S: number = 1.5;
  private readonly LUCKY_DURATION_S: number = 8;

  private livesSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.START_LIVES);
  private lives$: Observable<number> = this.livesSubject.asObservable();

  private statusSubject: BehaviorSubject<GameStatus> = new BehaviorSubject<GameStatus>('playing');
  private status$: Observable<GameStatus> = this.statusSubject.asObservable();

  private invincibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private invincible$: Observable<boolean> = this.invincibleSubject.asObservable();

  // remaining luck seconds, rounded up (0 = inactive)
  private luckySubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private lucky$: Observable<number> = this.luckySubject.asObservable();

  // hallucinogenic screen filter (nyansnoop)
  private trippySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private trippy$: Observable<boolean> = this.trippySubject.asObservable();
  private trippyTimer: number = 0;

  private invincibilityTimer: number = 0;
  private luckyTimer: number = 0;
  private elapsedTime: number = 0;

  constructor(private readonly scoreService: ScoreService) { }

  public getLives(): Observable<number> {
    return this.lives$;
  }

  public getStatus(): Observable<GameStatus> {
    return this.status$;
  }

  public getIsInvincible(): Observable<boolean> {
    return this.invincible$;
  }

  public getLuckySeconds(): Observable<number> {
    return this.lucky$;
  }

  public isLucky(): boolean {
    return this.luckyTimer > 0;
  }

  public getIsTrippy(): Observable<boolean> {
    return this.trippy$;
  }

  // touching it again restarts the full duration
  public startTrippy(duration: number): void {
    this.trippyTimer = duration;
    if (!this.trippySubject.value) {
      this.trippySubject.next(true);
    }
  }

  public startLucky(): void {
    this.luckyTimer = this.LUCKY_DURATION_S;
    this.luckySubject.next(Math.ceil(this.luckyTimer));
  }

  public isPlaying(): boolean {
    return this.statusSubject.value === 'playing';
  }

  public isGameOver(): boolean {
    return this.statusSubject.value === 'gameover';
  }

  // Elapsed play time in seconds, used for the progressive difficulty
  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  public reset(): void {
    this.livesSubject.next(this.START_LIVES);
    this.invincibilityTimer = 0;
    this.invincibleSubject.next(false);
    this.luckyTimer = 0;
    this.luckySubject.next(0);
    this.trippyTimer = 0;
    this.trippySubject.next(false);
    this.elapsedTime = 0;
    // a game restarted before its end may still hold a new best score
    this.scoreService.saveBestScore();
    this.scoreService.reset();
    this.statusSubject.next('playing');
  }

  public update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;
      if (this.invincibilityTimer <= 0) {
        this.invincibleSubject.next(false);
      }
    }
    if (this.trippyTimer > 0) {
      this.trippyTimer -= deltaTime;
      if (this.trippyTimer <= 0) {
        this.trippySubject.next(false);
      }
    }
    if (this.luckyTimer > 0) {
      this.luckyTimer = Math.max(this.luckyTimer - deltaTime, 0);
      const seconds: number = Math.ceil(this.luckyTimer);
      if (seconds !== this.luckySubject.value) {
        this.luckySubject.next(seconds);
      }
    }
  }

  public hurt(): void {
    if (!this.isPlaying() || this.invincibleSubject.value) {
      return;
    }
    const lives: number = this.livesSubject.value - 1;
    this.livesSubject.next(lives);
    if (lives <= 0) {
      this.scoreService.saveBestScore();
      this.statusSubject.next('gameover');
    } else {
      this.invincibilityTimer = this.INVINCIBILITY_DURATION_S;
      this.invincibleSubject.next(true);
    }
  }

  // Returns false if lives are already at the maximum
  public addLife(): boolean {
    if (this.livesSubject.value >= this.MAX_LIVES) {
      return false;
    }
    this.livesSubject.next(this.livesSubject.value + 1);
    return true;
  }

  public pause(): void {
    if (this.isPlaying()) {
      this.statusSubject.next('paused');
    }
  }

  public resume(): void {
    if (this.statusSubject.value === 'paused') {
      this.statusSubject.next('playing');
    }
  }

  public togglePause(): void {
    if (this.statusSubject.value === 'paused') {
      this.statusSubject.next('playing');
    } else {
      this.pause();
    }
  }

}
