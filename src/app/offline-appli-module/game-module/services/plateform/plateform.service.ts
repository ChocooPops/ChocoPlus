import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class PlateformService {

  private srcPlateform: string = 'game/plateform.png';
  // ground scrolling speed in px/s: reference for everything standing on it
  private plateform: SpriteObserver = new SpriteObserver(this.srcPlateform, 0, 0, 65, 200);

  public getPlateform(): SpriteObserver {
    return this.plateform;
  }

  public getGroundSpeed(): number {
    return this.plateform.getSpeed();
  }

  // Y of the top of the ground, null until the platform has been measured
  public getGroundY(): number | null {
    return this.plateform.getOffsetY() ?? null;
  }

}
