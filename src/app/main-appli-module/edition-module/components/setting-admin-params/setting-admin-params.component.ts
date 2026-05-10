import { Component } from '@angular/core';
import { PopupComponent } from '../popup/popup.component';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';
import { take } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminParamsService } from '../../services/admin-params/admin-params.service';

@Component({
  selector: 'app-setting-admin-params',
  standalone: true,
  imports: [PopupComponent, JsonViewerComponent, TranslatePipe],
  templateUrl: './setting-admin-params.component.html',
  styleUrls: ['./setting-admin-params.component.css', '../../styles/edition.css']
})
export class SettingAdminParamsComponent extends UnauthorizedError {

  protected override menuType: MenuType = MenuType.OTHER_PARAM_ADMIN;

  private type!: 1 | 2 | 3;
  private message: string = 'EDITION.OTHER_PARAMS.MESSAGE_EXECUTE_CALL';
  public object: any | undefined = undefined;

  constructor(private readonly adminParamsService: AdminParamsService,
    editionParametersService: EditionParametersService
  ) {
    super(editionParametersService);
    this.toggleUnderParameter();
  }

  public emitActionData(): void {
    this.onFetching();
    if (this.type === 1) {
      this.fetchResetAllSimilarTitles();
    } else if (this.type === 2) {
      this.fetchReloadAllProfilPhoto();
    } else if (this.type === 3) {
      this.fetchSaveAllNewCredit();
    }
  }

  onClickButton(type: 1 | 2 | 3): void {
    this.type = type;
    this.popup.setDisplayButton(true);
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
  }

  private onFetching(): void {
    this.object = undefined;
    this.popup.setMessage(undefined, undefined);
    this.popup.setDisplayButton(false);
  }

  private endTask(data: any): void {
    this.popup.setDisplayPopup(false);
    this.object = data;
  }

  private fetchResetAllSimilarTitles(): void {
    this.adminParamsService.fetchResetAllSimilarTitles().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    });
  }
  private fetchReloadAllProfilPhoto(): void {
    this.adminParamsService.fetchReloadAllProfilPhoto().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    })
  }
  private fetchSaveAllNewCredit(): void {
    this.adminParamsService.fetchSaveAllNewCredit().pipe(take(1)).subscribe({
      next: (data: any) => {
        this.endTask(data);
      },
      error: (error: HttpErrorResponse) => {
        this.endTask(error);
      }
    })
  }

}
