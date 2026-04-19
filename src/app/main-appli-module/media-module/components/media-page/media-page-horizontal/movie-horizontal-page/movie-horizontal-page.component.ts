import { Component } from '@angular/core';
import { MoviePageAbstraction } from '../../movie-page-abstraction.directive';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-movie-horizontal-page',
  standalone: true,
  imports: [NgClass],
  templateUrl: './movie-horizontal-page.component.html',
  styleUrls: ['./movie-horizontal-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MovieHorizontalPageComponent extends MoviePageAbstraction {

  protected resetInfoSpe(): void {}
  protected initSpe(): void {}

}
