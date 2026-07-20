import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../../button/modify-button/modify-button.component';
import { CrossButtonComponent } from '../../../button/cross-button/cross-button.component';
import { MylistButtonComponent } from '../../../button/mylist-button/mylist-button.component';
import { FormatMediaPageButtonComponent } from '../../../button/format-media-page-button/format-media-page-button.component';
import { MediaBackgroundVerticalComponent } from '../media-vertical-background/media-background.component';
import { MovieVerticalPageComponent } from '../movie-vertical-page/movie-page.component';
import { SeriesVerticalPageComponent } from '../series-vertical-page/series-page.component';
import { MediaPageAbstraction } from '../../media-page-abstraction.directive';
import { ProgressStateMedia } from '../../../../models/progress-state-media.enum';
import { MediaProgressingModel } from '../../../../../video-playing-module/models/media-progressing.interface';

@Component({
  selector: 'app-media-vertical-page',
  standalone: true,
  imports: [MovieVerticalPageComponent, SeriesVerticalPageComponent, MediaBackgroundVerticalComponent, FormatMediaPageButtonComponent, CrossButtonComponent, MylistButtonComponent, ModifyButtonComponent, StartButtonComponent, NgClass],
  templateUrl: './media-page.component.html',
  styleUrls: ['./media-page.component.css', '../../../../../common-module/styles/animation.css']
})
export class MediaVerticalPageComponent extends MediaPageAbstraction {
    
    ProgressState = ProgressStateMedia;
    historicProgress: MediaProgressingModel | undefined = undefined;

    saveHistoric(historic: MediaProgressingModel | undefined): void {
      this.historicProgress = historic;
    }

}
