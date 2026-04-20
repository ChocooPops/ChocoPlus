import { Component, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { EpisodePosterComponent } from '../../../posters/episode-poster/episode-poster.component';
import { EpisodePosterLoadingComponent } from '../../../posters/episode-poster-loading/episode-poster-loading.component';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { SimilarPosterHorizontalComponent } from '../../../posters/similar-poster-horizontal/similar-poster-horizontal.component';
import { SimilarPosterHorizontalLoadingComponent } from '../../../posters/similar-poster-horizontal-loading/similar-poster-horizontal-loading.component';

@Component({
  selector: 'app-series-vertical-page',
  standalone: true,
  imports: [
    NgClass,
    EpisodePosterLoadingComponent,
    EpisodePosterComponent,
    SimilarPosterHorizontalComponent,
    SimilarPosterHorizontalLoadingComponent,
    DatePipe,
  ],
  templateUrl: './series-page.component.html',
  styleUrls: [
    './series-page.component.css',
    '../../../../../common-module/styles/animation.css',
    '../../media-page.css',
  ],
})
export class SeriesVerticalPageComponent extends SeriesPageAbstraction {

  date!: Date | null;
  type: boolean = true;

  onClickTypeSeasonsEpisodes(): void {
    this.type = true;
    this.onLoadEpisodeByIdOrIndex();
  }

  onClickTypeSimilarTitles(): void {
    this.type = false;
    this.fetchSimilarMovie();
  }

  protected resetInfoSpe(): void {
    this.date = null;
  }
  protected initSpe(): void {
    this.date = this.series.date || new Date();
  }
  protected fetchDataSpe(): void {
    if (this.type) {
      this.onClickTypeSeasonsEpisodes();
    } else {
      this.onClickTypeSimilarTitles();
    }
  }

}
