import { Component, ElementRef } from '@angular/core';
import { InputResearchAbstract } from '../input-research-abstract';
import { CategorySimpleModel } from '../../../models/category/categorySimple.model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CategoryService } from '../../../services/category/category.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-input-research-category',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, TranslatePipe],
  templateUrl: './input-research-category.component.html',
  styleUrls: ['./input-research-category.component.css', '../../../styles/search.css']
})
export class InputResearchCategoryComponent extends InputResearchAbstract<CategorySimpleModel> {

  protected override placeHolder = 'EDITION.SEARCH.CATEGORY_SEARCH';

  constructor(
    fb: FormBuilder,
    elementRef: ElementRef,
    private readonly categoryService: CategoryService
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
