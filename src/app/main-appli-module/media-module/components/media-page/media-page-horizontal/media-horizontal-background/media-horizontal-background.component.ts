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

@Component({
  selector: 'app-media-horizontal-background',
  standalone: true,
  imports: [NgClass, DatePipe, StartButtonComponent, ModifyButtonComponent, MylistButtonComponent, FormatMediaPageButtonComponent, BidiModule],
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

  isLogoLoading: boolean = false;
  isBackLoading: boolean = false;
  isPosterLoading: boolean = false;
  displaying: boolean = false;

  duration!: string;
  quality!: string;
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
    this.srcPoster = this.compressedPosterService.getPosterMedia(SelectionType.SPECIAL_POSTER, this.media, ScalePoster.SCALE_ORIGINAL);
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentation(this.media, ScalePoster.SCALE_ORIGINAL);
    this.srcBackground = this.compressedPosterService.getBackgroundForMediaPresentation(this.media, ScalePoster.SCALE_ORIGINAL);
    this.title = this.media.title;

    if (!this.srcPoster) {
      this.onPosterLoad();
    }
    if (!this.srcLogo) {
      this.onLogoLoad();
    }
    if (!this.srcBackground) {
      this.onBackgroundLoad();
    }

    if (this.media.mediaType === MediaTypeModel.MOVIE) {
      this.duration = this.verifTimerShowService.extractHourAndMinute((this.media as MovieModel).time) || '2015';
      this.quality = (this.media as MovieModel)?.quality || 'any quality';
      this.historicProgress = this.historicWatchProgressService.getHistoricMovieProgressById(this.media.id, (this.media as MovieModel).watchProgress, (this.media as MovieModel).stateProgress);
    } else if (this.media.mediaType === MediaTypeModel.SERIES) {
      this.nbSeasons = (this.media as SeriesModel).seasons.length;
    }
  }

  onErrorImagePoster(): void {
    this.srcPoster = undefined;
    this.onLogoLoad();
  }
  onPosterLoad(): void {
    this.isPosterLoading = true;
    if (this.isBackLoading && this.isLogoLoading && this.isPosterLoading) {
      this.displaying = true;
    }
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
    this.onLogoLoad();
  }
  onLogoLoad(): void {
    this.isLogoLoading = true;
    if (this.isBackLoading && this.isPosterLoading && this.isPosterLoading) {
      this.displaying = true;
    }
  }

  onErrorImageBackground(): void {
    this.srcBackground = undefined;
    this.onBackgroundLoad();
  }
  onBackgroundLoad(): void {
    this.isBackLoading = true;
    if (this.isLogoLoading && this.isPosterLoading && this.isPosterLoading) {
      this.displaying = true;
    }
  }

  resetImageLoading(): void {
    this.isBackLoading = false;
    this.isLogoLoading = false;
    this.isPosterLoading = false;
    this.displaying = false;
  }

  onClickFormatMediaPage(): void {
    this.formatEmit.emit();
  }

}
