import { Component } from '@angular/core';
import { EditionParametersService } from '../../../main-appli-module/edition-module/services/edition-parameters/edition-parameters.service';
import { UserParametersService } from '../../../main-appli-module/user-module/service/user-parameters/user-parameters.service';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [],
  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.css'
})
export class UnauthorizedPageComponent {

  srcImage: string = 'icon/unauthorized2.svg';

  constructor(private readonly editionParametersService: EditionParametersService,
    private readonly userParametersService: UserParametersService
  ) {
    this.editionParametersService.resetAllUnderParameterIsClicked();
    this.userParametersService.resetAllUserParametersIsClicked();
  }

}
