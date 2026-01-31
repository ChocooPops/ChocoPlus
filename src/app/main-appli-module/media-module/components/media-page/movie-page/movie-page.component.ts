import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SimilarPosterLoadingComponent } from '../../posters/similar-poster-loading/similar-poster-loading.component';
import { SimilarPosterComponent } from '../../posters/similar-poster/similar-poster.component';
import { MediaModel } from '../../../models/media.interface';
import { MovieModel } from '../../../models/movie-model';
import { Subscription, take } from 'rxjs';
import { FormatPosterModel } from '../../../../common-module/models/format-poster.enum';
import { VerifTimerShowService } from '../../../../common-module/services/verif-timer/verif-timer-show.service';
import { ImagePreloaderService } from '../../../../../common-module/services/image-preloader/image-preloader.service';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { SimilarTitleService } from '../../../services/similar-title/similar-title.service';
import { SelectionType } from '../../../models/selection-type.enum';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { NgClass } from '@angular/common';
import { MediaSelectedService } from '../../../services/media-selected/media-selected.service';

@Component({
  selector: 'app-movie-page',
  standalone: true,
  imports: [DatePipe, SimilarPosterLoadingComponent, SimilarPosterComponent, NgClass],
  templateUrl: './movie-page.component.html',
  styleUrls: ['./movie-page.component.css', '../../../../common-module/styles/animation.css', '../media-page.css']
})
export class MoviePageComponent {

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

  constructor(private verifTimerShowService: VerifTimerShowService,
    private imagePreloaderService: ImagePreloaderService,
    private compressedPosterService: CompressedPosterService,
    private similarTitleService: SimilarTitleService,
    private mediaSelectedService: MediaSelectedService) { }

  ngOnInit(): void {
    this.initSimilarLoading();
  }

  ngOnDestroy(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
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
    this.duration = this.verifTimerShowService.extractHourAndMinute(this.movie?.time) || '2015';
    this.quality = this.movie?.quality || 'any quality';
    this.date = this.movie.date || new Date();
    this.description = this.movie?.description || '';
    if (this.movie.categories) {
      this.genre = this.movie.categories.map(item => item.name).join(', ');
    }
    if (this.movie.keyWord) {
      this.keyWord = this.movie.keyWord.map(item => this.transform(item)).join(', ');
    }
    if (this.movie.actors) {
      this.actors = this.movie.actors.join(', ');
    }
    if (this.movie.directors) {
      this.director = this.movie.directors.join(', ');
    }
    if (this.movie) {
      this.poster = this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, this.movie, ScalePoster.SCALE_300h);
    }
    if (!this.poster) {
      this.onLoadPoster();
    }
    setTimeout(() => {
      this.fetchSimilarMovie();
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
