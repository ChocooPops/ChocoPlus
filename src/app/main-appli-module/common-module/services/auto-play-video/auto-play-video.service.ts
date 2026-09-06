import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutoPlayVideoService {

  private readonly autoPlayVideoKey: string = 'AUTO_PLAY_VIDEO';

  public setAutoPlayVideo(state: boolean): void {
    localStorage.setItem(this.autoPlayVideoKey, String(state));
  }

  public getAutoPlayVideo(): boolean {
    const value: string | null = localStorage.getItem(this.autoPlayVideoKey);
    if (value === null) {
      return true;
    }
    return value === 'true';
  }

}
