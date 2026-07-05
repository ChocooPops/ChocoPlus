import { Component } from '@angular/core';
import { SelectionAbstraction } from '../selection-abstraction.directive';
import { NgClass } from '@angular/common';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { SpecialPosterComponent } from '../../posters/special-poster/special-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PaginationComponent } from '../pagination/pagination.component';
import { SelectionTranslatePipe } from '../../../../../common-module/pipe/selection-translate';
import { SeeEverythingComponent } from '../see-everything/see-everything.component';

@Component({
  selector: 'app-special-selection',
  standalone: true,
  imports: [NgClass, SeeEverythingComponent, ScrollButtonComponent, PaginationComponent, SpecialPosterComponent, SelectionTranslatePipe],
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
