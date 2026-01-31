import { Component } from '@angular/core';
import { ScoreService } from '../../services/score/score.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [],
  templateUrl: './score.component.html',
  styleUrl: './score.component.css'
})
export class ScoreComponent {

  public score!: string;
  private subscription: Subscription = new Subscription();

  constructor(private scoreService: ScoreService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.scoreService.getScore().subscribe(() => {
        this.score = this.scoreService.getScorePadStart();
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
