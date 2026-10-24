import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { GameStatus } from '../../models/game-entity.interface';
import { GameStateService } from '../../services/game-state/game-state.service';
import { ScoreService } from '../../services/score/score.service';

@Component({
  selector: 'app-game-overlay',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './game-overlay.component.html',
  styleUrl: './game-overlay.component.css'
})
export class GameOverlayComponent implements OnInit, OnDestroy {

  public status: GameStatus = 'playing';
  public score: number = 0;
  public bestScore: number = 0;
  public kills: number = 0;

  private subscription: Subscription = new Subscription();

  constructor(private gameStateService: GameStateService,
    private scoreService: ScoreService
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.gameStateService.getStatus().subscribe((status: GameStatus) => {
        this.status = status;
      })
    )
    this.subscription.add(
      this.scoreService.getScore().subscribe((score: number) => {
        this.score = score;
      })
    )
    this.subscription.add(
      this.scoreService.getBestScore().subscribe((bestScore: number) => {
        this.bestScore = bestScore;
      })
    )
    this.subscription.add(
      this.scoreService.getKills().subscribe((kills: number) => {
        this.kills = kills;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
