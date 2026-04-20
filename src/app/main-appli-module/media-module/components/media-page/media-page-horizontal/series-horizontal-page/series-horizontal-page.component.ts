import { Component } from '@angular/core';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { StaffPosterComponent } from '../../../posters/staff-poster/staff-poster.component';
import { StaffPosterLoadingComponent } from '../../../posters/staff-poster-loading/staff-poster-loading.component';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { SimilarPosterVerticalLoadingComponent } from '../../../posters/similar-poster-vertical-loading/similar-poster-vertical-loading.component';

@Component({
  selector: 'app-series-horizontal-page',
  standalone: true,
  imports: [NgClass, StaffPosterComponent, StaffPosterLoadingComponent, SimilarPosterVerticalComponent, SimilarPosterVerticalLoadingComponent],
  templateUrl: './series-horizontal-page.component.html',
  styleUrl: './series-horizontal-page.component.css'
})
export class SeriesHorizontalPageComponent extends SeriesPageAbstraction {

  protected resetInfoSpe(): void { }
  protected initSpe(): void { }

  protected fetchDataSpe(): void { 
    this.onLoadEpisodeByIdOrIndex();
    this.fetchSimilarMovie();
  }

}
