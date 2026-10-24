import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameStateService } from '../../services/game-state/game-state.service';
import { ENTITY_CONFIGS } from '../../models/entity-config';

@Component({
  selector: 'app-lives',
  standalone: true,
  imports: [],
  templateUrl: './lives.component.html',
  styleUrl: './lives.component.css'
})
export class LivesComponent implements OnInit, OnDestroy {

  public lives: number = 0;
  public slots: number[];
  public luckySeconds: number = 0;
  public readonly srcLucky: string = ENTITY_CONFIGS.paddy.src;

  private subscription: Subscription = new Subscription();

  constructor(private gameStateService: GameStateService) {
    this.slots = Array.from({ length: this.gameStateService.MAX_LIVES }, (_, index: number) => index);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.gameStateService.getLives().subscribe((lives: number) => {
        this.lives = lives;
      })
    )
    this.subscription.add(
      this.gameStateService.getLuckySeconds().subscribe((seconds: number) => {
        this.luckySeconds = seconds;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
