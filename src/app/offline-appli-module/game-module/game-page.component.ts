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
import { SpriteSelectionComponent } from './components/sprite-selection/sprite-selection.component';
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
  imports: [TranslatePipe, StarsComponent, ScoreComponent, LivesComponent, GameOverlayComponent, SpriteSelectionComponent, TreeComponent, EntitiesComponent, PlateformComponent, SkyComponent, CloudComponent, CharacterComponent],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent implements OnInit, OnDestroy {

  public readonly cloudIndexes: number[] = [0, 1, 2, 3, 4];
  public status: GameStatus = 'playing';
  public spriteSelectionOpen: boolean = false;
  public trippy: boolean = false;
  // the game is resumed on closing only if the panel paused it
  private pausedBySpriteSelection: boolean = false;

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
    this.subscription.add(
      this.gameStateService.getIsTrippy().subscribe((trippy: boolean) => {
        this.trippy = trippy;
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

  public onRestart(): void {
    this.gameLoopService.restart();
  }

  public onOpenSpriteSelection(): void {
    this.characterService.releaseKeys();
    this.pausedBySpriteSelection = this.gameStateService.isPlaying();
    this.gameStateService.pause();
    this.spriteSelectionOpen = true;
  }

  public onCloseSpriteSelection(): void {
    this.spriteSelectionOpen = false;
    if (this.pausedBySpriteSelection) {
      this.gameStateService.resume();
    }
    this.pausedBySpriteSelection = false;
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
    const key: string = event.key.toLowerCase();
    // the sprite panel takes the keyboard: only Escape or O (close) do something
    if (this.spriteSelectionOpen) {
      if (!event.repeat && (event.key === 'Escape' || key === 'o')) {
        this.onCloseSpriteSelection();
      }
      return;
    }
    // shortcuts: R = restart, O = sprite options (Ctrl / Cmd combinations are left to the app)
    if (!event.repeat && !event.ctrlKey && !event.metaKey && (key === 'r' || key === 'o')) {
      if (key === 'r') {
        this.onRestart();
      } else {
        this.onOpenSpriteSelection();
      }
      return;
    }
    if (this.gameStateService.isGameOver()) {
      // Enter only: Space is the jump key and would restart by accident right after dying
      if (!event.repeat && event.key === 'Enter') {
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
      case 'Pause':
      case 'Escape':
        if (!event.repeat) {
          this.characterService.releaseKeys();
          this.gameStateService.pause();
        }
        break;
      // only Enter resumes a paused game
      case 'Enter':
        if (!event.repeat) {
          this.gameStateService.resume();
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
