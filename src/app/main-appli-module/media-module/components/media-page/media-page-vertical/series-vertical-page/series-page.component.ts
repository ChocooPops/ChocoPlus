import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { DatePipe } from '@angular/common';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { SimilarPosterHorizontalComponent } from '../../../posters/similar-poster-horizontal/similar-poster-horizontal.component';
import { SimilarPosterHorizontalLoadingComponent } from '../../../posters/similar-poster-horizontal-loading/similar-poster-horizontal-loading.component';
import { EpisodePosterVerticalViewComponent } from '../../../posters/episode-poster-vertical-view/episode-poster-vertical-view.component';
import { EpisodePosterVerticalViewLoadingComponent } from '../../../posters/episode-poster-vertical-view-loading/episode-poster-vertical-view-loading.component';
import { FormatMediaPageModel } from '../../../../models/format-media-page-enum';
import { TranslatePipe } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { JobPipe } from '../../../../../../common-module/pipe/job.pipe';

@Component({
  selector: 'app-series-vertical-page',
  standalone: true,
  imports: [JobPipe, NgClass, TitleCasePipe, EpisodePosterVerticalViewComponent, EpisodePosterVerticalViewLoadingComponent, SimilarPosterHorizontalComponent, SimilarPosterHorizontalLoadingComponent, DatePipe, TranslatePipe],
  templateUrl: './series-page.component.html',
  styleUrls: ['./series-page.component.css', '../../../../../common-module/styles/animation.css', '../../media-page.css'],
})
export class SeriesVerticalPageComponent extends SeriesPageAbstraction {

  protected formatMediaPage: FormatMediaPageModel = FormatMediaPageModel.VERTICAL;
  
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
