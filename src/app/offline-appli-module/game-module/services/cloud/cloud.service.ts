import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class CloudService {

  private srcCloudImage: string[] = [
    'game/cloud-5.png',
    'game/cloud-4.png',
    'game/cloud-3.png',
    'game/cloud-2.png',
    'game/cloud-1.png',
  ];
  private clouds: SpriteObserver[] = [];

  constructor() {
    let speed: number = 70;
    let differenceSpeed: number = 10;
    this.srcCloudImage.forEach((src: string) => {
      const cloud: SpriteObserver = new SpriteObserver(src, 0, 0, 450, speed);
      this.clouds.push(cloud);
      speed -= differenceSpeed;
    });
  }

  public getCloudByIndice(index: number): SpriteObserver {
    if (index >= 0 && index < this.clouds.length) {
      return this.clouds[index];
    } else {
      return this.clouds[0];
    }
  }

}
