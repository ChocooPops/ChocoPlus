import { Component } from '@angular/core';
import { GridAbstraction } from '../grid-abstraction.directive';
import { HorizontalPosterComponent } from '../../posters/horizontal-poster/horizontal-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PosterLoadingComponent } from '../../posters/poster-loading/poster-loading.component';
import { SettingNotFoundComponent } from '../../../../../common-module/components/setting-not-found/setting-not-found.component';

@Component({
  selector: 'app-horizontal-grid',
  standalone: true,
  imports: [HorizontalPosterComponent, PosterLoadingComponent, SettingNotFoundComponent],
  templateUrl: './horizontal-grid.component.html',
  styleUrls: ['./horizontal-grid.component.css', '../grid-poster.style.css']
})
export class HorizontalGridComponent extends GridAbstraction {

  protected override subscribePagination(): void {
    this.subscription.add(
      this.paginationPosterService.getHorizontalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.setPagination(dimension);
        this.marginBottom = this.paginationPosterService.getMarginBottomPageToHorizontalFormat();
        this.height = this.paginationPosterService.getRealHeighHorizontalPoster();
        this.marginBottomLoading = this.paginationPosterService.getMarginBottomForHorizontalPoster();
      })
    )
  }

}
