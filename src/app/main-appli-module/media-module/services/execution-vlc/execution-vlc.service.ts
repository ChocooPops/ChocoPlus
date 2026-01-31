import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({
  providedIn: 'root'
})

export class ExecutionVLCService {

  async openVLCWithVideo(videoPath: string): Promise<void> {
    if (window.electron && typeof window.electron.openVLCWithVideo === 'function') {
      await window.electron.openVLCWithVideo(videoPath);
    }
  }

}
