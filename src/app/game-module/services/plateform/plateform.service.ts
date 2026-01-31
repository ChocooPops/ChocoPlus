import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class PlateformService {

  private srcPlateform: string = 'game/plateform.png';
  private plateform: SpriteObserver = new SpriteObserver(this.srcPlateform, 0, 0, 65, 20);

  public getPlateform(): SpriteObserver {
    return this.plateform;
  }

}
