import { Component } from '@angular/core';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { SimilarPosterVerticalLoadingComponent } from '../../../posters/similar-poster-vertical-loading/similar-poster-vertical-loading.component';
import { EpisodePosterHorizontalViewComponent } from '../../../posters/episode-poster-horizontal-view/episode-poster-horizontal-view.component';
import { EpisodePosterHorizontalViewLoadingComponent } from '../../../posters/episode-poster-horizontal-view-loading/episode-poster-horizontal-view-loading.component';
import { FormatMediaPageModel } from '../../../../models/format-media-page-enum';
import { CreditPosterComponent } from '../../../posters/credit-poster/credit-poster.component';
import { CreditPosterLoadingComponent } from '../../../posters/credit-poster-loading/credit-poster-loading.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-series-horizontal-page',
  standalone: true,
  imports: [NgClass, TranslatePipe, EpisodePosterHorizontalViewComponent, EpisodePosterHorizontalViewLoadingComponent, CreditPosterComponent, CreditPosterLoadingComponent, SimilarPosterVerticalComponent, SimilarPosterVerticalLoadingComponent],
  templateUrl: './series-horizontal-page.component.html',
  styleUrls: ['./series-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class SeriesHorizontalPageComponent extends SeriesPageAbstraction {

  protected formatMediaPage: FormatMediaPageModel = FormatMediaPageModel.HORIZONTAL;
  
  protected resetInfoSpe(): void { }
  protected initSpe(): void { }

  protected fetchDataSpe(): void { 
    this.onLoadEpisodeByIdOrIndex();
    this.fetchSimilarMovie();
  }

}
