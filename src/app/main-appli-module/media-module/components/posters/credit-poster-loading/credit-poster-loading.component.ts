import { Component, Input } from '@angular/core';
import { JobModel } from '../../../models/job.eum';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-credit-poster-loading',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './credit-poster-loading.component.html',
  styleUrls: ['./credit-poster-loading.component.css', '../credit-poster/credit-poster.component.css', '../../../../common-module/styles/animation.css'],
})
export class CreditPosterLoadingComponent {
  @Input() jobTitle!: JobModel;
  private subscription!: Subscription;

  nbPoster: number = 5;
  creditTab: number[] = [];

  height!: number;
  width!: number;
  gap!: number;
  JobModel = JobModel;

  constructor(private paginationPosterService: PaginationPosterService) {}

  ngOnInit(): void {
    for (let i = 0; i < this.nbPoster; i++) {
      this.creditTab.push(i);
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
