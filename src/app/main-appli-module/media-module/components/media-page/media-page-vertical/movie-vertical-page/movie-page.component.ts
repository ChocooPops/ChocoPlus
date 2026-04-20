import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VerifTimerShowService } from '../../../../../common-module/services/verif-timer/verif-timer-show.service';
import { ImagePreloaderService } from '../../../../../../common-module/services/image-preloader/image-preloader.service';
import { CompressedPosterService } from '../../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SimilarTitleService } from '../../../../services/similar-title/similar-title.service';
import { SelectionType } from '../../../../models/selection-type.enum';
import { ScalePoster } from '../../../../../common-module/models/scale-poster.enum';
import { NgClass } from '@angular/common';
import { MediaSelectedService } from '../../../../services/media-selected/media-selected.service';
import { ProgressStateMedia } from '../../../../models/progress-state-media.enum';
import { HistoricWatchProgressService } from '../../../../../video-playing-module/services/historic-watch-progress/historic-watch-progress.service';
import { MediaProgressingModel } from '../../../../../video-playing-module/models/media-progressing.interface';
import { MoviePageAbstraction } from '../../movie-page-abstraction.directive';
import { SimilarPosterHorizontalComponent } from '../../../posters/similar-poster-horizontal/similar-poster-horizontal.component';
import { SimilarPosterHorizontalLoadingComponent } from '../../../posters/similar-poster-horizontal-loading/similar-poster-horizontal-loading.component';
import { FormatMediaPageButtonService } from '../../../../services/format-media-page/format-media-page-button.service';

@Component({
  selector: 'app-movie-vertical-page',
  standalone: true,
  imports: [DatePipe, SimilarPosterHorizontalLoadingComponent, SimilarPosterHorizontalComponent, NgClass],
  templateUrl: './movie-page.component.html',
  styleUrls: ['./movie-page.component.css', '../../../../../common-module/styles/animation.css', '../../media-page.css']
})
export class MovieVerticalPageComponent extends MoviePageAbstraction {

  @Input() displaying: boolean = false;
  @Output() posterLoading = new EventEmitter<void>();

  poster: string | undefined = undefined;

  duration !: string;
  quality !: string;
  date !: Date | null;

  ProgressState = ProgressStateMedia;
  historicProgress!: MediaProgressingModel;

  constructor(imagePreloaderService: ImagePreloaderService,
    similarTitleService: SimilarTitleService,
    mediaSelectedService: MediaSelectedService,
    formatMediaPageButtonService: FormatMediaPageButtonService,
    private readonly verifTimerShowService: VerifTimerShowService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly historicWatchProgressService: HistoricWatchProgressService) { 
      super(imagePreloaderService, similarTitleService, mediaSelectedService, formatMediaPageButtonService);
    }

  protected resetInfoSpe(): void {
    this.poster = undefined;
    this.duration = '';
    this.date = null;
  }

  protected initSpe(): void {
    this.duration = this.verifTimerShowService.extractHourAndMinute(this.movie?.time) || '2015';
    this.quality = this.movie?.quality || 'any quality';
    this.date = this.movie.date || new Date();

    if (this.movie) {
      this.poster = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, this.movie, ScalePoster.SCALE_300h);
    }
    if (!this.poster) {
      this.onLoadPoster();
    }
    this.historicProgress = this.historicWatchProgressService.getHistoricMovieProgressById(this.movie.id, this.movie.watchProgress, this.movie.stateProgress);
  }

  onErrorPoster(): void {
    this.poster = undefined;
    this.posterLoading.emit();
  }

  onLoadPoster(): void {
    this.posterLoading.emit();
  }

}
