import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundVideoService {

  private readonly soundVideoKey: string = 'SOUND_VIDEO';
  private readonly defaultVolume: number = 0.5;

  private sessionVolume: number | null = null;

  public setSoundVideo(state: boolean): void {
    localStorage.setItem(this.soundVideoKey, String(state));
    this.sessionVolume = null;
  }

  public getSoundVideo(): boolean {
    const value: string | null = localStorage.getItem(this.soundVideoKey);
    if (value === null) {
      return false;
    }
    return value === 'true';
  }

  public setSessionVolume(volume: number): void {
    this.sessionVolume = volume;
  }

  public getInitialVolume(): number {
    if (this.sessionVolume !== null) {
      return this.sessionVolume;
    }
    return this.getSoundVideo() ? this.defaultVolume : 0;
  }

}
