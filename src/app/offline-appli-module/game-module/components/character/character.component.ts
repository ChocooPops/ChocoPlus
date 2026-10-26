import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpriteModel } from '../../models/sprite.interface';
import { CharacterService } from '../../services/character/character.service';
import { GameStateService } from '../../services/game-state/game-state.service';

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.css', '../../style/scroll.css']
})
export class CharacterComponent implements OnInit, OnDestroy {

  // 'rainbow' = only the rainbow, drawn behind every other sprite; 'character' = the cat and its sparks
  @Input() layer: 'rainbow' | 'character' = 'character';

  character!: SpriteModel;
  sparks !: SpriteModel;
  rainbow !: SpriteModel;
  invincible: boolean = false;

  private subscription: Subscription = new Subscription();

  constructor(private characterService: CharacterService,
    private gameStateService: GameStateService
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.characterService.getCharacter().getSprite().subscribe((sprite: SpriteModel) => {
        this.character = sprite;
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
      this.gameStateService.getIsInvincible().subscribe((invincible: boolean) => {
        this.invincible = invincible;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
