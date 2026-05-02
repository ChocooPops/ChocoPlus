import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { OS } from '../../../launch-module/models/os.enum';
import { catchError, map, Observable, of } from 'rxjs';
import { VersionModel } from '../../../launch-module/models/version.interface';
import { HttpClient } from '@angular/common/http';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  private readonly currentOs: OS = OS.WINDOWS;
  private readonly apiUrlVersion: string = `${environment.apiUrlVersion}`;

  constructor(private readonly http: HttpClient) { }

  public async getCurrentVersion(): Promise<any> {
    return await window.electron.getVersion()
  }

  public async openExternalWindows(url: string): Promise<any> {
    return await window.electron.openExternal(url);
  }

  public fetchLastVersion(): Observable<VersionModel | null> {
    return this.http.get<any>(`${this.apiUrlVersion}/${this.currentOs.toLowerCase()}`).pipe(
      map((data: VersionModel) => {
        return data;
      }),
      catchError((error) => {
        return of(null)
      })
    )
  }

  public isVersionGreater(currentVersion: string, lastVersion: string): boolean {
    try {
      const a = currentVersion.split('.').map(Number);
      const b = lastVersion.split('.').map(Number);

      const maxLength = Math.max(a.length, b.length);

      for (let i = 0; i < maxLength; i++) {
        const num1 = a[i] ?? 0;
        const num2 = b[i] ?? 0;

        if (num1 > num2) return true;
        if (num1 < num2) return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

}
