import { Component, ElementRef } from '@angular/core';
import { InputResearchAbstract } from '../input-research-abstract';
import { CategorySimpleModel } from '../../../models/category/categorySimple.model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CategoryService } from '../../../services/category/category.service';

@Component({
  selector: 'app-input-research-category',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input-research-category.component.html',
  styleUrls: ['./input-research-category.component.css', '../../../styles/search.css']
})
export class InputResearchCategoryComponent extends InputResearchAbstract<CategorySimpleModel> {

  protected override placeHolder: string = 'Rechercher une catégorie';

  constructor(
    fb: FormBuilder,
    elementRef: ElementRef,
    private categoryService: CategoryService
  ) {
    super(fb, elementRef);
  }

  protected override typeFocus: boolean = true;

  protected override startResearch(): void {
    const value: string = this.getValueInput();
    if (value) {
      if (value !== '') {
        this.contentWanted = this.categoryService.filterCategoriesByFuzzyStart(value.toString(), []);
      } else {
        this.contentWanted = this.categoryService.getValueOfCategories();
      }
    } else {
      this.contentWanted = this.categoryService.getValueOfCategories();
    }
  }

}
