import { Component } from '@angular/core';
import { MoviePageAbstraction } from '../../movie-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { StaffPosterComponent } from '../../../posters/staff-poster/staff-poster.component';
import { SimilarPosterVerticalComponent } from '../../../posters/similar-poster-vertical/similar-poster-vertical.component';
import { MediaModel } from '../../../../models/media.interface';

@Component({
  selector: 'app-movie-horizontal-page',
  standalone: true,
  imports: [NgClass, StaffPosterComponent, SimilarPosterVerticalComponent],
  templateUrl: './movie-horizontal-page.component.html',
  styleUrls: ['./movie-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MovieHorizontalPageComponent extends MoviePageAbstraction {

  protected resetInfoSpe(): void {}
  protected initSpe(): void {}

}
