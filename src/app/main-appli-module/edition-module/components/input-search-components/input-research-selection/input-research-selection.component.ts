import { Component, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '../../../../media-module/models/selection.interface';
import { NgClass } from '@angular/common';
import { InputResearchAbstract } from '../input-research-abstract';
import { SelectionService } from '../../../../media-module/services/selection/selection.service';

@Component({
  selector: 'app-input-research-selection',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-research-selection.component.html',
  styleUrls: ['./input-research-selection.component.css', '../../../styles/search.css']
})
export class InputResearchSelectionComponent extends InputResearchAbstract<SelectionModel> {

  protected override placeHolder: string = 'Rechercher une sélection';

  constructor(fb: FormBuilder,
    elementRef: ElementRef,
    private selectionService: SelectionService
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
