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
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { take, map, distinctUntilChanged } from 'rxjs';
import { EditionSeriesService } from '../../services/edition-series/edition-series.service';
import { ActivatedRoute } from '@angular/router';
import { TmdbOperationService } from '../../services/tmdb-operation/tmdb-operation.service';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { InputDateComponent } from '../input-date/input-date.component';
import { InputTimeEditionComponent } from '../input-time-edition/input-time-edition.component';

@Component({
  selector: 'app-setting-modify-series',
  standalone: true,
  imports: [NgClass, InputTimeEditionComponent, InputDateComponent, InputResearchSeriesComponent, EditListSeasonComponent, EditEpisodeComponent, EditSeasonComponent, InputTextEditionComponent, InputLanguageTitleComponent, AiButtonComponent, InputKeywordsEditionComponent, InputRadioButtonComponent, InputCategoriesEditionComponent, InputTextAreaEditionComponent, InputPosterEditionComponent, InputPosterHorizontalEditionComponent, ButtonRemoveComponent, ButtonSaveComponent, InputImageEditionComponent, PopupComponent, InputButtonInfoSeriesComponent, ButtonAddComponent],
  templateUrl: './setting-modify-series.component.html',
  styleUrls: ['./setting-modify-series.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifySeriesComponent extends SettingSeriesAbstraction {

  private messageDelete: string = 'Cette action supprimera définitevement la série';
  private messageModify: string = 'Cette action enregistrera les modifications faites au film';
  private typeOperation !: number;

  constructor(editionSeriesService: EditionSeriesService,
    tmdbOperationService: TmdbOperationService,
    private route: ActivatedRoute
  ) {
    super(editionSeriesService, tmdbOperationService)
  }

  setSeriesWantedToModifyIt(media: SeriesModel) {
    this.displayLoader = true;
    this.editionSeriesService.resetEditSeries();
    this.editionSeriesService.setEditSeriesImmediatlyByIdSeries(media.id);
  }

  override ngOnInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.editionSeriesService.resetEditSeries();
      this.initSubscriptionOfEditSeries();
      if (id) {
        this.displayLoader = true;
        this.editionSeriesService.setEditSeriesImmediatlyByIdSeries(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribeEditSeries();
    this.unsubscribeSearchSeries();
    this.editionSeriesService.resetEditSeries();
  }

  private emitModifySeries(): void {
    this.editionSeriesService.fetchModifySeries().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }
  private emitDeleteSeries(): void {
    this.editionSeriesService.fetchDeleteSeries().pipe(take(1)).subscribe({
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
  public onClickDeleteSeries(): void {
    this.typeOperation = 0;
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }
  public onClickModifySeries(): void {
    this.typeOperation = 1;
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }
  public emitActionData(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    if (this.typeOperation === 0) {
      this.emitDeleteSeries();
    } else if (this.typeOperation === 1) {
      this.emitModifySeries();
    }
  }

}
