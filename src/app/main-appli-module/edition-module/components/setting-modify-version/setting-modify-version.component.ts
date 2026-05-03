import { Component } from '@angular/core';
import { VersionService } from '../../../../common-module/services/service/version.service';
import { VersionModel } from '../../../../launch-module/models/version.interface';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { Subscription, take } from 'rxjs';
import { EditVersionComponent } from '../edit-version/edit-version.component';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-setting-modify-version',
  standalone: true,
  imports: [EditVersionComponent, PopupComponent],
  templateUrl: './setting-modify-version.component.html',
  styleUrls: ['./setting-modify-version.component.css', '../../styles/edition.css', '../../../../common-module/styles/loader.css']
})
export class SettingModifyVersionComponent extends UnauthorizedError {

  protected override menuType: MenuType = MenuType.VERSION;
  versions: VersionModel[] | undefined = [];
  subscription!: Subscription;
  srcReset: string = 'icon/modify.svg';

  constructor(private readonly versionService: VersionService,
    editionParametersService: EditionParametersService
  ) {
    super(editionParametersService);
    this.toggleUnderParameter();
   }

  ngOnInit(): void {
    this.setSubscription();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private setSubscription(): void {
    this.unsubscribe();
    this.subscription = this.versionService.fetchAllLastVersion().pipe(take(1)).subscribe((data: VersionModel[]) => {
      this.versions = data;
    });
  }

  private unsubscribe(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  emitActionData(): void {

  }
  
  onClickReset(): void {
    this.versions = undefined;
    this.setSubscription();
  }

}
