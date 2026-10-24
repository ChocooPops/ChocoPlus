import { Injectable, NgZone } from '@angular/core';
import { CharacterService } from '../character/character.service';
import { EntityService } from '../entity/entity.service';
import { GameStateService } from '../game-state/game-state.service';

@Injectable({
  providedIn: 'root'
})
export class GameLoopService {

  // avoids an animation jump when coming back from an inactive tab
  private readonly MAX_DELTA_TIME_S: number = 0.05;

  private frameId: number | null = null;
  private lastTimestamp: number | null = null;

  constructor(private readonly ngZone: NgZone,
    private readonly characterService: CharacterService,
    private readonly entityService: EntityService,
    private readonly gameStateService: GameStateService
  ) { }

  public start(): void {
    this.stop();
    this.ngZone.runOutsideAngular(() => {
      this.frameId = requestAnimationFrame(this.tick);
    });
  }

  public stop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.lastTimestamp = null;
  }

  public restart(): void {
    this.gameStateService.reset();
    this.characterService.reset();
    this.entityService.reset();
  }

  // Runs outside the Angular zone: change detection is only triggered while playing
  private readonly tick = (timestamp: number): void => {
    const deltaTime: number = this.lastTimestamp === null
      ? 0
      : Math.min((timestamp - this.lastTimestamp) / 1000, this.MAX_DELTA_TIME_S);
    this.lastTimestamp = timestamp;

    if (deltaTime > 0 && this.gameStateService.isPlaying()) {
      this.ngZone.run(() => {
        this.gameStateService.update(deltaTime);
        this.characterService.update(deltaTime);
        this.entityService.update(deltaTime);
      });
    }
    this.frameId = requestAnimationFrame(this.tick);
  };

}
