import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { OS } from '../../../launch-module/models/os.enum';
import { catchError, map, Observable, of } from 'rxjs';
import { VersionModel } from '../../../launch-module/models/version.interface';
import { HttpClient } from '@angular/common/http';
import { now } from 'd3';
import { MessageReturnedModel } from '../../models/message-returned.interface';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  private id: number = 0;
  private currentVersion!: string;
  private lastVersion: VersionModel | null = null;
  private readonly currentOs: OS = OS.WINDOWS;
  private readonly apiUrlVersion: string = `${environment.apiUrlVersion}`;

  constructor(private readonly http: HttpClient) { }

  public async getCurrentVersion(): Promise<string> {
    if (!this.currentVersion) {
      this.currentVersion = await window.electron.getVersion();
    }
    return this.currentVersion;
  }

  public async openExternalWindows(url: string): Promise<any> {
    return await window.electron.openExternal(url);
  }

  private getDefaultVersion(os: OS): VersionModel {
    return {
      id: this.id++,
      num: '1.0.0',
      os: os,
      link: 'NULL',
      createdAt: new Date(now()),
      updatedAt: new Date(now())
    }
  }

  public fetchLastVersion(): Observable<VersionModel | null> {
    if (this.lastVersion) {
      return of(this.lastVersion);      
    }
    return this.http.get<any>(`${this.apiUrlVersion}/${this.currentOs.toLowerCase()}`).pipe(
      map((data: VersionModel) => {
        this.lastVersion = data;
        return this.lastVersion;
      }),
      catchError((error) => {
        return of(null)
      })
    )
  }

  public fetchAllLastVersion(): Observable<VersionModel[]> {
    return this.http.get<any>(`${this.apiUrlVersion}/all`).pipe(
      map((data: VersionModel[]) => {
        return this.formatedVersion(data);
      }),
      catchError((error: any) => {
        return of([]);
      })
    )
  }

  public fetchUpdateVersionByOs(version: VersionModel): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlVersion}`, version).pipe(
      map((data: MessageReturnedModel) => {
        return data;
      })
    )
  }

  public formatedVersion(version: VersionModel[]): VersionModel[] {
    const lastVersions: VersionModel[] = [];
    const windows: VersionModel | undefined = version.find((item) => item.os === OS.WINDOWS);
    const linux: VersionModel | undefined = version.find((item) => item.os === OS.LINUX);
    const macOs: VersionModel | undefined = version.find((item) => item.os === OS.MACOS);

    if (windows) {
      lastVersions.push(windows);
    } else {
      lastVersions.push(this.getDefaultVersion(OS.WINDOWS));
    }
    if (linux) {
      lastVersions.push(linux);
    } else {
      lastVersions.push(this.getDefaultVersion(OS.LINUX));
    }
    if (macOs) {
      lastVersions.push(macOs);
    } else {
      lastVersions.push(this.getDefaultVersion(OS.MACOS));
    }
    return lastVersions;
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
