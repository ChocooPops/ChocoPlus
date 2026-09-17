import { Component, Renderer2 } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { SkyService } from '../../services/sky/sky.service';
import { SpriteModel } from '../../models/sprite.interface';

@Component({
  selector: 'app-sky',
  standalone: true,
  imports: [],
  templateUrl: './sky.component.html',
  styleUrls: ['./sky.component.css', '../../style/scroll.css']
})
export class SkyComponent extends AbstractElementComponent {

  public sprite !: SpriteModel;

  constructor(private skyService: SkyService,
    render: Renderer2
  ) {
    super(render)
  }

  ngAfterViewInit(): void {
    this.skyService.getSky().getSprite().subscribe((data: SpriteModel) => {
      this.sprite = data;
      this.setAnimationScrolling(this.sprite);
    })
  }

  override ngOnInit(): void {
    this.initIteration(4);
    this.skyService.getSky().getSprite().subscribe((data: SpriteModel) => {
      this.sprite = data;
      this.setAnimationScrolling(this.sprite);
    })
  }

}
