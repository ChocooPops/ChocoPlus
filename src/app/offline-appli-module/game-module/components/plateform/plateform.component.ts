import { Component, Renderer2, HostListener } from '@angular/core';
import { PlateformService } from '../../services/plateform/plateform.service';
import { AbstractElementComponent } from '../abstract-element.component';
import { SpriteModel } from '../../models/sprite.interface';

@Component({
  selector: 'app-plateform',
  standalone: true,
  imports: [],
  templateUrl: './plateform.component.html',
  styleUrls: ['./plateform.component.css', '../../style/scroll.css']
})
export class PlateformComponent extends AbstractElementComponent {

  public plateform !: SpriteModel;

  constructor(private plateformService: PlateformService,
    render: Renderer2
  ) {
    super(render);
  }

  override ngOnInit(): void {
    this.initIteration(4);
    this.plateformService.getPlateform().getSprite().subscribe((sprite: SpriteModel) => {
      this.plateform = sprite;
      this.setAnimationScrolling(this.plateform);
    });
  }

  onImageLoad(): void {
    if (this.plateformService.getPlateform().isLoad()) {
      this.plateformService.getPlateform().setComponent(this.imgComponent);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.plateformService.getPlateform().setClientRectCharacter();
  }
}
