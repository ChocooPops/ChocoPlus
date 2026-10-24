import { Component, Input } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { TreeService } from '../../services/tree/tree.service';
import { SpriteObserver } from '../../services/sprite-observer.service';

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [],
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css', '../../style/scroll.css']
})
export class TreeComponent extends AbstractElementComponent {

  @Input() type: boolean = true;

  constructor(private treeService: TreeService) {
    super();
  }

  protected override getSpriteObserver(): SpriteObserver {
    return this.type ? this.treeService.getBlueTreeSprite() : this.treeService.getYellowTreeSprite();
  }

}
