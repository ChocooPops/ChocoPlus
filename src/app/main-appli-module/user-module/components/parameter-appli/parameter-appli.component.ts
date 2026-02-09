import { Component } from '@angular/core';
import { ParameterAppliService } from '../../service/parameter-appli/parameter-appli.service';
import { InputRadioButtonComponent } from '../../../edition-module/components/input-radio-button/input-radio-button.component';
import { ParamaterAppliModel } from '../../dto/parameter-appli.interface';

@Component({
  selector: 'app-parameter-appli',
  standalone: true,
  imports: [InputRadioButtonComponent],
  templateUrl: './parameter-appli.component.html',
  styleUrl: './parameter-appli.component.css'
})
export class ParameterAppliComponent {

  radioButtonPosterFilm: ParamaterAppliModel[] = [];
  radioButtonPosterLicense: ParamaterAppliModel[] = [];
  radioButtonPosterFormat: ParamaterAppliModel[] = [];
  radioButtonOtherOption: ParamaterAppliModel[] = [];

  constructor(private parameterAppliService: ParameterAppliService) {
    this.parameterAppliService.initRadioButton();
    this.radioButtonPosterFilm = this.parameterAppliService.getRadioButtonForPosterFilm();
    this.radioButtonPosterLicense = this.parameterAppliService.getRadioButtonForPosterLicense();
    this.radioButtonPosterFormat = this.parameterAppliService.getRadioButtonForFormatPoster();
    this.radioButtonOtherOption = this.parameterAppliService.getRadioButtonOtherOption();
  }

  onChangePosterFilm(idParam: number, idRadioButton: number): void {
    this.parameterAppliService.onChangeEmitToPosterFilm(idParam, idRadioButton);
  }

  onChangePosterLicense(idParam: number, idRadioButton: number): void {
    this.parameterAppliService.onChangeEmitToPosterLicense(idParam, idRadioButton);
  }

  onChangePosterFormat(idParam: number, idRadioButton: number): void {
    this.parameterAppliService.onChangeEmitToPosterFormat(idParam, idRadioButton);
  }

  onChangeOpeningPage(idParam: number, idRadioButton: number): void {
    this.parameterAppliService.onChangeEmitToOpeningPage(idParam, idRadioButton);
  }

}
