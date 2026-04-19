import { Component } from '@angular/core';
import { SeriesPageAbstraction } from '../../series-page-abstraction.directive';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-series-horizontal-page',
  standalone: true,
  imports: [NgClass],
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
