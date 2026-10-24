import { Component } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { SkyService } from '../../services/sky/sky.service';
import { SpriteObserver } from '../../services/sprite-observer.service';

@Component({
  selector: 'app-sky',
  standalone: true,
  imports: [],
  templateUrl: './sky.component.html',
  styleUrls: ['./sky.component.css', '../../style/scroll.css']
})
export class SkyComponent extends AbstractElementComponent {

  constructor(private skyService: SkyService) {
    super();
  }

  protected override getSpriteObserver(): SpriteObserver {
    return this.skyService.getSky();
  }

}
