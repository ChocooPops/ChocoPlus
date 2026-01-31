import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { EditionParametersService } from '../../../../edition-module/services/edition-parameters/edition-parameters.service';
import { MediaTypeModel } from '../../../models/media-type.enum';

@Component({
  selector: 'app-modify-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './modify-button.component.html',
  styleUrl: '../../../../common-module/styles/movie-button.css'
})
export class ModifyButtonComponent {

  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() idMedia !: number;
  @Input() mediaType !: MediaTypeModel;

  isHover: boolean = false;
  srcImageEnter: String = "icon/modifyEnter.svg";
  srcImageLeave: String = "icon/modifyLeave.svg"
  modify: String = "icon/modify.svg";

  constructor(private editionParametersService: EditionParametersService) { }

  onMouseEnter(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

  onClick(): void {
    if (this.idMedia && this.mediaType) {
      if (this.mediaType === MediaTypeModel.MOVIE) {
        this.editionParametersService.navigateToModifyMovie(this.idMedia);
      } else if (this.mediaType === MediaTypeModel.SERIES) {
        this.editionParametersService.navigateToModifySeries(this.idMedia);
      }
    }
  }

}
