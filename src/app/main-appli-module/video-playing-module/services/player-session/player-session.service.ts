import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerLaunchRequest } from '../../models/player.interface';

// closed: nothing plays, full: the player covers the window, mini: small player in a corner while browsing
export type PlayerMode = 'closed' | 'full' | 'mini';

export interface PlayerSessionState {
  mode: PlayerMode,
  request: PlayerLaunchRequest | null,
  // Changes each time a media has to be loaded (same media launched again included)
  loadId: number
}

// The internal player is not a page: it is shown over the app (main and offline) by VideoPlayingComponent,
// which stays alive while switching between full screen and the mini player, so playback goes on while browsing.
@Injectable({
  providedIn: 'root'
})
export class PlayerSessionService {

  private readonly stateSubject = new BehaviorSubject<PlayerSessionState>({ mode: 'closed', request: null, loadId: 0 });
  public readonly state$: Observable<PlayerSessionState> = this.stateSubject.asObservable();

  public get mode(): PlayerMode {
    return this.stateSubject.value.mode;
  }

  // Plays a media in full screen. keepMode: stays in the mini player if it is open (next episode)
  public open(request: PlayerLaunchRequest, keepMode: boolean = false): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({
      mode: keepMode && current.mode === 'mini' ? 'mini' : 'full',
      request,
      loadId: current.loadId + 1
    });
  }

  public minimize(): void {
    this.setMode('mini');
  }

  public expand(): void {
    this.setMode('full');
  }

  public close(): void {
    const current = this.stateSubject.value;
    if (current.mode === 'closed') return;
    this.stateSubject.next({ mode: 'closed', request: null, loadId: current.loadId });
  }

  private setMode(mode: PlayerMode): void {
    const current = this.stateSubject.value;
    if (current.mode === 'closed' || current.mode === mode) return;
    this.stateSubject.next({ ...current, mode });
  }

}
