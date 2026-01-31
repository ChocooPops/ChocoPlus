import { Component } from '@angular/core';
import { SettingCategoryAbstraction } from '../abstract-components/setting-category-abstraction.directive';
import { take, distinctUntilChanged, map } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { PopupComponent } from '../popup/popup.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputResearchCategoryComponent } from '../input-search-components/input-research-category/input-research-category.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { CategorySimpleModel } from '../../models/category/categorySimple.model';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { CategoryService } from '../../services/category/category.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-setting-modify-category',
  standalone: true,
  imports: [PopupComponent, InputResearchSeriesComponent, InputTextEditionComponent, ButtonSaveComponent, ButtonRemoveComponent, InputResearchCategoryComponent, SelectionOverviewComponent, InputResearchMovieComponent],
  templateUrl: './setting-modify-category.component.html',
  styleUrls: ['./setting-modify-category.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyCategoryComponent extends SettingCategoryAbstraction {

  private messageModify: string = 'Cette action enregistrera les modifications faites sur la catégorie';
  private messageDelete: string = 'Cette action supprimera définitivement la catégorie';
  private typeOperation !: number;

  constructor(categoryService: CategoryService,
    private route: ActivatedRoute
  ) {
    super(categoryService);
  }

  setEditCategorieByResearched(category: CategorySimpleModel) {
    this.displayLoader = true;
    this.categoryService.resetEditCategory();
    this.categoryService.setEditCategoryByResearch(category.id);
  }

  override ngOnInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.categoryService.resetEditCategory();
      this.initEditCategory();
      if (id) {
        this.displayLoader = true;
        this.categoryService.setEditCategoryByResearch(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.categoryService.resetEditCategory();
  }

  private emitDeleteCategory(): void {
    this.categoryService.fetchDeleteCategory().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
        this.displayLoader = false;
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 3);
      }
    });
  }

  private emitModifyCategory(): void {
    this.categoryService.fetchModifyCategory().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  public emitActionData(): void {
    this.popup.setDisplayButton(false);
    this.popup.setMessage(undefined, undefined);
    if (this.typeOperation === 0) {
      this.emitDeleteCategory();
    } else {
      this.emitModifyCategory();
    }
  }

  public onClickDeleteCategory(): void {
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
    this.typeOperation = 0;
  }

  public onClickModifyCaregory(): void {
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
    this.typeOperation = 1;
  }

}
