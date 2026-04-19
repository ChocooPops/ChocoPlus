import { Component, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { SimilarPosterComponent } from '../../../posters/similar-poster/similar-poster.component';
import { SimilarPosterLoadingComponent } from '../../../posters/similar-poster-loading/similar-poster-loading.component';
import { DatePipe } from '@angular/common';
import { EpisodePosterComponent } from '../../../posters/episode-poster/episode-poster.component';
import { EpisodePosterLoadingComponent } from '../../../posters/episode-poster-loading/episode-poster-loading.component';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';

@Component({
  selector: 'app-series-vertical-page',
  standalone: true,
  imports: [
    NgClass,
    EpisodePosterLoadingComponent,
    EpisodePosterComponent,
    SimilarPosterComponent,
    SimilarPosterLoadingComponent,
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
  @ViewChild(EpisodePosterComponent) episodePoster!: EpisodePosterComponent;

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
