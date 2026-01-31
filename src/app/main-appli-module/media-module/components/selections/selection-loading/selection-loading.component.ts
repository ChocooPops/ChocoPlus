import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { DimensionModel } from '../../../../../common-module/models/dimension.interface';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';
import { FormatPosterModel } from '../../../../common-module/models/format-poster.enum';
import { NgClass } from '@angular/common';
import { SelectionType } from '../../../models/selection-type.enum';

@Component({
  selector: 'app-selection-loading',
  standalone: true,
  imports: [NgClass],
  templateUrl: './selection-loading.component.html',
  styleUrls: ['./selection-loading.component.css', '../../../../common-module/styles/animation.css']
})
export class SelectionLoadingComponent {

  @Input() type!: SelectionType;
  @Input() format: FormatPosterModel = FormatPosterModel.VERTICAL;
  formatType = FormatPosterModel;
  tabMovie: number[] = [];
  subscription: Subscription = new Subscription();
  gap !: number;
  dimensionPoster !: DimensionModel;
  marginLeftTitle!: number;
  marginLeft !: number;
  marginBottom !: number;

  constructor(private paginationPosterService: PaginationPosterService) { }

  ngOnInit(): void {
    if (this.type === SelectionType.NORMAL_POSTER) {
      if (this.format === this.formatType.VERTICAL) {
        this.subscription.add(
          this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
            this.setTabMovie(dimension.nbPosterPerLine);
            this.gap = dimension.gapBetweenPoster;
            this.marginLeft = dimension.marginLeft;
            this.marginLeftTitle = dimension.marginLeft;
            this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
            this.dimensionPoster = {
              height: this.paginationPosterService.getRealHeighVerticalVerticalPoster(),
              width: dimension.widthPoster
            }
          })
        )
      } else {
        this.subscription.add(
          this.paginationPosterService.getHorizontalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
            this.setTabMovie(dimension.nbPosterPerLine);
            this.gap = dimension.gapBetweenPoster;
            this.marginLeft = dimension.marginLeft;
            this.marginLeftTitle = dimension.marginLeft;
            this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
            this.dimensionPoster = {
              height: this.paginationPosterService.getRealHeighHorizontalPoster(),
              width: dimension.widthPoster
            }
          })
        )
      }
    } else if (this.type === SelectionType.SPECIAL_POSTER) {
      this.subscription.add(
        this.paginationPosterService.getSpecialGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
          this.setTabMovie(dimension.nbPosterPerLine);
          this.gap = dimension.gapBetweenPoster;
          this.marginLeft = dimension.marginLeft;
          this.marginLeftTitle = dimension.marginLeft;
          this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
          this.dimensionPoster = {
            height: dimension.heightPoster,
            width: dimension.widthPoster
          }
        })
      )
    } else if (this.type === SelectionType.LICENSE_POSTER) {
      this.subscription.add(
        this.paginationPosterService.getLicenseGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
          this.setTabMovie(dimension.nbPosterPerLine);
          this.gap = dimension.gapBetweenPoster;
          this.marginLeft = dimension.marginLeft;
          this.marginLeftTitle = dimension.marginLeft;
          this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
          this.dimensionPoster = {
            height: dimension.heightPoster,
            width: dimension.widthPoster
          }
        })
      )
    }
  }

  setTabMovie(iteration: number): void {
    this.tabMovie = [];
    for (let i: number = 0; i < iteration; i++) {
      this.tabMovie.push(i);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
