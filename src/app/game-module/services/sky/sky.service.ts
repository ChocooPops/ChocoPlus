import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class SkyService {

  private srcSky: string = 'game/sky.png';
  private sky: SpriteObserver = new SpriteObserver(this.srcSky, 0, 0, 300, 400);

  public getSky(): SpriteObserver {
    return this.sky;
  }

}
