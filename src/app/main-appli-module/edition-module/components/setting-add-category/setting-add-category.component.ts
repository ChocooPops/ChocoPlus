import { Component } from '@angular/core';
import { SettingCategoryAbstraction } from '../abstract-components/setting-category-abstraction.directive';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { take } from 'rxjs';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';

@Component({
  selector: 'app-setting-add-category',
  standalone: true,
  imports: [InputTextEditionComponent, InputResearchSeriesComponent, PopupComponent, InputResearchMovieComponent, SelectionOverviewComponent, ButtonSaveComponent, ButtonRemoveComponent],
  templateUrl: './setting-add-category.component.html',
  styleUrls: ['./setting-add-category.component.css', '../../styles/edition.css']
})
export class SettingAddCategoryComponent extends SettingCategoryAbstraction {

  private message: string = 'Cette action ajoutera une nouvelle catégorie';

  onClickAddCategory(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
  }

  emitAddCategory(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.categoryService.fetchSaveNewCategory().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error : HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    })
  }

  onClickReset(): void {
    this.categoryService.resetEditCategory();
  }

}