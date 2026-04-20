import { Component } from '@angular/core';
import { MoviePageAbstraction } from '../../movie-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { StaffPosterComponent } from '../../../posters/staff-poster/staff-poster.component';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { SimilarPosterVerticalLoadingComponent } from '../../../posters/similar-poster-vertical-loading/similar-poster-vertical-loading.component';
import { StaffPosterLoadingComponent } from '../../../posters/staff-poster-loading/staff-poster-loading.component';

@Component({
  selector: 'app-movie-horizontal-page',
  standalone: true,
  imports: [NgClass, StaffPosterComponent, StaffPosterLoadingComponent, SimilarPosterVerticalComponent, SimilarPosterVerticalLoadingComponent],
  templateUrl: './movie-horizontal-page.component.html',
  styleUrls: ['./movie-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MovieHorizontalPageComponent extends MoviePageAbstraction {

  protected resetInfoSpe(): void {}
  protected initSpe(): void {}

}
