import { Component } from '@angular/core';
import { MoviePageAbstraction } from '../../movie-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { SimilarPosterVerticalLoadingComponent } from '../../../posters/similar-poster-vertical-loading/similar-poster-vertical-loading.component';
import { FormatMediaPageModel } from '../../../../models/format-media-page-enum';
import { CreditPosterComponent } from '../../../posters/credit-poster/credit-poster.component';
import { CreditPosterLoadingComponent } from '../../../posters/credit-poster-loading/credit-poster-loading.component';

@Component({
  selector: 'app-movie-horizontal-page',
  standalone: true,
  imports: [NgClass, CreditPosterComponent, CreditPosterLoadingComponent, SimilarPosterVerticalComponent, SimilarPosterVerticalLoadingComponent],
  templateUrl: './movie-horizontal-page.component.html',
  styleUrls: ['./movie-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MovieHorizontalPageComponent extends MoviePageAbstraction {

  protected formatMediaPage: FormatMediaPageModel = FormatMediaPageModel.HORIZONTAL;
  
  protected resetInfoSpe(): void {}
  protected initSpe(): void {}

}
