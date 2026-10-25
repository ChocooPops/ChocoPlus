import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { StarsComponent } from './components/stars/stars.component';
import { PlateformComponent } from './components/plateform/plateform.component';
import { SkyComponent } from './components/sky/sky.component';
import { CloudComponent } from './components/cloud/cloud.component';
import { CharacterComponent } from './components/character/character.component';
import { TreeComponent } from './components/tree/tree.component';
import { EntitiesComponent } from './components/entities/entities.component';
import { ScoreComponent } from './components/score/score.component';
import { LivesComponent } from './components/lives/lives.component';
import { GameOverlayComponent } from './components/game-overlay/game-overlay.component';
import { PlateformService } from './services/plateform/plateform.service';
import { CharacterService } from './services/character/character.service';
import { EntityService } from './services/entity/entity.service';
import { GameLoopService } from './services/game-loop/game-loop.service';
import { GameStateService } from './services/game-state/game-state.service';
import { GameStatus } from './models/game-entity.interface';
import { MenuTabService } from '../../main-appli-module/menu-module/service/menu-tab/menu-tab.service';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [TranslatePipe, StarsComponent, ScoreComponent, LivesComponent, GameOverlayComponent, TreeComponent, EntitiesComponent, PlateformComponent, SkyComponent, CloudComponent, CharacterComponent],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent implements OnInit, OnDestroy {

  public readonly cloudIndexes: number[] = [0, 1, 2, 3, 4];
  public status: GameStatus = 'playing';

  private subscription: Subscription = new Subscription();

  constructor(private readonly plateformService: PlateformService,
    private readonly characterService: CharacterService,
    private readonly entityService: EntityService,
    private readonly gameLoopService: GameLoopService,
    private readonly gameStateService: GameStateService,
    private readonly menuTabService: MenuTabService
  ) {
    this.menuTabService.setActivateTransition(true);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.gameStateService.getStatus().subscribe((status: GameStatus) => {
        this.status = status;
      })
    )
    this.gameLoopService.restart();
    this.gameLoopService.start();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.gameLoopService.stop();
    this.characterService.releaseKeys();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const width: number = (event.target as Window).innerWidth;
    this.plateformService.getPlateform().setClientRectCharacter();
    this.characterService.getCharacter().setWidthWindows(width);
    this.entityService.setWidthWindows(width);
  }

  public onTogglePause(): void {
    this.characterService.releaseKeys();
    this.gameStateService.togglePause();
  }

  @HostListener('window:blur')
  onBlur(): void {
    this.characterService.releaseKeys();
    this.gameStateService.pause();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Alt + arrows is reserved for the app navigation
    if (event.altKey) {
      return;
    }
    if (this.gameStateService.isGameOver()) {
      if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
        this.gameLoopService.restart();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.characterService.setKeyLeft(true);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.characterService.setKeyRight(true);
        break;
      case ' ':
      case 'ArrowUp':
        event.preventDefault();
        this.characterService.setKeyJump(true);
        break;
      case 'p':
      case 'P':
      case 'Pause':
      case 'Escape':
        if (!event.repeat) {
          this.onTogglePause();
        }
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.characterService.setKeyLeft(false);
        break;
      case 'ArrowRight':
        this.characterService.setKeyRight(false);
        break;
      case ' ':
      case 'ArrowUp':
        this.characterService.setKeyJump(false);
        break;
    }
  }

}
