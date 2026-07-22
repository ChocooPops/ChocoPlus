import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerifUserAlreadyConnectedService {

  private isConnectedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isConnected$: Observable<boolean> = this.isConnectedSubject.asObservable();

  constructor() { }

  public getIfUserIsAlreadyConnected(): Observable<boolean> {
    return this.isConnected$;
  }

  public setUserConnected(bool: boolean): void {
    this.isConnectedSubject.next(bool);
  }

}
