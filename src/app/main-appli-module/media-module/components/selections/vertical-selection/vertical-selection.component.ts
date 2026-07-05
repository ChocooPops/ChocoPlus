import { Component } from '@angular/core';
import { SelectionAbstraction } from '../selection-abstraction.directive';
import { NgClass } from '@angular/common';
import { ScrollButtonComponent } from '../scroll-button/scroll-button.component';
import { VerticalPosterComponent } from '../../posters/vertical-poster/vertical-poster.component';
import { GeometricDimensionSelectionModel } from '../../../models/geometric-dimension-selection.interface';
import { PaginationComponent } from '../pagination/pagination.component';
import { SelectionTranslatePipe } from '../../../../../common-module/pipe/selection-translate';
import { SeeEverythingComponent } from '../see-everything/see-everything.component';

@Component({
  selector: 'app-vertical-selection',
  standalone: true,
  imports: [NgClass, SeeEverythingComponent, ScrollButtonComponent, PaginationComponent, VerticalPosterComponent, SelectionTranslatePipe],
  templateUrl: './vertical-selection.component.html',
  styleUrls: ['./vertical-selection.component.css', '../selection.style.css']
})
export class VerticalSelectionComponent extends SelectionAbstraction {

  protected override setPagination(): void {
    this.subscription.add(
      this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.fillGeometricDimension(dimension);
        this.marginLeftTitle = dimension.marginLeft;
        this.heightForScrollButton = this.paginationPosterService.getRealHeighVerticalVerticalPoster();
      })
    )
  }

}
