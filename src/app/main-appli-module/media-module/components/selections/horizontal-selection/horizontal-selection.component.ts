import { Component } from '@angular/core';
import { SelectionAbstraction } from '../selection-abstraction.directive';
import { NgClass } from '@angular/common';
import { HorizontalPosterComponent } from '../../posters/horizontal-poster/horizontal-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-horizontal-selection',
  standalone: true,
  imports: [NgClass, ScrollButtonComponent, HorizontalPosterComponent, PaginationComponent],
  templateUrl: './horizontal-selection.component.html',
  styleUrls: ['./horizontal-selection.component.css', '../selection.style.css']
})
export class HorizontalSelectionComponent extends SelectionAbstraction {

  protected override setPagination(): void {
    this.subscription.add(
      this.paginationPosterService.getHorizontalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
        this.marginBottom = this.paginationPosterService.getDifferenceMarginBottomBetweenVerticalAndHorizontal();
        this.marginLeftTitle = dimension.marginLeft;
        this.heightForScrollButton = this.paginationPosterService.getRealHeighHorizontalPoster();
      })
    )
  }

}
