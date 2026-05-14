import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreditsTabService {


  private isBodyVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isBodyVisible$: Observable<boolean> = this.isBodyVisibleSubject.asObservable();

  public getIsBodyVisible(): Observable<boolean> {
    return this.isBodyVisible$;
  }

  public setIsBodyVisible(bool: boolean): void {
    this.isBodyVisibleSubject.next(bool);
  }

  constructor() { }
  
}
