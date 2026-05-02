import { Component } from '@angular/core';
import { SettingCreditAbstraction } from '../abstract-components/setting-credit-abstraction.directive';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from '../popup/popup.component';
import { InputImageEditionComponent } from "../input-image-edition/input-image-edition.component";
import { InputTextEditionComponent } from "../input-text-edition/input-text-edition.component";
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { InputNumberEditionComponent } from "../input-number-edition/input-number-edition.component";
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { CreditService } from '../../../media-module/services/credit/credit.service';
import { TmdbOperationService } from '../../services/tmdb-operation/tmdb-operation.service';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';

@Component({
  selector: 'app-setting-add-credit',
  standalone: true,
  imports: [PopupComponent, AiButtonComponent, InputImageEditionComponent, InputTextEditionComponent, ButtonRemoveComponent, ButtonSaveComponent, InputNumberEditionComponent],
  templateUrl: './setting-add-credit.component.html',
  styleUrls: ['./setting-add-credit.component.css', '../../styles/edition.css']
})
export class SettingAddCreditComponent extends SettingCreditAbstraction {
  
  private message: string = 'Cette action ajoutera un nouveau crédit';
  protected override menuType: MenuType = MenuType.ADD_CREDIT;

  constructor(creditService: CreditService,
    tmdbOperationService: TmdbOperationService,
    editionParametersService: EditionParametersService
  ) {
    super(creditService, tmdbOperationService, editionParametersService);
    this.toggleUnderParameter();
  }

  public onClickAddCredit(): void {
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public emitAddCredit(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    this.creditService.fetchCreateNewCredit().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setEndTask(true);
        this.popup.setMessage(data.message, data.state);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 1);
      }
    });    
  }

  public onClickReset(): void {
    this.creditService.resetEditCredit();
  }

}
