import { Component, inject } from '@angular/core';
import { PosterAbstraction } from '../poster-abstraction.directive';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';
import { SelectionType } from '../../../models/selection-type.enum';
import { TitleCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { NewsAlertComponent } from '../news-alert/news-alert.component';
import { MediaLogoDisplayService } from '../../../../common-module/services/media-logo-display/media-logo-display.service';

@Component({
  selector: 'app-horizontal-poster',
  standalone: true,
  imports: [NgClass, NewsAlertComponent, TranslatePipe, StartButtonComponent, ModifyButtonComponent, MylistButtonComponent, TitleCasePipe],
  templateUrl: './horizontal-poster.component.html',
  styleUrls: ['./horizontal-poster.component.css', '../../../../common-module/styles/animation.css', '../../../../common-module/styles/movie-button.css']
})
export class HorizontalPosterComponent extends PosterAbstraction {

  override typePoster: SelectionType = SelectionType.HORIZONTAL_POSTER;
  protected override transformScale: number = 1.7;

  private readonly mediaLogoDisplayService = inject(MediaLogoDisplayService);
  showLogo: boolean = this.mediaLogoDisplayService.getShowLogo();

  logoLoaded: boolean = false;

  onLogoLoad(): void {
    this.logoLoaded = true;
  }

  onErrorLogo(): void {
    this.srcLogo = undefined;
    this.logoLoaded = false;
  }

}
