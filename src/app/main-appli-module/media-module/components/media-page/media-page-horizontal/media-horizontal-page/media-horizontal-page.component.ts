import { Component } from '@angular/core';
import { MediaPageAbstraction } from '../../media-page-abstraction.directive';
import { NgClass } from '@angular/common';
import { CrossButtonComponent } from '../../../button/cross-button/cross-button.component';
import { MediaHorizontalBackgroundComponent } from '../media-horizontal-background/media-horizontal-background.component';
import { MovieHorizontalPageComponent } from '../movie-horizontal-page/movie-horizontal-page.component';
import { SeriesHorizontalPageComponent } from '../series-horizontal-page/series-horizontal-page.component';

@Component({
  selector: 'app-media-horizontal-page',
  standalone: true,
  imports: [NgClass, CrossButtonComponent, MediaHorizontalBackgroundComponent, MovieHorizontalPageComponent, SeriesHorizontalPageComponent],
  templateUrl: './media-horizontal-page.component.html',
  styleUrls: ['./media-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MediaHorizontalPageComponent extends MediaPageAbstraction {

}
