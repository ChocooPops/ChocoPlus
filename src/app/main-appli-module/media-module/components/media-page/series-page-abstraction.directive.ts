import { Directive, Input, SimpleChanges } from '@angular/core';
import { SeriesModel } from '../../models/series/series.interface';
import { MediaModel } from '../../models/media.interface';
import { EpisodeModel } from '../../models/series/episode.interface';
import { Subscription, take } from 'rxjs';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaInfoModel } from '../../models/media-info.interface';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { SimilarTitleService } from '../../services/similar-title/similar-title.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SeriesService } from '../../services/series/series.service';
import { SeasonModel } from '../../models/series/season.interface';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { StaffModel } from '../../models/staff.interface';

@Directive({})
export abstract class SeriesPageAbstraction {
    
  @Input() series!: SeriesModel;
  protected abortController = new AbortController();

  protected subscriptionEpisodes!: Subscription;
  protected subscriptionSimilarTitles!: Subscription;
  protected subscriptionSeriesInfo!: Subscription;

  srcSucces: string = 'icon/success.svg';
  genre: string = '';
  keyWord: string = '';
  actors: StaffModel[] = [];
  directors: StaffModel[] = [];
  description!: string;
  mediaInfoLoaded: boolean = false;

  similarMedias: MediaModel[] | undefined = undefined;
  similarMediasLoading: number[] = [];

  seasons: {
    id: number;
    srcPoster: string | undefined;
    name: string;
    isClicked: boolean;
    seasonNumber: number;
  }[] = [];
  seasonsLoading: number[] = [];
  seasonsPosterTmp: number[] = [];
  episodes: EpisodeModel[] | undefined = [];

  constructor(
    protected readonly compressedPosterService: CompressedPosterService,
    protected readonly mediaSelectedService: MediaSelectedService,
    protected readonly similarTitleService: SimilarTitleService,
    protected readonly imagePreloaderService: ImagePreloaderService,
    protected readonly seriesService: SeriesService,
  ) {}

  ngOnInit(): void {
    this.initComponentLoading();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series']) {
      this.resetInfo();
      this.initComponentLoading();
      this.init();
      this.initSeasons();
      this.fetchDataSpe();
      this.fetchMediaInfo();
    }
  }

  ngOnDestroy(): void {
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    this.setUnsubscriptionSeriesInfo();
    this.abortController.abort();
  }

  private resetInfo(): void {
    this.resetInfoSpe();
    this.directors = [];
    this.actors = [];
    this.genre = '';
    this.keyWord = '';
    this.similarMedias = undefined;
    this.episodes = [];
    this.seasons = [];
    this.seasonsPosterTmp = [];
    this.description = '';
  }

  private setUnsubscribeEpisode(): void {
    if (this.subscriptionEpisodes) {
      this.subscriptionEpisodes.unsubscribe();
    }
  }
  private setUnsubscriptionSimilarTitle(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
  }
  private setUnsubscriptionSeriesInfo(): void {
    if (this.subscriptionSeriesInfo) {
      this.subscriptionSeriesInfo.unsubscribe();
    }
  }

  private init(): void {
    this.mediaInfoLoaded = false;
    this.initSpe();
    this.description = this.series?.description || '';
  }

  private initSeasons(): void {
    this.episodes = undefined;
    this.series.seasons.forEach((season: SeasonModel) => {
      this.seasons.push({
        id: season.id,
        srcPoster: this.compressedPosterService.getSeasonPoster(season),
        name: season.name,
        isClicked: season.isClicked,
        seasonNumber: season.seasonNumber,
      });
    });
    const iteration: number = 5 - this.seasons.length;
    for (let i = 0; i < iteration; i++) {
      this.seasonsPosterTmp.push(i);
    }
  }

  private initComponentLoading(): void {
    for (let i = 0; i < 9; i++) {
      this.similarMediasLoading.push(i);
    }
    for (let i = 0; i < 5; i++) {
      this.seasonsLoading.push(i);
    }
  }

  private transform(value: string): string {
    if (!value) return '';
    value = value.trimStart();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  onClickSeason(index: number): void {
    if (index < 0) return;
    this.series.seasons.forEach((s, i) => {
      s.isClicked = i === index;
    });
    this.seasons.forEach((s, i) => {
      s.isClicked = i === index;
    });
    this.fetchEpisodeBySeason(this.series.seasons[index].id, index);
  }

  protected fetchEpisodeBySeason(idSeason: number, indexSeason: number): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    if (this.series.seasons[indexSeason].episodes.length <= 0) {
      this.abortController.abort();
      this.subscriptionEpisodes = this.seriesService
        .fetchEpisodesBySeriesAndSeasonId(this.series.id, idSeason)
        .pipe(take(1))
        .subscribe((data: EpisodeModel[]) => {
          const img: string[] =
            this.imagePreloaderService.getPosterFromEpisodes(data);
          this.imagePreloaderService
            .preloadImages(img, this.abortController.signal)
            .finally(() => {
              this.series.seasons[indexSeason].episodes = data;
              this.episodes = this.series.seasons[indexSeason].episodes;
            });
        });
    } else {
      this.episodes = this.series.seasons[indexSeason].episodes;
    }
  }

  protected fetchSimilarMovie(): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    this.setUnsubscriptionSimilarTitle();
    this.abortController.abort();
    this.subscriptionSimilarTitles = this.similarTitleService
      .fetchSimilarTitlesForOneMovieById(this.series.id)
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

  protected fetchMediaInfo(): void {
    if (this.series) {
      this.setUnsubscriptionSeriesInfo();
      this.subscriptionSeriesInfo = this.mediaSelectedService
        .fetchGetMediaInfoById(this.series.id)
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

  onErrorPosterSeason(index: number): void {
    this.seasons[index].srcPoster = undefined;
  }

  onClickSimilarTitle(media: MediaModel): void {
    this.mediaSelectedService.selectMedia(media);
  }

  protected onLoadEpisodeByIdOrIndex(): void {
    if (this.series.seasons.length > 0) {
      const index = this.series.seasons.findIndex(
        (item: SeasonModel) => item.isClicked === true,
      );
      if (index >= 0) {
        this.fetchEpisodeBySeason(this.series.seasons[index].id, index);
      } else {
        this.series.seasons[0].isClicked = true;
        this.seasons[0].isClicked = true;
        this.fetchEpisodeBySeason(this.series.seasons[0].id, 0);
      }
    }
  }

  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;
  protected abstract fetchDataSpe(): void;

}
