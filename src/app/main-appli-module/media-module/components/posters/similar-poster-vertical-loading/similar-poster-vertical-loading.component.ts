import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-similar-poster-vertical-loading',
  standalone: true,
  imports: [NgClass],
  templateUrl: './similar-poster-vertical-loading.component.html',
  styleUrls: ['.././similar-poster-vertical/similar-poster-vertical.component.css', '../../../../common-module/styles/animation.css'],
})
export class SimilarPosterVerticalLoadingComponent {
  
  nbPoster: number = 7;
  similarTab: number[] = [];
  private subscription!: Subscription;

  height!: number;
  width!: number;
  gap!: number;

  constructor(
    private readonly paginationPosterService: PaginationPosterService,
  ) {}

  ngOnInit(): void {
    for (let i = 0; i < this.nbPoster; i++) {
      this.similarTab.push(i);
    }

    this.subscription = this.paginationPosterService
      .getVerticalGeometricDimensionSelection()
      .subscribe((data: GeometricDimensionSelectionModel) => {
        this.height =
          this.paginationPosterService.getRealHeighVerticalVerticalPoster();
        this.width = data.widthPoster;
        this.gap = data.gapBetweenPoster * 2;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
