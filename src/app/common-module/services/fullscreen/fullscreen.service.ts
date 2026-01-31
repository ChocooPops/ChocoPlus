import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

declare const window: any;

@Injectable({
  providedIn: 'root'
})

export class FullscreenService {

  private isFullScreenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private isFullScreen$: Observable<boolean> = this.isFullScreenSubject.asObservable();

  async initFullScreen(): Promise<void> {
    this.isFullScreenSubject.next(await window.electron.invoke('is-fullscreen'));
  }

  async toggleFullScreen(): Promise<void> {
    if (window.electron) {
      this.isFullScreenSubject.next(await window.electron.invoke('toggle-fullscreen'));
    }
  }

  async disableFullScreen(): Promise<void> {
    this.isFullScreenSubject.next(false);
    await window.electron.invoke('disable-fullscreen');
  }

  getIfScreenIsFull(): Observable<boolean> {
    return this.isFullScreen$;
  }

}
