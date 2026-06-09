import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MediaModel } from '../../../../models/media.interface';
import { CompressedPosterService } from '../../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SelectionType } from '../../../../models/selection-type.enum';
import { StartButtonComponent } from '../../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../../button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../../button/mylist-button/mylist-button.component';
import { FormatMediaPageButtonComponent } from '../../../button/format-media-page-button/format-media-page-button.component';
import { NgClass } from '@angular/common';
import { ScalePoster } from '../../../../../common-module/models/scale-poster.enum';
import { BidiModule } from "@angular/cdk/bidi";
import { MediaTypeModel } from '../../../../models/media-type.enum';
import { VerifTimerShowService } from '../../../../../common-module/services/verif-timer/verif-timer-show.service';
import { MovieModel } from '../../../../models/movie-model';
import { DatePipe } from '@angular/common';
import { SeasonModel } from '../../../../models/series/season.interface';
import { SeriesModel } from '../../../../models/series/series.interface';
import { ProgressStateMedia } from '../../../../models/progress-state-media.enum';
import { MediaProgressingModel } from '../../../../../video-playing-module/models/media-progressing.interface';
import { HistoricWatchProgressService } from '../../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-media-horizontal-background',
  standalone: true,
  imports: [NgClass, TranslatePipe, DatePipe, StartButtonComponent, ModifyButtonComponent, MylistButtonComponent, FormatMediaPageButtonComponent, BidiModule],
  templateUrl: './media-horizontal-background.component.html',
  styleUrls: ['./media-horizontal-background.component.css', '../../../../../common-module/styles/animation.css'],
})
export class MediaHorizontalBackgroundComponent {

  @Input() media!: MediaModel;
  @Input() seasons!: SeasonModel[] | undefined;
  @Output() formatEmit = new EventEmitter<void>();
  MediaType = MediaTypeModel;

  srcPoster!: string | undefined;
  srcLogo!: string | undefined;
  srcBackground!: string | undefined;
  title!: string;

  displaying: boolean = false;

  private posterLoaded: boolean = false;
  private logoLoaded: boolean = false;
  private backgroundLoaded: boolean = false;

  duration!: string;
  resolution!: string;
  nbSeasons!: number;

  ProgressState = ProgressStateMedia;
  historicProgress!: MediaProgressingModel;

  constructor(private readonly compressedPosterService: CompressedPosterService,
    private readonly verifTimerShowService: VerifTimerShowService,
    private readonly historicWatchProgressService: HistoricWatchProgressService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['media']) {
      this.init();
    }
  }

  private init(): void {
    this.resetLoading();

    this.srcPoster = this.compressedPosterService.getPosterMedia(SelectionType.SPECIAL_POSTER, this.media, ScalePoster.SCALE_ORIGINAL);
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentation(this.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForMediaPresentation(this.media);
    this.title = this.media.title;

    if (!this.srcPoster) this.onPosterLoad();
    if (!this.srcLogo) this.onLogoLoad();
    if (!this.srcBackground) this.onBackgroundLoad();

    if (this.media.mediaType === MediaTypeModel.MOVIE) {
      this.duration = this.verifTimerShowService.extractHourAndMinute((this.media as MovieModel).duration) || '2015';
      this.resolution = (this.media as MovieModel)?.resolution || 'any quality';
      this.historicProgress = this.historicWatchProgressService.getHistoricMovieProgressById(this.media.id, (this.media as MovieModel).watchProgress, (this.media as MovieModel).stateProgress);
    } else if (this.media.mediaType === MediaTypeModel.SERIES) {
      this.nbSeasons = (this.media as SeriesModel).seasons.length;
    }
  }

  private resetLoading(): void {
    this.posterLoaded = false;
    this.logoLoaded = false;
    this.backgroundLoaded = false;
    this.displaying = false;
  }

  private checkAllLoaded(): void {
    if (this.posterLoaded && this.logoLoaded && this.backgroundLoaded) {
      this.displaying = true;
    }
  }

  onPosterLoad(): void {
    this.posterLoaded = true;
    this.checkAllLoaded();
  }

  onErrorImagePoster(): void {
    this.srcPoster = undefined;
    this.onPosterLoad();
  }

  onLogoLoad(): void {
    this.logoLoaded = true;
    this.checkAllLoaded();
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
    this.onLogoLoad();
  }

  onBackgroundLoad(): void {
    this.backgroundLoaded = true;
    this.checkAllLoaded();
  }

  onErrorImageBackground(): void {
    this.srcBackground = undefined;
    this.onBackgroundLoad();
  }

  onClickFormatMediaPage(): void {
    this.formatEmit.emit();
  }

}
