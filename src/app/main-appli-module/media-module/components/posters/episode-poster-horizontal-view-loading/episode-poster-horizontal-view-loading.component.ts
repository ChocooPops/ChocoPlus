import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';

@Component({
  selector: 'app-episode-poster-horizontal-view-loading',
  standalone: true,
  imports: [NgClass],
  templateUrl: './episode-poster-horizontal-view-loading.component.html',
  styleUrls: [
    './episode-poster-horizontal-view-loading.component.css',
    '../episode-poster-horizontal-view/episode-poster-horizontal-view.component.css',
    '../../../../common-module/styles/animation.css'
  ],
})
export class EpisodePosterHorizontalViewLoadingComponent {
  
  private subscription!: Subscription;

  @Input({ required: true }) iteration: number = 0;
  @Input({ required: true }) setDimension: boolean = false;
  @Input() height: number = 0;
  @Input() width: number = 0;

  gap!: number;
  episodesTab: number[] = [];

  constructor(private readonly paginationPosterService: PaginationPosterService) {}

  ngOnInit(): void {
    for (let i = 0; i < this.iteration; i++) {
      this.episodesTab.push(i);
    }

    if (this.setDimension) {
      this.subscription = this.paginationPosterService
        .getVerticalGeometricDimensionSelection()
        .subscribe((data: GeometricDimensionSelectionModel) => {
          this.width =
            this.paginationPosterService.getRealHeighVerticalVerticalPoster();
          this.height = data.widthPoster * 0.9;
          this.gap = data.gapBetweenPoster * 2;
        });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
