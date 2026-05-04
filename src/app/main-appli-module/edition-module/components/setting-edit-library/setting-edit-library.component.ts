import { Component } from '@angular/core';
import { UnauthorizedError } from '../abstract-components/unauthorized-error-abstract.directive';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../menu-module/model/menu-type.enum';
import { LibraryService } from '../../services/library/library.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-setting-edit-library',
  standalone: true,
  imports: [PopupComponent],
  templateUrl: './setting-edit-library.component.html',
  styleUrls: ['./setting-edit-library.component.css', '../../../../common-module/styles/loader.css', '../../styles/edition.css']
})
export class SettingEditLibraryComponent extends UnauthorizedError {

  protected override menuType: MenuType = MenuType.LIBRARY;

  constructor(editionParametersService: EditionParametersService,
    private readonly libraryService: LibraryService
  ) {
    super(editionParametersService);
    this.toggleUnderParameter();
  }

  public setAction(): void {

  }

}
