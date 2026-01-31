import { Component, Input } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { NgClass } from '@angular/common';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { SelectionLoadingComponent } from '../../../media-module/components/selections/selection-loading/selection-loading.component';
import { SelectionLoadingService } from '../../../media-module/services/selection-loading/selection-loading.service';

@Component({
  selector: 'app-license-components-loading',
  standalone: true,
  imports: [NgClass, SelectionLoadingComponent],
  templateUrl: './license-page-loading.component.html',
  styleUrls: ['./license-page-loading.component.css', '../license-page/license-page.component.css', '../../../common-module/styles/animation.css']
})
export class LicensePagesLoadingComponent {

  @Input() format !: FormatPosterModel;
  selections !: SimpleModel[];
  SelectionType = SelectionType;

  constructor(private selectionLoadingService: SelectionLoadingService) {
    this.selections = this.selectionLoadingService.getSelectionLoading();
  }

}
