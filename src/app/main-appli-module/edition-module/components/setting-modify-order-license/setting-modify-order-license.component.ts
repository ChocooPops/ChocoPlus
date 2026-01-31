import { Component } from '@angular/core';
import { LicenseOverviewComponent } from '../license-overview/license-overview.component';
import { PopupComponent } from '../popup/popup.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { InputRadioButtonComponent } from '../input-radio-button/input-radio-button.component';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { Subscription } from 'rxjs';
import { EditionLicenseOrderService } from '../../services/edition-license-order/edition-license-order.service';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';

@Component({
  selector: 'app-setting-modify-order-license',
  standalone: true,
  imports: [ButtonSaveComponent, ButtonRemoveComponent, LicenseOverviewComponent, PopupComponent, InputRadioButtonComponent],
  templateUrl: './setting-modify-order-license.component.html',
  styleUrls: ['./setting-modify-order-license.component.css', '../../styles/edition.css']
})
export class SettingModifyOrderLicenseComponent extends UnauthorizedError {

  groupLicenseType: string = 'groupLicenseType';
  messageModify: string = "Cette action modifera l'ordre d'affichage des licenses";
  subscription: Subscription = new Subscription();
  licenses: LicenseModel[] = [];
  radioButton: SimpleModel[] = [];
  licenseType: boolean | undefined;

  constructor(private editionLicenseOrderService: EditionLicenseOrderService) { 
    super();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.editionLicenseOrderService.getRadioButton().subscribe((radio: SimpleModel[]) => {
        this.radioButton = radio;
      })
    );
    this.subscription.add(
      this.editionLicenseOrderService.getEditOrderLicense().subscribe((licenses: LicenseModel[]) => {
        this.licenses = licenses;
      })
    );
    this.subscription.add(
      this.editionLicenseOrderService.getLicenseType().subscribe((type: boolean | undefined) => {
        this.licenseType = type;
      })
    )
  }

  public emitModifyLicenseOrder(): void {
    this.popup.setDisplayButton(false);
    this.popup.setMessage(undefined, undefined);
    this.editionLicenseOrderService.fetchOrderLicenseAccordingToType().subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  public modifyLicenseType(id: number): void {
    this.editionLicenseOrderService.modifyLicenseType(id);
  }

  public moveLeft(event: [number, number]): void {
    this.editionLicenseOrderService.moveLeft(event[0], event[1]);
  }
  public moveRight(event: [number, number]): void {
    this.editionLicenseOrderService.moveRight(event[0], event[1]);
  }
  public moveTop(event: [number, number]): void {
    this.editionLicenseOrderService.moveLeft(event[0], event[1]);
  }
  public moveBottom(event: [number, number]): void {
    this.editionLicenseOrderService.moveRight(event[0], event[1]);
  }

  onClickModify(): void {
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  onClickReset(): void {
    this.editionLicenseOrderService.resetEditOrderLicense();
  }

}
