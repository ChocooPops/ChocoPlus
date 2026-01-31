import { Component } from '@angular/core';
import { GridAbstraction } from '../grid-abstraction.directive';
import { VerticalPosterComponent } from '../../posters/vertical-poster/vertical-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PosterLoadingComponent } from '../../posters/poster-loading/poster-loading.component';
import { SettingNotFoundComponent } from '../../../../../common-module/components/setting-not-found/setting-not-found.component';

@Component({
  selector: 'app-vertical-grid',
  standalone: true,
  imports: [VerticalPosterComponent, PosterLoadingComponent, SettingNotFoundComponent],
  templateUrl: './vertical-grid.component.html',
  styleUrls: ['./vertical-grid.component.css', '../grid-poster.style.css']
})
export class VerticalGridComponent extends GridAbstraction {

  protected override verifTypeY: boolean = true;

  protected override subscribePagination(): void {
    this.subscription.add(
      this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.setPagination(dimension);
        this.marginBottom = this.paginationPosterService.getMarginBottomPageToVerticalFormat();
        this.height = this.paginationPosterService.getRealHeighVerticalVerticalPoster();
        this.marginBottomLoading = this.paginationPosterService.getMarginBottomForVerticalPoster();
      })
    )
  }

}
