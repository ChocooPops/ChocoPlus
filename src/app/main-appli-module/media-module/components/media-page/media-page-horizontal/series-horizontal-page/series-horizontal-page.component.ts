import { Component } from '@angular/core';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { StaffPosterComponent } from '../../../posters/staff-poster/staff-poster.component';
import { StaffPosterLoadingComponent } from '../../../posters/staff-poster-loading/staff-poster-loading.component';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { SimilarPosterVerticalLoadingComponent } from '../../../posters/similar-poster-vertical-loading/similar-poster-vertical-loading.component';
import { EpisodePosterHorizontalViewComponent } from '../../../posters/episode-poster-horizontal-view/episode-poster-horizontal-view.component';
import { EpisodePosterHorizontalViewLoadingComponent } from '../../../posters/episode-poster-horizontal-view-loading/episode-poster-horizontal-view-loading.component';
import { FormatMediaPageModel } from '../../../../models/format-media-page-enum';

@Component({
  selector: 'app-series-horizontal-page',
  standalone: true,
  imports: [NgClass, EpisodePosterHorizontalViewComponent, EpisodePosterHorizontalViewLoadingComponent, StaffPosterComponent, StaffPosterLoadingComponent, SimilarPosterVerticalComponent, SimilarPosterVerticalLoadingComponent],
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
