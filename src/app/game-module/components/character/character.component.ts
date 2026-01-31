import { Component, HostListener, Renderer2 } from '@angular/core';
import { SpriteModel } from '../../models/sprite.interface';
import { CharacterService } from '../../services/character/character.service';
import { PlateformService } from '../../services/plateform/plateform.service';
import { AbstractElementComponent } from '../abstract-element.component';

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.css', '../../style/scroll.css']
})
export class CharacterComponent extends AbstractElementComponent {

  character!: SpriteModel;
  sparks !: SpriteModel;
  rainbow !: SpriteModel;

  constructor(private characterService: CharacterService,
    private plateformService: PlateformService,
    render: Renderer2
  ) {
    super(render);
  }

  override ngOnInit(): void {
    this.subscription.add(
      this.characterService.getCharacter().getSprite().subscribe((sprite: SpriteModel) => {
        this.character = sprite;
        this.characterService.setSparks();
        this.characterService.setRainbow();
      })
    )
    this.subscription.add(
      this.characterService.getRainbow().getSprite().subscribe((sprite: SpriteModel) => {
        this.rainbow = sprite;
      })
    )
    this.subscription.add(
      this.characterService.getSparks().getSprite().subscribe((sprite: SpriteModel) => {
        this.sparks = sprite;
      })
    )
    this.subscription.add(
      this.plateformService.getPlateform().getSprite().subscribe((sprite: SpriteModel) => {
        if (sprite.offsetY) {
          this.characterService.setYAccordingToPlateform(sprite.offsetY);
        }
      })
    )
    this.characterService.startTimer();
  }

  @HostListener('window:keydown', ['$event'])
  async onKeyDown(event: KeyboardEvent): Promise<void> {
    if (event.key === 'ArrowLeft') {
      this.characterService.setKeyLeft(true);
    }
    if (event.key === 'ArrowRight') {
      this.characterService.setKeyRight(true);
    }
    if (event.key === ' ') {
      this.characterService.setKeySpace(true);
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.characterService.setKeyLeft(false);
    }
    if (event.key === 'ArrowRight') {
      this.characterService.setKeyRight(false);
    }
  }

}
