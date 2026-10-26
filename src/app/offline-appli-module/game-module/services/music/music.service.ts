import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Game music: only exists while the game page is open (start / stop), settings saved between games
@Injectable({
  providedIn: 'root'
})
export class MusicService {

  private readonly src: string = encodeURI('game/Nyan Cat.mp3');
  private readonly volumeKey: string = 'GAME_MUSIC_VOLUME';
  private readonly mutedKey: string = 'GAME_MUSIC_MUTED';
  private readonly defaultVolume: number = 0.5;
  private readonly unlockEvents: string[] = ['keydown', 'pointerdown'];

  private audio: HTMLAudioElement | null = null;

  // 0 to 1
  private volumeSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.readVolume());
  private volume$: Observable<number> = this.volumeSubject.asObservable();

  private mutedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem(this.mutedKey) === 'true');
  private muted$: Observable<boolean> = this.mutedSubject.asObservable();

  // if the browser blocked autoplay, the music starts on the first key press or click
  private readonly unlock = (): void => {
    this.removeUnlock();
    this.audio?.play().catch(() => undefined);
  };

  public getVolume(): Observable<number> {
    return this.volume$;
  }

  public getMuted(): Observable<boolean> {
    return this.muted$;
  }

  public start(): void {
    this.stop();
    this.audio = new Audio(this.src);
    this.audio.loop = true;
    this.applySettings();
    this.audio.play().catch(() => {
      this.unlockEvents.forEach((event: string) => window.addEventListener(event, this.unlock, { once: true }));
    });
  }

  // releases the audio completely, so nothing keeps playing or stays in memory outside the game
  public stop(): void {
    this.removeUnlock();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }

  // moving the volume up also turns the music back on
  public setVolume(volume: number): void {
    const value: number = Math.min(Math.max(volume, 0), 1);
    this.volumeSubject.next(value);
    localStorage.setItem(this.volumeKey, String(value));
    if (value > 0 && this.mutedSubject.value) {
      this.setMuted(false);
    }
    this.applySettings();
  }

  public toggleMuted(): void {
    this.setMuted(!this.mutedSubject.value);
  }

  private setMuted(muted: boolean): void {
    this.mutedSubject.next(muted);
    localStorage.setItem(this.mutedKey, String(muted));
    this.applySettings();
  }

  private applySettings(): void {
    if (this.audio) {
      this.audio.volume = this.volumeSubject.value;
      this.audio.muted = this.mutedSubject.value;
    }
  }

  private removeUnlock(): void {
    this.unlockEvents.forEach((event: string) => window.removeEventListener(event, this.unlock));
  }

  private readVolume(): number {
    const value: string | null = localStorage.getItem(this.volumeKey);
    const volume: number = value === null ? this.defaultVolume : Number(value);
    return Number.isFinite(volume) ? Math.min(Math.max(volume, 0), 1) : this.defaultVolume;
  }

}
