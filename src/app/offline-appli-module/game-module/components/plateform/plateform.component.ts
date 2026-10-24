import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlateformService } from '../../services/plateform/plateform.service';
import { AbstractElementComponent } from '../abstract-element.component';
import { SpriteObserver } from '../../services/sprite-observer.service';

@Component({
  selector: 'app-plateform',
  standalone: true,
  imports: [],
  templateUrl: './plateform.component.html',
  styleUrls: ['./plateform.component.css', '../../style/scroll.css']
})
export class PlateformComponent extends AbstractElementComponent {

  @ViewChild('imgComponent') imgComponent !: ElementRef;

  constructor(private plateformService: PlateformService) {
    super();
  }

  protected override getSpriteObserver(): SpriteObserver {
    return this.plateformService.getPlateform();
  }

  // Measures the actual ground position, used by the character and the entities
  onImageLoad(): void {
    if (this.plateformService.getPlateform().isLoad() && this.imgComponent) {
      this.plateformService.getPlateform().setComponent(this.imgComponent);
    }
  }

}
