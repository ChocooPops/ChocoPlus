import { Component } from '@angular/core';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { SettingLicenseAbstraction } from '../abstract-components/setting-license-abstraction.directive';
import { InputResearchSelectionComponent } from '../input-search-components/input-research-selection/input-research-selection.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { EditionLicenseService } from '../../services/edition-license/edition-license.service';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-setting-add-license',
  standalone: true,
  imports: [TranslatePipe, InputResearchSelectionComponent, InputResearchSeriesComponent, PopupComponent, ButtonRemoveComponent, InputRadioButtonComponent, InputTextEditionComponent, InputImageEditionComponent, ButtonSaveComponent, InputResearchMovieComponent, SelectionOverviewComponent, InputResearchSelectionComponent, PopupComponent],
  templateUrl: './setting-add-license.component.html',
  styleUrls: ['./setting-add-license.component.css', '../../styles/edition.css']
})
export class SettingAddLicenseComponent extends SettingLicenseAbstraction {

  private message = 'EDITION.LICENSE.MESSAGE_ADD';
  protected override menuType: MenuType = MenuType.ADD_LICENSE;

  constructor(editionLicenseService: EditionLicenseService,
    selectionService: SelectionService,
    editionParametersService: EditionParametersService
  ) {
    super(editionLicenseService, selectionService, editionParametersService);
    this.toggleUnderParameter();
  }

  onClickAddLicense(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayButton(true);
    this.popup.setDisplayPopup(true);
  }

  emitAddLicense(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.editionLicenseService.fetchAddNewLicense().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    });
  }

  onClickReset(): void {
    this.editionLicenseService.resetAllEditLicense();
  }

}