import { Component } from '@angular/core';
import { EditionParametersService } from '../../services/edition-parameters/edition-parameters.service';
import { EditionParameterModel } from '../../models/editionParamater.interface';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edition-parameters',
  standalone: true,
  imports: [NgClass],
  templateUrl: './edition-parameters.component.html',
  styleUrl: './edition-parameters.component.css'
})
export class EditionParametersComponent {

  editionParameters: EditionParameterModel[] = [];
  srcImageArrow: string = "icon/arrow.svg";

  constructor(private editionParametersService: EditionParametersService,
    private router: Router
  ) {
    this.editionParameters = this.editionParametersService.getAllEditionParameters();
  }

  ngOnInit(): void {
    if (this.router.url === '/main-app/edition') {
      this.editionParametersService.navigateToUnderParametersClicked();
    }
  }

  onClickParameter(id: number): void {
    this.editionParametersService.toggleIfParameterIsClickedById(id);
  }

  onClickUnderParameter(idParam: number, idUnderParam: number): void {
    this.editionParametersService.toggleIfUnderParameterIsClickedById(idParam, idUnderParam);
  }

}
