import { Component, Renderer2, Input } from '@angular/core';
import { AbstractElementComponent } from '../abstract-element.component';
import { SpriteModel } from '../../models/sprite.interface';
import { CloudService } from '../../services/cloud/cloud.service';

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

  public cloud !: SpriteModel;

  constructor(private cloudService: CloudService,
    render: Renderer2
  ) {
    super(render);
  }

  ngAfterViewInit(): void {
    this.initializeCloud();
  }

  override ngOnInit(): void {
    this.initIteration(4);
    this.initializeCloud();
  }

  private initializeCloud(): void {
    this.subscription.add(
      this.cloudService.getCloudByIndice(this.index).getSprite().subscribe((sprite: SpriteModel) => {
        this.cloud = sprite;
        this.setAnimationScrolling(this.cloud);
      })
    )
  }

}
