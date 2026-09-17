import { Directive, Input, SimpleChanges } from '@angular/core';
import { SeriesModel } from '../../models/series/series.interface';
import { EpisodeModel } from '../../models/series/episode.interface';
import { Subscription, take } from 'rxjs';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { SimilarTitleService } from '../../services/similar-title/similar-title.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { SeriesService } from '../../services/series/series.service';
import { SeasonModel } from '../../models/series/season.interface';
import { FormatMediaPageModel } from '../../models/format-media-page-enum';
import { FiltersCatalogService } from '../../services/filters-catalog/filters-catalog.service';
import { Router } from '@angular/router';
import { MovieSeriesPageAbstraction } from './movie-series-page-abstraction.directive';
import { DownloadService } from '../../services/download/download.service';

@Directive({})
export abstract class SeriesPageAbstraction extends MovieSeriesPageAbstraction {

  @Input() series!: SeriesModel;

  protected abortControllerEpisodes = new AbortController();
  protected subscriptionEpisodes!: Subscription;

  srcSucces: string = 'icon/success.svg';

  seasonsLoading: number[] = [];
  seasonsPosterTmp: number[] = [];
  episodes: EpisodeModel[] | undefined = [];
  type: boolean = true;

  constructor(
    protected readonly compressedPosterService: CompressedPosterService,
    mediaSelectedService: MediaSelectedService,
    similarTitleService: SimilarTitleService,
    imagePreloaderService: ImagePreloaderService,
    protected readonly seriesService: SeriesService,
    filtersCatalogService: FiltersCatalogService,
    downloadService: DownloadService,
    router: Router
  ) {
    super(imagePreloaderService, similarTitleService, mediaSelectedService, filtersCatalogService, downloadService, router);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series']) {
      this.resetInfo();
      this.initSimilarLoading();
      this.initSeasonsLoading();
      this.init();
      this.initSeasons();
      if (this.isOnLine) {
        this.fetchDataSpe();
        this.fetchMediaInfo();
      } else {
        this.type = true;
        this.fetchMediaInfoOffLine();
        this.onLoadEpisodeByIdOrIndex();
      }
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.setUnsubscribeEpisode();
  }

  protected getMediaId(): number {
    return this.series?.id;
  }

  protected override resetInfoExtra(): void {
    this.episodes = [];
    this.seasonsPosterTmp = [];
  }

  protected override beforeFetchSimilarMedia(): void {
    this.episodes = undefined;
    if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
      this.setUnsubscribeEpisode();
    }
  }

  protected override transformKeyWord(keyWord: string): string {
    return this.transform(keyWord);
  }

  protected setUnsubscribeEpisode(): void {
    if (this.subscriptionEpisodes) {
      this.subscriptionEpisodes.unsubscribe();
    }
    this.abortControllerEpisodes.abort();
  }

  private init(): void {
    this.mediaInfoLoaded = false;
    this.initSpe();
    this.description = this.series?.description || '';
  }

  private initSeasons(): void {
    this.episodes = undefined;
    const iteration: number = 4 - this.series.seasons.length;
    for (let i = 0; i < iteration; i++) {
      this.seasonsPosterTmp.push(i);
    }
  }

  private initSeasonsLoading(): void {
    for (let i = 0; i < 5; i++) {
      this.seasonsLoading.push(i);
    }
  }

  private transform(value: string): string {
    if (!value) return '';
    value = value.trimStart();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private resetIsClickedSeason(index: number): void {
    this.series.seasons.forEach((s, i) => {
      s.isClicked = i === index;
    });
  }

  onClickSeason(index: number): void {
    if (index < 0) return;
    this.loadSeasonEpisodes(index);
  }

  private fetchEpisodesBySeason(idSeason: number): void {
    this.episodes = undefined;
    this.setUnsubscribeEpisode();
    if (this.formatMediaPage === FormatMediaPageModel.VERTICAL) {
      this.setUnsubscriptionSimilarTitles();
    }

    const source$ = this.isOnLine
      ? this.seriesService.fetchEpisodesBySeriesAndSeasonId(this.series.id, idSeason)
      : this.downloadService.readAllEpisodesFromSeriesAndSeasonId(this.series.id, idSeason);

    this.subscriptionEpisodes = source$
      .pipe(take(1))
      .subscribe((data: EpisodeModel[]) => {
        const img = this.imagePreloaderService.getPosterFromEpisodes(data);
        this.imagePreloaderService
          .preloadImages(img, this.abortControllerEpisodes.signal)
          .finally(() => (this.episodes = data));
      });
  }

  onErrorPosterSeason(index: number): void {
    this.series.seasons[index].srcPoster = undefined;
  }

  protected onLoadEpisodeByIdOrIndex(): void {
    if (this.series.seasons.length === 0) return;

    const lastSeasonWatched = this.seriesService.getLastSeasonWatchedBySeriesId(this.series.id);
    const index = lastSeasonWatched
      ? this.series.seasons.findIndex((s) => s.id === lastSeasonWatched)
      : this.series.seasons.findIndex((s) => s.isClicked);

    const seasonIndex = index >= 0 ? index : 0;
    this.loadSeasonEpisodes(seasonIndex);
  }

  private loadSeasonEpisodes(index: number): void {
    this.resetIsClickedSeason(index);
    this.fetchEpisodesBySeason(this.series.seasons[index].id);
    this.seriesService.loadLastSeasonWatchedBySeriesId(this.series.id, this.series.seasons[index].id);
  }

  protected abstract fetchDataSpe(): void;

}
