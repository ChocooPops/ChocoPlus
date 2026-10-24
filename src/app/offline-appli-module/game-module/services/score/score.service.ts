import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  private readonly bestScoreKey: string = 'GAME_BEST_SCORE';

  private scoreSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private score$: Observable<number> = this.scoreSubject.asObservable();

  private killsSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private kills$: Observable<number> = this.killsSubject.asObservable();

  private bestScoreSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.readBestScore());
  private bestScore$: Observable<number> = this.bestScoreSubject.asObservable();

  public getScore(): Observable<number> {
    return this.score$;
  }

  public getBestScore(): Observable<number> {
    return this.bestScore$;
  }

  public getKills(): Observable<number> {
    return this.kills$;
  }

  public addKill(): void {
    this.killsSubject.next(this.killsSubject.value + 1);
  }

  public addScore(points: number = 1): void {
    this.scoreSubject.next(this.scoreSubject.value + points);
  }

  public reset(): void {
    this.scoreSubject.next(0);
    this.killsSubject.next(0);
  }

  public saveBestScore(): void {
    if (this.scoreSubject.value > this.bestScoreSubject.value) {
      this.bestScoreSubject.next(this.scoreSubject.value);
      localStorage.setItem(this.bestScoreKey, String(this.scoreSubject.value));
    }
  }

  public getScorePadStart(): string {
    return this.scoreSubject.value.toString().padStart(5, '0');
  }

  private readBestScore(): number {
    const value: number = Number(localStorage.getItem(this.bestScoreKey));
    return Number.isFinite(value) ? value : 0;
  }

}
