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
import { JobModel } from '../../models/job.eum';
import { FormatMediaPageModel } from '../../models/format-media-page-enum';
import { CategorySimpleModel } from '../../../edition-module/models/category/categorySimple.model';
import { FILTERS } from '../../models/catalog/filters.interface';
import { Operation } from '../../models/catalog/operation.enum';
import { FiltersCatalogService } from '../../services/filters-catalog/filters-catalog.service';
import { Router } from '@angular/router';
import { FilterType } from '../../models/catalog/filter-type.enum';

@Directive({})
export abstract class SeriesPageAbstraction {
  @Input() series!: SeriesModel;

  protected abstract formatMediaPage: FormatMediaPageModel;

  protected abortControllerEpisodes = new AbortController();
  protected abortControllerSimilarMedias = new AbortController();

  protected subscriptionEpisodes!: Subscription;
  protected subscriptionSimilarTitles!: Subscription;
  protected subscriptionSeriesInfo!: Subscription;

  srcSucces: string = 'icon/success.svg';
  genres: CategorySimpleModel[] = [];
  keyWords: string[] = [];
  description!: string;
  mediaInfoLoaded: boolean = false;

  actors: StaffModel[] | undefined = undefined;
  directors: StaffModel[] | undefined = undefined;
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

  JobModel = JobModel;

  constructor(
    protected readonly compressedPosterService: CompressedPosterService,
    protected readonly mediaSelectedService: MediaSelectedService,
    protected readonly similarTitleService: SimilarTitleService,
    protected readonly imagePreloaderService: ImagePreloaderService,
    protected readonly seriesService: SeriesService,
    protected readonly filtersCatalogService: FiltersCatalogService,
    protected readonly router: Router
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
  }

  private resetInfo(): void {
    this.resetInfoSpe();
    this.directors = undefined;
    this.actors = undefined;
    this.similarMedias = undefined;
    this.genres = [];
    this.keyWords = [];
    this.episodes = [];
    this.seasons = [];
    this.seasonsPosterTmp = [];
    this.description = '';
  }

  private setUnsubscribeEpisode(): void {
    if (this.subscriptionEpisodes) {
      this.subscriptionEpisodes.unsubscribe();
    }
    this.abortControllerEpisodes.abort();
  }
  private setUnsubscriptionSimilarTitle(): void {
    if (this.subscriptionSimilarTitles) {
      this.subscriptionSimilarTitles.unsubscribe();
    }
    this.abortControllerSimilarMedias.abort();
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
    this.fetchEpisodeBySeason(this.series.seasons[index].id);
  }

  protected fetchEpisodeBySeason(idSeason: number): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
      this.setUnsubscriptionSimilarTitle();
    }
    this.subscriptionEpisodes = this.seriesService
      .fetchEpisodesBySeriesAndSeasonId(this.series.id, idSeason)
      .pipe(take(1))
      .subscribe((data: EpisodeModel[]) => {
        const img: string[] =
          this.imagePreloaderService.getPosterFromEpisodes(data);
        this.imagePreloaderService
          .preloadImages(img, this.abortControllerEpisodes.signal)
          .finally(() => {
            this.episodes = data;
          });
      });
  }

  protected fetchSimilarMovie(): void {
    this.episodes = undefined;
    if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
      this.setUnsubscribeEpisode();
    }
    this.setUnsubscriptionSimilarTitle();
    this.subscriptionSimilarTitles = this.similarTitleService
      .fetchSimilarTitlesForOneMovieById(this.series.id)
      .pipe(take(1))
      .subscribe((data: MediaModel[]) => {
        let img: string[] = [];
        if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
          img = this.imagePreloaderService.getPosterFromMediaListToLoad(
            data,
            FormatPosterModel.HORIZONTAL,
          );
        } else if (this.formatMediaPage === FormatMediaPageModel.HORIZONTAL) {
          img = this.imagePreloaderService.getPosterFromMediaListToLoad(
            data,
            FormatPosterModel.VERTICAL,
          );
        }
        this.imagePreloaderService
          .preloadImages(img, this.abortControllerSimilarMedias.signal)
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
            this.genres = info.categories;
            this.keyWords = info.keyWords.map((item) => this.transform(item));
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
        this.fetchEpisodeBySeason(this.series.seasons[index].id);
      } else {
        this.series.seasons[0].isClicked = true;
        this.seasons[0].isClicked = true;
        this.fetchEpisodeBySeason(this.series.seasons[0].id);
      }
    }
  }

  protected abstract resetInfoSpe(): void;
  protected abstract initSpe(): void;
  protected abstract fetchDataSpe(): void;
  
protected setFilterCategory(category: CategorySimpleModel): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: FilterType.CATEGORY,
      operation: Operation.CONTAIN,
      value: [
        {
          name: category.name,
          value: category.id
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }
  protected setFilterStaff(staff: StaffModel): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: staff.job,
      operation: Operation.CONTAIN,
      value: [
        {
          name: staff.fullName,
          value: staff.id
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }
  protected setFilterKeyWord(keyword: string): void {
    const filter: FILTERS = {
      id: -2,
      title: '',
      typeData: FilterType.KEY_WORD,
      operation: Operation.CONTAIN,
      value: [
        {
          name: keyword,
          value: keyword
        }
      ]
    }
    this.setFilterCatalogAndNavigate(filter);
  }

  protected setFilterCatalogAndNavigate(filtre: FILTERS): void {
    this.filtersCatalogService.setFilterFromMediaPage(filtre);
    this.router.navigateByUrl('main-app/catalog');
  }

}
