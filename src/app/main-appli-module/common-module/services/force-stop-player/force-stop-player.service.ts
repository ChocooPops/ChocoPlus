import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class ForceStopPlayerService {

  public async setForceStopPlayer(state: boolean): Promise<void> {
    await window.electron.setForceStopPlayer(state);
  }

  public async getForceStopPlayer(): Promise<boolean> {
    return await window.electron.getForceStopPlayer();
  }

}
