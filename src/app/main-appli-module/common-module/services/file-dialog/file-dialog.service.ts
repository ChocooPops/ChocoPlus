import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileDialogService {

  constructor() { }

  async openFileDialog(): Promise<string | undefined> {
    return await (window as any).electron.invoke('open-file-dialog');
  }
}
