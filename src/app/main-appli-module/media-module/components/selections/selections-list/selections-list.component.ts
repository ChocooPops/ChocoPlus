import { Component, Input, SimpleChanges } from '@angular/core';
import { SelectionModel } from '../../../models/selection.interface';
import { FormatPosterModel } from '../../../../common-module/models/format-poster.enum';
import { VerticalSelectionComponent } from '../vertical-selection/vertical-selection.component';
import { SelectionType } from '../../../models/selection-type.enum';
import { SpecialSelectionComponent } from '../special-selection/special-selection.component';
import { LicenseSelectionComponent } from '../license-selection/license-selection.component';
import { HorizontalSelectionComponent } from '../horizontal-selection/horizontal-selection.component';
import { SimpleModel } from '../../../../../common-module/models/simple-model';
import { SelectionLoadingService } from '../../../services/selection-loading/selection-loading.service';
import { SelectionLoadingComponent } from '../selection-loading/selection-loading.component';
import { Subscription } from 'rxjs';
import { PaginationPosterService } from '../../../services/pagination-poster/pagination-poster.service';

@Component({
  selector: 'app-selections-list',
  standalone: true,
  imports: [VerticalSelectionComponent, SpecialSelectionComponent, LicenseSelectionComponent, HorizontalSelectionComponent, SelectionLoadingComponent],
  templateUrl: './selections-list.component.html',
  styleUrl: './selections-list.component.css'
})
export class SelectionsListComponent {

  @Input() selections: SelectionModel[] | undefined = undefined;
  @Input() format: FormatPosterModel = FormatPosterModel.VERTICAL;
  @Input() licenseLoading: boolean = false;

  private subsrciption!: Subscription;
  public readonly SelectionType = SelectionType;
  public readonly FormatPoster = FormatPosterModel;
  selectionsLoading!: SimpleModel[];
  marginBottom!: number;

  constructor(private readonly selectionLoadingService: SelectionLoadingService,
    private readonly paginationPosterService: PaginationPosterService
  ) {
    this.selectionsLoading = this.selectionLoadingService.getSelectionLoading();
  }

  ngOnInit(): void {
    this.subsrciption = this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe(() => {
      this.updateMarginBottom();
    })
  }

  ngOnDestroy(): void {
    this.subsrciption?.unsubscribe();
  }

  private updateMarginBottom(): void {
    if (this.format === this.FormatPoster.VERTICAL) {
      this.marginBottom = this.paginationPosterService.getMarginBottomPageToVerticalFormat();
    } else if (this.format === this.FormatPoster.HORIZONTAL) {
      this.marginBottom = this.paginationPosterService.getMarginBottomPageToHorizontalFormat();
    } else {
      this.marginBottom = 0;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['format']) {
      this.updateMarginBottom();
    }
  }

}
