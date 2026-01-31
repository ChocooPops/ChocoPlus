import { Component } from '@angular/core';
import { SettingSeriesAbstraction } from '../abstract-components/setting-series-abstraction.directive';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputLanguageTitleComponent } from '../input-language-title/input-language-title.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { InputKeywordsEditionComponent } from '../input-keywords-edition/input-keywords-edition.component';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputCategoriesEditionComponent } from '../input-categories-edition/input-categories-edition.component';
import { InputTextAreaEditionComponent } from '../input-text-area-edition/input-text-area-edition.component';
import { InputPosterEditionComponent } from '../input-poster-edition/input-poster-edition.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { InputPosterHorizontalEditionComponent } from '../input-poster-horizontal-edition/input-poster-horizontal-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { PopupComponent } from '../popup/popup.component';
import { NgClass } from '@angular/common';
import { InputButtonInfoSeriesComponent } from '../input-button-info-series/input-button-info-series.component';
import { EditListSeasonComponent } from '../edit-list-season/edit-list-season.component';
import { EditEpisodeComponent } from '../edit-episode/edit-episode.component';
import { EditSeasonComponent } from '../edit-season/edit-season.component';
import { ButtonAddComponent } from "../button-add/button-add.component";
import { take } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { InputDateComponent } from '../input-date/input-date.component';
import { InputTimeEditionComponent } from '../input-time-edition/input-time-edition.component';

@Component({
  selector: 'app-setting-add-series',
  standalone: true,
  imports: [NgClass, InputTimeEditionComponent, InputDateComponent, EditListSeasonComponent, EditEpisodeComponent, EditSeasonComponent, InputTextEditionComponent, InputLanguageTitleComponent, AiButtonComponent, InputKeywordsEditionComponent, InputRadioButtonComponent, InputCategoriesEditionComponent, InputTextAreaEditionComponent, InputPosterEditionComponent, InputPosterHorizontalEditionComponent, ButtonRemoveComponent, ButtonSaveComponent, InputImageEditionComponent, PopupComponent, InputButtonInfoSeriesComponent, ButtonAddComponent],
  templateUrl: './setting-add-series.component.html',
  styleUrls: ['./setting-add-series.component.css', '../../styles/edition.css']
})
export class SettingAddSeriesComponent extends SettingSeriesAbstraction {

  private message: string = 'Cette action ajoutera une nouvelle série';

  onClickAddSeries(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public emitAddSeries(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editionSeriesService.fetchCreateNewSeries().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    })
  }

  onClickReset(): void {
    this.editionSeriesService.resetEditSeries();
    this.seasonIndexSelected = 0;
  }

}
