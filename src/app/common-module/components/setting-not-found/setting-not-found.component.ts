import { Component } from '@angular/core';
import { EditionParametersService } from '../../../main-appli-module/edition-module/services/edition-parameters/edition-parameters.service';
import { UserParametersService } from '../../../main-appli-module/user-module/service/user-parameters/user-parameters.service';

@Component({
  selector: 'app-setting-not-found',
  standalone: true,
  imports: [],
  templateUrl: './setting-not-found.component.html',
  styleUrl: './setting-not-found.component.css'
})
export class SettingNotFoundComponent {

  srcImage: string = "icon/not-found.svg";

  constructor(private readonly editionParametersService: EditionParametersService,
    private readonly userParametersService: UserParametersService
  ) {
    this.editionParametersService.resetAllUnderParameterIsClicked();
    this.userParametersService.resetAllUserParametersIsClicked();
  }

}
