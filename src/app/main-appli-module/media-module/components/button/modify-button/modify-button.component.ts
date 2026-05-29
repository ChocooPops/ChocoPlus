import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { EditionParametersService } from '../../../../edition-module/services/edition-parameters/edition-parameters.service';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-modify-button',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './modify-button.component.html',
  styleUrls: ['./modify-button.component.css', '../../../../common-module/styles/movie-button.css']
})
export class ModifyButtonComponent {

  @Input() cursor: boolean = true;
  @Input() typeButton: boolean = false;
  @Input() typeDisplaying: boolean = false;
  @Input() idMedia !: number;
  @Input() mediaType !: MediaTypeModel;

  isHover: boolean = false;
  srcImageEnter: String = "icon/modifyEnter.svg";
  srcImageLeave: String = "icon/modifyLeave.svg"
  modify: String = "icon/modify.svg";

  constructor(private readonly editionParametersService: EditionParametersService) { }

  onMouseEnter(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

  onClick(): void {
    if (!this.cursor) return;
    if (this.idMedia && this.mediaType) {
      if (this.mediaType === MediaTypeModel.MOVIE) {
        this.editionParametersService.navigateToEditionByType(this.idMedia, MenuType.MODIFY_MOVIE);
      } else if (this.mediaType === MediaTypeModel.SERIES) {
        this.editionParametersService.navigateToEditionByType(this.idMedia, MenuType.MODIFY_SERIES);
      }
    }
  }

}
