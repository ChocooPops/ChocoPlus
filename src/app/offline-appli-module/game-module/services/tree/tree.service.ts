import { Injectable } from '@angular/core';
import { SpriteObserver } from '../sprite-observer.service';

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private srcYellowTree: string = 'game/tree-yellow.png';
  private srcBlueTree: string = 'game/tree-blue.png';
  private yellowTree: SpriteObserver = new SpriteObserver(this.srcYellowTree, 0, -45, 450, 60);
  private blueTree: SpriteObserver = new SpriteObserver(this.srcBlueTree, 0, -80, 420, 80);

  public getYellowTreeSprite(): SpriteObserver {
    return this.yellowTree;
  }

  public getBlueTreeSprite(): SpriteObserver {
    return this.blueTree;
  }

}
