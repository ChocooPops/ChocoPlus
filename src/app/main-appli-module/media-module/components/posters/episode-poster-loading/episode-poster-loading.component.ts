import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-episode-poster-loading',
  standalone: true,
  imports: [NgClass],
  templateUrl: './episode-poster-loading.component.html',
  styleUrls: ['./episode-poster-loading.component.css', '../episode-poster/episode-poster.component.css', '../../../../common-module/styles/animation.css']
})
export class EpisodePosterLoadingComponent {

  episodes: number[] = [];
  @Input() notRunning: boolean = true;

  ngOnInit(): void {
    for (let i = 0; i < 5; i++) {
      this.episodes.push(i);
    }
  }

}
