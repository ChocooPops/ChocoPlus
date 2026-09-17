import { Component, Renderer2 } from '@angular/core';
import { GoldService } from '../../services/gold/gold.service';
import { AbstractElementComponent } from '../abstract-element.component';
import { SpriteModel } from '../../models/sprite.interface';
import { PlateformService } from '../../services/plateform/plateform.service';
import { CharacterService } from '../../services/character/character.service';

@Component({
  selector: 'app-gold',
  standalone: true,
  imports: [],
  templateUrl: './gold.component.html',
  styleUrls: ['./gold.component.css', '../../style/scroll.css']
})
export class GoldComponent extends AbstractElementComponent {

  public gold !: SpriteModel;
  public isActivate !: boolean;

  constructor(private goldService: GoldService,
    private plateformService: PlateformService,
    private characterService: CharacterService,
    render: Renderer2
  ) {
    super(render);
  }

  override ngOnInit(): void {
    this.subscription.add(
      this.goldService.getIfGoldIsActivate().subscribe((activation: boolean) => {
        this.isActivate = activation;
      })
    )
    this.subscription.add(
      this.goldService.getGold().getSprite().subscribe((sprite: SpriteModel) => {
        this.gold = sprite;
        this.goldService.checkCollisionWithOtherSprite(this.characterService.getCharacter());
        this.goldService.ifGoldOutsideWindow();
      })
    )
    this.subscription.add(
      this.plateformService.getPlateform().getSprite().subscribe((sprite: SpriteModel) => {
        if (sprite.offsetY) {
          this.goldService.setYAccordingToPlateform(sprite.offsetY);
        }
      })
    )
  }
}
