import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private srcYellowTree: string = 'game/tree-yellow.png';
  private srcBlueTree: string = 'game/tree-blue.png';
  // yellow in the foreground: faster than the ground (200 px/s)
  private yellowTree: SpriteObserver = new SpriteObserver(this.srcYellowTree, 0, -45, 450, 300);
  // blue behind the character: slower than the ground
  private blueTree: SpriteObserver = new SpriteObserver(this.srcBlueTree, 0, -80, 420, 170);

  public getYellowTreeSprite(): SpriteObserver {
    return this.yellowTree;
  }

  public getBlueTreeSprite(): SpriteObserver {
    return this.blueTree;
  }

}
