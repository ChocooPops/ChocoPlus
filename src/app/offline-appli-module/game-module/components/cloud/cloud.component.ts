import { Component, Input } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { CloudService } from '../../services/cloud/cloud.service';
import { SpriteObserver } from '../../services/sprite-observer.service';

@Component({
  selector: 'app-cloud',
  standalone: true,
  imports: [],
  templateUrl: './cloud.component.html',
  styleUrls: ['./cloud.component.css', '../../style/scroll.css']
})
export class CloudComponent extends AbstractElementComponent {

  @Input()
  index: number = 0;

  constructor(private cloudService: CloudService) {
    super();
  }

  protected override getSpriteObserver(): SpriteObserver {
    return this.cloudService.getCloudByIndice(this.index);
  }

}
