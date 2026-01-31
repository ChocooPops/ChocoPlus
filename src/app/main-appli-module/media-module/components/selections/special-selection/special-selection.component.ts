import { Component } from '@angular/core';
import { SelectionAbstraction } from '../selection-abstraction.directive';
import { NgClass } from '@angular/common';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { SpecialPosterComponent } from '../../posters/special-poster/special-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-special-selection',
  standalone: true,
  imports: [NgClass, ScrollButtonComponent, PaginationComponent, SpecialPosterComponent],
  templateUrl: './special-selection.component.html',
  styleUrls: ['./special-selection.component.css', '../selection.style.css']
})
export class SpecialSelectionComponent extends SelectionAbstraction {

  protected override setPagination(): void {
    this.subscription.add(
      this.paginationPosterService.getSpecialGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
        this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
      })
    )
    this.setMarginBottomWithVerticalPoster();
  }

}
