import { Component } from '@angular/core';
import { SettingSelectionAbstraction } from '../abstract-components/setting-selection-abstraction.directive';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { InputResearchSelectionComponent } from '../input-search-components/input-research-selection/input-research-selection.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { take, distinctUntilChanged, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { EditionSelectionService } from '../../services/edition-selection/edition-selection.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-setting-modify-license',
  standalone: true,
  imports: [SelectionOverviewComponent, InputResearchSeriesComponent, PopupComponent, ButtonRemoveComponent, ButtonSaveComponent, InputResearchMovieComponent, InputTextEditionComponent, InputRadioButtonComponent, InputResearchSelectionComponent],
  templateUrl: './setting-modify-selection.component.html',
  styleUrls: ['./setting-modify-selection.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifySelectionComponent extends SettingSelectionAbstraction {

  private messageModify: string = 'Cette action enregistrera les modifications faites sur la sélection';
  private messageDelete: string = 'Cette action supprimera définitivement la sélection'
  private typeOperation !: number;

  constructor(editionSelectionService: EditionSelectionService,
    private route: ActivatedRoute
  ) {
    super(editionSelectionService);
  }

  setEditSelectionBySelectionWanted(selection: SelectionModel) {
    this.displayLoader = true;
    this.editionSelectionService.resetAllEditSelection();
    this.editionSelectionService.setEditSelectionById(selection.id);
  }

  override ngOnInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.editionSelectionService.resetAllEditSelection();
      this.initEditSelectionWithRadioButton();
      if (id) {
        this.displayLoader = true;
        this.editionSelectionService.setEditSelectionById(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribeEditSelection();
    this.editionSelectionService.resetAllEditSelection();
  }

  private emitDeleteSelection(): void {
    this.editionSelectionService.fetchDeleteSelection().pipe(take(1)).subscribe({
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

  private emitModifySelection(): void {
    this.editionSelectionService.fetchModifySelection().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  public emitActionData(): void {
    this.popup.setDisplayButton(false);
    this.popup.setMessage(undefined, undefined);
    if (this.typeOperation === 0) {
      this.emitDeleteSelection();
    } else if (this.typeOperation === 1) {
      this.emitModifySelection();
    }
  }

  public onClickDeleteSelection(): void {
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
    this.typeOperation = 0;
  }

  public onClickModifySelection(): void {
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
    this.typeOperation = 1;
  }

}
