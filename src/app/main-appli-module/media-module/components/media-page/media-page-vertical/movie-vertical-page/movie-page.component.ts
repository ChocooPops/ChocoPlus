import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SimilarPosterLoadingComponent } from '../../../posters/similar-poster-loading/similar-poster-loading.component';
import { SimilarPosterComponent } from '../../../posters/similar-poster/similar-poster.component';
import { MediaModel } from '../../../../models/media.interface';
import { MovieModel } from '../../../../models/movie-model';
import { Subscription, take } from 'rxjs';
import { FormatPosterModel } from '../../../../../common-module/models/format-poster.enum';
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
import { MediaInfoModel } from '../../../../models/media-info.interface';

@Component({
  selector: 'app-movie-vertical-page',
  standalone: true,
  imports: [DatePipe, SimilarPosterLoadingComponent, SimilarPosterComponent, NgClass],
  templateUrl: './movie-page.component.html',
  styleUrls: ['./movie-page.component.css', '../../../../../common-module/styles/animation.css', '../../media-page.css']
})
export class MovieVerticalPageComponent {

  @Input() movie !: MovieModel;
  @Input() displaying: boolean = false;
  @Output() posterLoading = new EventEmitter<void>();
  private abortController = new AbortController();

  duration !: string;
  quality !: string;
  director !: string;
  actors !: string;
  date !: Date | null;
  genre: string = '';
  keyWord: string = '';
  description !: string;
  poster: string | undefined = undefined;

  similarMedias: MediaModel[] | undefined = undefined;
  similarMediasLoading: number[] = [];
  subscriptionSimilarTitles !: Subscription;
  subscriptionMovieInfo!: Subscription;

  ProgressState = ProgressStateMedia;
  historicProgress!: MediaProgressingModel;

  mediaInfoLoaded: boolean = false;

  constructor(private verifTimerShowService: VerifTimerShowService,
    private imagePreloaderService: ImagePreloaderService,
    private compressedPosterService: CompressedPosterService,
    private similarTitleService: SimilarTitleService,
    private mediaSelectedService: MediaSelectedService,
    private historicWatchProgressService: HistoricWatchProgressService) { }

  ngOnInit(): void {
    this.initSimilarLoading();
  }

  ngOnDestroy(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
    if (this.subscriptionMovieInfo) {
      this.subscriptionMovieInfo.unsubscribe();
    }
    this.abortController.abort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movie']) {
      this.resetInfo();
      this.init();
    }
  }

  private resetInfo(): void {
    this.poster = undefined;
    this.duration = '';
    this.director = '';
    this.actors = '';
    this.genre = '';
    this.keyWord = '';
    this.description = '';
    this.similarMedias = undefined;
    this.date = null;
  }

  private init(): void {
    this.mediaInfoLoaded = false;
    this.duration = this.verifTimerShowService.extractHourAndMinute(this.movie?.time) || '2015';
    this.quality = this.movie?.quality || 'any quality';
    this.date = this.movie.date || new Date();
    this.description = this.movie?.description || '';
    
    if (this.movie) {
      this.poster = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, this.movie, ScalePoster.SCALE_300h);
    }
    if (!this.poster) {
      this.onLoadPoster();
    }
    this.historicProgress = this.historicWatchProgressService.getHistoricMovieProgressById(this.movie.id, this.movie.watchProgress, this.movie.stateProgress);
    setTimeout(() => {
      this.fetchSimilarMovie();
      this.fetchMediaInfo();
    }, 100)
  }

  private initSimilarLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
  }

  fetchSimilarMovie(): void {
    if (this.movie) {
      if (this.subscriptionSimilarTitles) {
        this.subscriptionSimilarTitles.unsubscribe();
      }
      this.abortController.abort();
      this.subscriptionSimilarTitles = this.similarTitleService.fetchSimilarTitlesForOneMovieById(this.movie.id).pipe(take(1)).subscribe((data: MediaModel[]) => {
        const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(data, FormatPosterModel.HORIZONTAL);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.similarMedias = data;
        })
      })
    }
  }

  fetchMediaInfo(): void {
    if (this.movie) {
      if (this.subscriptionMovieInfo) {
        this.subscriptionMovieInfo.unsubscribe();
      }
      this.subscriptionMovieInfo = this.mediaSelectedService.fetchGetMediaInfoById(this.movie.id).pipe(take(1)).subscribe((info: MediaInfoModel | null) => {
        if (info) {
            this.genre = info.categories.map(item => item.name).join(', ');
            this.keyWord = info.keyWords.map(item => this.transform(item)).join(', ');
            this.actors = info.actors.map(item => item.fullName).join(', ');
            this.director = info.actors.map(item => item.fullName).join(', ');
        }
        this.mediaInfoLoaded = true;
      })
    }
  }

  private transform(value: string): string {
    if (!value) return '';
    value = value.trimStart();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  onErrorPoster(): void {
    this.poster = undefined;
    this.posterLoading.emit();
  }

  onLoadPoster(): void {
    this.posterLoading.emit();
  }

}
