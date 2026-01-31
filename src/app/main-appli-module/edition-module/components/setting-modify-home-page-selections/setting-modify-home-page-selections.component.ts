import { Component } from '@angular/core';
import { SettingSelectionPageAbstract } from '../abstract-components/setting-selection-page.directive';
import { InputResearchSelectionComponent } from '../input-search-components/input-research-selection/input-research-selection.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';
import { PopupComponent } from '../popup/popup.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';

@Component({
  selector: 'app-modify-home-page',
  standalone: true,
  imports: [PopupComponent, InputResearchSelectionComponent, SelectionOverviewComponent, ButtonRemoveComponent, ButtonSaveComponent],
  templateUrl: './setting-modify-home-page-selections.component.html',
  styleUrls: ['./setting-modify-home-page-selections.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyHomePageSelectionsComponent extends SettingSelectionPageAbstract {

  private message: string = "Cette action modifera la liste des sélections dans la page d'accueil";

  onClickSaveNewSelectionIntoHomePage(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
  }

  onClickReset(): void {
    this.editionSelectionPageService.resetEditSelectionPage();
    this.editionSelectionPageService.fetchFillSelectionIntoHomePage();
  }

  emitSaved(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editionSelectionPageService.fetchModifyHomeSelection().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  override loadSelectionByPage(): void {
    this.editionSelectionPageService.fetchFillSelectionIntoHomePage();
  }

}
