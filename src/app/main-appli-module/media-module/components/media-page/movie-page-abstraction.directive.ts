import { Directive, Input, SimpleChanges } from '@angular/core';
import { MovieModel } from '../../models/movie-model';
import { MediaModel } from '../../models/media.interface';
import { Subscription, take } from 'rxjs';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SimilarTitleService } from '../../services/similar-title/similar-title.service';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { MediaInfoModel } from '../../models/media-info.interface';
import { StaffModel } from '../../models/staff.interface';
import { JobModel } from '../../models/job.eum';

@Directive({})
export abstract class MoviePageAbstraction {
  
  @Input() movie!: MovieModel;
  protected abortController = new AbortController();
  protected subscriptionSimilarTitles!: Subscription;
  protected subscriptionMovieInfo!: Subscription;

  directors: StaffModel[] = [];
  actors: StaffModel[] = [];
  genre: string = '';
  keyWord: string = '';
  description!: string;

  mediaInfoLoaded: boolean = false;

  similarMedias: MediaModel[] | undefined = undefined;
  similarMediasLoading: number[] = [];

  JobModel = JobModel;

  constructor(
    protected readonly imagePreloaderService: ImagePreloaderService,
    protected readonly similarTitleService: SimilarTitleService,
    protected readonly mediaSelectedService: MediaSelectedService,
  ) {}

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

  private initSimilarLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
  }

  private resetInfo(): void {
    this.resetInfoSpe();
    this.directors = [];
    this.actors = [];
    this.genre = '';
    this.keyWord = '';
    this.description = '';
    this.similarMedias = undefined;
  }

  private init(): void {
    this.initSpe();
    this.mediaInfoLoaded = false;
    this.description = this.movie?.description || '';

    setTimeout(() => {
      this.fetchSimilarMovie();
      this.fetchMediaInfo();
    }, 100);
  }

  fetchSimilarMovie(): void {
    if (this.movie) {
      if (this.subscriptionSimilarTitles) {
        this.subscriptionSimilarTitles.unsubscribe();
      }
      this.abortController.abort();
      this.subscriptionSimilarTitles = this.similarTitleService
        .fetchSimilarTitlesForOneMovieById(this.movie.id)
        .pipe(take(1))
        .subscribe((data: MediaModel[]) => {
          const img: string[] =
            this.imagePreloaderService.getPosterFromMediaListToLoad(
              data,
              FormatPosterModel.HORIZONTAL,
            );
          this.imagePreloaderService
            .preloadImages(img, this.abortController.signal)
            .finally(() => {
              this.similarMedias = data;
            });
        });
    }
  }

  fetchMediaInfo(): void {
    if (this.movie) {
      if (this.subscriptionMovieInfo) {
        this.subscriptionMovieInfo.unsubscribe();
      }
      this.subscriptionMovieInfo = this.mediaSelectedService
        .fetchGetMediaInfoById(this.movie.id)
        .pipe(take(1))
        .subscribe((info: MediaInfoModel | null) => {
          if (info) {
            this.genre = info.categories.map((item) => item.name).join(', ');
            this.keyWord = info.keyWords
              .map((item) => this.transform(item))
              .join(', ');
            this.actors = info.actors;
            this.directors = info.directors;
          }
          this.mediaInfoLoaded = true;
        });
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

  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;

}
