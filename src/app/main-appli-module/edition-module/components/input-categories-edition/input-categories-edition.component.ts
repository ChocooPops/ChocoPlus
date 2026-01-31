import { Component, Input, HostListener, ElementRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { ContainerWordComponent } from '../container-word/container-word.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { CategoryService } from '../../services/category/category.service';
import { CategorySimpleModel } from '../../models/category/categorySimple.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-input-categories-edition',
  standalone: true,
  imports: [InputTextEditionComponent, ContainerWordComponent],
  templateUrl: './input-categories-edition.component.html',
  styleUrl: './input-categories-edition.component.css'
})
export class InputCategoriesEditionComponent {

  @ViewChild("refInput") refInput !: ElementRef;
  @Input() categoriesSelected: CategorySimpleModel[] = [];
  @Output() onChangeCategory = new EventEmitter<CategorySimpleModel[]>();
  @ViewChild(InputTextEditionComponent) inputText !: InputTextEditionComponent;
  categoriesSearched: CategorySimpleModel[] = [];
  displayResearch: boolean = false;
  placeHolder: string = 'ex : Drame';
  srcArow: string = 'icon/arrow.svg';
  subscription: Subscription = new Subscription();

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.categoryService.getAllCategories().subscribe((data) => {
        this.categoriesSearched = this.categoryService.filterCategoriesByAnyResearch(this.categoriesSelected);
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onInputChange(texte: string): void {
    if (texte) {
      texte = texte.trim();
      if (texte !== '') {
        this.categoriesSearched = this.categoryService.filterCategoriesByFuzzyStart(texte, this.categoriesSelected);
      } else {
        this.categoriesSearched = this.categoryService.filterCategoriesByAnyResearch(this.categoriesSelected);
      }
    } else {
      this.categoriesSearched = this.categoryService.filterCategoriesByAnyResearch(this.categoriesSelected);
    }
  }

  onChangeFocus(state: boolean): void {
    this.displayResearch = state;
  }

  setFocus(): void {
    this.inputText.setFocus();
  }

  onClick(category: CategorySimpleModel): void {
    this.categoriesSelected.push(category);
    this.updateCategories();
    this.displayResearch = false;
    this.setFocus();
  }

  onEnterKey(): void {
    if (this.categoriesSearched.length > 0) {
      this.categoriesSelected.push(this.categoriesSearched[0]);
      this.updateCategories();
    }
  }

  removeCategory(id: number): void {
    this.categoriesSelected = this.categoriesSelected.filter((category: CategorySimpleModel) => category.id !== id);
    this.updateCategories();
  }

  private updateCategories(): void {
    this.onChangeCategory.emit(this.categoriesSelected);
    this.categoriesSearched = this.categoryService.filterCategoriesByAnyResearch(this.categoriesSelected);
    this.inputText.updateInputValue(undefined);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.refInput) {
      const clickedInside = this.refInput.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.displayResearch = false;
      }
    }
  }

}
