import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class ElectronService {

  private isMaximizedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isMaximize$: Observable<boolean> = this.isMaximizedSubject.asObservable();

  constructor() {
    this.listenToWindowEvents();
  }

  public getIsMaximize(): Observable<boolean> {
    return this.isMaximize$;
  }

  async deleteCacheAndCookies(): Promise<void> {
    await window.electron.invoke('delete-cache');
  }
  async reloadWindow(): Promise<void> {
    await window.electron.invoke('reload-app');
  }
  async windowMinimize(): Promise<void> {
    await window.electron.invoke('window-minimize');
  }
  async windowMaximize(): Promise<boolean> {
    return await window.electron.invoke('window-maximize');
  }
  async windowClose(): Promise<void> {
    await window.electron.invoke('window-close');
  }

  private listenToWindowEvents() {
    window.electron.onMaximize(() => this.isMaximizedSubject.next(true));
    window.electron.onUnmaximize(() => this.isMaximizedSubject.next(false));
  }

}
