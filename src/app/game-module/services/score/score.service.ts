import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  private scoreSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private score$: Observable<number> = this.scoreSubject.asObservable();

  public getScore(): Observable<number> {
    return this.score$;
  }

  public incrementScore(): void {
    const newScore: number = this.scoreSubject.value + 1;
    this.scoreSubject.next(newScore);
  }

  public getScorePadStart(): string {
    return this.scoreSubject.value.toString().padStart(5, '0');
  }

}
