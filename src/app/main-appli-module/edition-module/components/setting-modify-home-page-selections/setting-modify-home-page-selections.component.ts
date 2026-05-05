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
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { EditionSelectionPageService } from '../../services/edition-selection-page/edition-selection-page.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modify-home-page',
  standalone: true,
  imports: [TranslatePipe, PopupComponent, InputResearchSelectionComponent, SelectionOverviewComponent, ButtonRemoveComponent, ButtonSaveComponent],
  templateUrl: './setting-modify-home-page-selections.component.html',
  styleUrls: ['./setting-modify-home-page-selections.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyHomePageSelectionsComponent extends SettingSelectionPageAbstract {

  protected override menuType: MenuType = MenuType.MODIFY_HOME_PAGE_SELECTION;
  private message = 'EDITION.PAGE_SELECTION.MESSAGE_MODIFY_HOME_PAGE';

  constructor(editionSelectionPageService: EditionSelectionPageService,
    selectionService: SelectionService,
    editionParametersService: EditionParametersService
  ) {
    super(editionSelectionPageService, selectionService, editionParametersService);
    this.toggleUnderParameter();
  }

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
