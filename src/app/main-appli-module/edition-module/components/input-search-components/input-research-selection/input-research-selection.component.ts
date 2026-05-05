import { Component, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '../../../../media-module/models/selection.interface';
import { NgClass } from '@angular/common';
import { InputResearchAbstract } from '../input-research-abstract';
import { SelectionService } from '../../../../media-module/services/selection/selection.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input-research-selection',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TranslatePipe],
  templateUrl: './input-research-selection.component.html',
  styleUrls: ['./input-research-selection.component.css', '../../../styles/search.css']
})
export class InputResearchSelectionComponent extends InputResearchAbstract<SelectionModel> {

  protected override placeHolder = 'EDITION.SEARCH.SELECTION_SEARCH';

  constructor(fb: FormBuilder,
    elementRef: ElementRef,
    private readonly selectionService: SelectionService
  ) {
    super(fb, elementRef)
  }

  protected override startResearch() {
    const value: string = this.getValueInput();
    this.selectionService.fetchSelectionWanted(value).subscribe((data) => {
      this.contentWanted = data;
    });
  }

}
