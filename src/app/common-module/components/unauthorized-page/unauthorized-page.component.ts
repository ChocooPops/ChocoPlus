import { Component } from '@angular/core';
import { EditionParametersService } from '../../../main-appli-module/edition-module/services/edition-parameters/edition-parameters.service';
import { UserParametersService } from '../../../main-appli-module/user-module/service/user-parameters/user-parameters.service';
import { Router } from '@angular/router';

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
    private readonly userParametersService: UserParametersService,
    private readonly router: Router
  ) {
    const url: string = this.router.url;
    if (url.includes('/edition')) {
      this.editionParametersService.resetAllUnderParameterIsClicked();
    }
    if (url.includes('/user')) {
      this.userParametersService.resetAllUserParametersIsClicked();
    }
  }

}
