import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaLogoDisplayService {

  private readonly showLogoKey: string = 'SHOW_MEDIA_LOGO';

  public setShowLogo(state: boolean): void {
    localStorage.setItem(this.showLogoKey, String(state));
  }

  public getShowLogo(): boolean {
    const value: string | null = localStorage.getItem(this.showLogoKey);
    if (value === null) {
      return true;
    }
    return value === 'true';
  }

}
