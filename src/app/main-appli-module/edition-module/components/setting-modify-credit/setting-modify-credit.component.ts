import { Component } from '@angular/core';
import { CreditService } from '../../../media-module/services/credit/credit.service';
import { ActivatedRoute } from '@angular/router';
import { SettingCreditAbstraction } from '../abstract-components/setting-credit-abstraction.directive';
import { TmdbOperationService } from '../../services/tmdb-operation/tmdb-operation.service';
import { map, distinctUntilChanged, take } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from '../popup/popup.component';
import { InputTextEditionComponent } from '../input-text-edition/input-text-edition.component';
import { InputNumberEditionComponent } from '../input-number-edition/input-number-edition.component';
import { InputImageEditionComponent } from '../input-image-edition/input-image-edition.component';
import { AiButtonComponent } from '../ai-button/ai-button.component';
import { InputResearchCreditComponent } from '../input-search-components/input-research-credit/input-research-credit.component';
import { MediaCreditModel } from '../../../media-module/models/media-credit.interface';
import { ButtonRemoveComponent } from '../button-remove/button-remove.component';
import { ButtonSaveComponent } from '../button-save/button-save.component';

@Component({
  selector: 'app-setting-modify-credit',
  standalone: true,
  imports: [PopupComponent, ButtonRemoveComponent, ButtonSaveComponent, InputResearchCreditComponent, InputTextEditionComponent, InputNumberEditionComponent, InputImageEditionComponent, AiButtonComponent],
  templateUrl: './setting-modify-credit.component.html',
  styleUrls: ['./setting-modify-credit.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyCreditComponent extends SettingCreditAbstraction {

  private readonly messageDelete: string = 'Cette action supprimera définitvement le crédit associé';
  private readonly messageModify: string = 'Cette action enregistrera les modifications faites au crédit associé';
  private typeOperation !: number;

  constructor(creditService: CreditService,
    tmdbOperationService: TmdbOperationService,
    private readonly route: ActivatedRoute
  ) {
    super(creditService, tmdbOperationService)
  }

  setCreditWantedToModify(credit: MediaCreditModel) {
    this.displayLoader = true;
    this.creditService.resetEditCredit();
    this.creditService.setEditCreditImmediatlyByIdCredit(credit.id);
  }

  override ngOnInit(): void {
    this.subscriptionMain = this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      distinctUntilChanged()
    ).subscribe((id: string | null) => {
      this.creditService.resetEditCredit();
      this.initSubscriptionOfEditCredit();
      if (id) {
        this.creditService.setEditCreditImmediatlyByIdCredit(Number(id));
      }
    });
  }

  override ngOnDestroy(): void {
    this.unsubscribeAllSubscription();
    this.creditService.resetEditCredit();
  }

  private emitModifyCredit(): void {
    this.creditService.fetchModifyCredit().pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 2);
      }
    });
  }

  private emitDeleteCredit(): void {
    this.creditService.fetchDeleteCredit().pipe(take(1)).subscribe({
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

  public onClickDeleteCredit(): void {
    this.typeOperation = 0;
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public onClickModifyCredit(): void {
    this.typeOperation = 1;
    this.popup.setMessage(this.messageModify, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }

  public emitActionData(): void {
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
    if (this.typeOperation === 0) {
      this.emitDeleteCredit();
    } else if (this.typeOperation === 1) {
      this.emitModifyCredit();
    }
  }

}
