import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class CloudService {

  // from farthest to nearest, speed in px/s (parallax: farther = slower)
  private cloudLayers: { src: string, speed: number }[] = [
    { src: 'game/cloud-5.png', speed: 60 },
    { src: 'game/cloud-4.png', speed: 75 },
    { src: 'game/cloud-3.png', speed: 90 },
    { src: 'game/cloud-2.png', speed: 110 },
    { src: 'game/cloud-1.png', speed: 145 },
  ];
  private clouds: SpriteObserver[] = this.cloudLayers.map(
    (layer) => new SpriteObserver(layer.src, 0, 0, 450, layer.speed)
  );

  public getCloudByIndice(index: number): SpriteObserver {
    if (index >= 0 && index < this.clouds.length) {
      return this.clouds[index];
    } else {
      return this.clouds[0];
    }
  }

}
