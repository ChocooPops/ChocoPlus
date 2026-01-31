import { Component } from '@angular/core';
import { SettingLicenseAbstraction } from '../abstract-components/setting-license-abstraction.directive';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { SelectionOverviewComponent } from '../selection-overview/selection-overview.component';
import { InputResearchMovieComponent } from '../input-search-components/input-research-movie/input-research-movie.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { InputResearchSelectionComponent } from '../input-search-components/input-research-selection/input-research-selection.component';
import { InputResearchLicenseComponent } from '../input-search-components/input-research-license/input-research-license.component';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { PopupComponent } from '../popup/popup.component';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { map, distinctUntilChanged, take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InputResearchSeriesComponent } from '../input-search-components/input-research-series/input-research-series.component';
import { EditionLicenseService } from '../../services/edition-license/edition-license.service';
import { ActivatedRoute } from '@angular/router';
import { SelectionService } from '../../../media-module/services/selection/selection.service';

@Component({
  selector: 'app-setting-modify-license',
  standalone: true,
  imports: [InputResearchLicenseComponent, InputResearchSeriesComponent, PopupComponent, ButtonRemoveComponent, ButtonSaveComponent, InputResearchMovieComponent, InputResearchSelectionComponent, SelectionOverviewComponent, InputImageEditionComponent, InputRadioButtonComponent, InputTextEditionComponent],
  templateUrl: './setting-modify-license.component.html',
  styleUrls: ['./setting-modify-license.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyLicenseComponent extends SettingLicenseAbstraction {

  private messageDeletete: string = 'Cette action supprimera définitivement la license';
  private messageModify: string = 'Cette action enregistrera lees modifications faites sur la license';
  private typeOperation!: number;

  constructor(editionLicenseService: EditionLicenseService,
    private route: ActivatedRoute,
    selectionService: SelectionService
  ) {
    super(editionLicenseService, selectionService);
  }

  setEditLicenseWanted(license: LicenseModel): void {
    this.displayLoader = true;
    this.editionLicenseService.resetAllEditLicense();
    this.editionLicenseService.setEditLicenseById(license.id);
  }

  override ngOnInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.editionLicenseService.resetAllEditLicense();
      this.initEditLicenseWithRadioButton();
      if (id) {
        this.displayLoader = true;
        this.editionLicenseService.setEditLicenseById(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribeEditLicence();
    this.editionLicenseService.resetAllEditLicense();
  }

  private emitDeleteLicense(): void {
    this.editionLicenseService.fetchDeleteLicense().pipe(take(1)).subscribe({
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

  private emitModifyLicense(): void {
    this.editionLicenseService.fetchModifyLicense().pipe(take(1)).subscribe({
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
      this.emitDeleteLicense();
    } else if (this.typeOperation === 1) {
      this.emitModifyLicense();
    }
  }

  onClickDeleteLicense(): void {
    this.popup.setMessage(this.messageDeletete, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
    this.typeOperation = 0;
  }

  onClickModifyLicense(): void {
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
    this.typeOperation = 1;
  }

}
