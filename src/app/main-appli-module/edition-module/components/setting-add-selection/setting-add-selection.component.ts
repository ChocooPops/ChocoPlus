import { Component } from '@angular/core';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { SettingSelectionAbstraction } from '../abstract-components/setting-selection-abstraction.directive';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { PopupComponent } from '../popup/popup.component';
import { take } from 'rxjs';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';

@Component({
  selector: 'app-setting-add-selection',
  standalone: true,
  imports: [SelectionOverviewComponent, InputResearchSeriesComponent, PopupComponent, ButtonRemoveComponent, ButtonSaveComponent, InputRadioButtonComponent, InputResearchMovieComponent, InputTextEditionComponent],
  templateUrl: './setting-add-selection.component.html',
  styleUrls: ['./setting-add-selection.component.css', '../../styles/edition.css']
})
export class SettingAddSelectionComponent extends SettingSelectionAbstraction {

  private message: string = 'Cette action ajoutera une nouvelle sélection';

  public onClickAddSelection(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
  }

  public emitAddSelection(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editionSelectionService.fetchAddNewSelection().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error : HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    });
  }

  public onClickReset(): void {
    this.editionSelectionService.resetAllEditSelection();
  }

}
