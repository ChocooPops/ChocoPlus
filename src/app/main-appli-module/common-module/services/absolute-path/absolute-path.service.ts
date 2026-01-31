import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AbsolutePathService {
  private ipcRenderer: any;

  constructor() {
    if ((window as any).require) {
      try {
        this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      } catch (e) {
        throw new Error('Electron\'s IPC could not be loaded.');
      }
    } else {
      console.warn('Electron\'s IPC is not available in this environment.');
    }
  }

  getFilePath(relativePath: string): Promise<string> {
    if (!this.ipcRenderer) {
      return Promise.reject('IPC Renderer is not available.');
    }

    return this.ipcRenderer.invoke('get-file-path', relativePath);
  }
}
