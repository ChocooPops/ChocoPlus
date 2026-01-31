import { Component } from '@angular/core';
import { SelectionAbstraction } from '../selection-abstraction.directive';
import { NgClass } from '@angular/common';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { LicensePosterComponent } from '../../posters/license-poster/license-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-license-selection',
  standalone: true,
  imports: [NgClass, ScrollButtonComponent, PaginationComponent, LicensePosterComponent],
  templateUrl: './license-selection.component.html',
  styleUrls: ['./license-selection.component.css', '../selection.style.css']
})
export class LicenseSelectionComponent extends SelectionAbstraction {

  protected override setPagination(): void {
    this.subscription.add(
      this.paginationPosterService.getLicenseGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
        this.marginBottom = this.paginationPosterService.getMarginBottomForVerticalPoster();
      })
    )
    this.setMarginBottomWithVerticalPoster();
  }

}
