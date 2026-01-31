import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HiddenComponentService {

  private componentMustBeHiddenSuject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private componentMustBeHidden$: Observable<boolean> = this.componentMustBeHiddenSuject.asObservable();

  public hiddenComponent(): void {
    this.componentMustBeHiddenSuject.next(true);
  }
  public displayComponent(): void {
    this.componentMustBeHiddenSuject.next(false);
  }
  public getIfComponentMustHidden(): Observable<boolean> {
    return this.componentMustBeHidden$;
  }

  constructor() { }
}
