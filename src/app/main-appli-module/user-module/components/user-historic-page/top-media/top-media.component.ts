import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';
import { TopMedia } from '../../../dto/user-historic/top-media.interface';
import { TopMediaResponse } from '../../../dto/user-historic/top-media-response.interface';
import { MediaTypeFilter } from '../../../dto/user-historic/media-type-filter.type';
import { FilterOption } from '../../../dto/user-historic/filter-option.interface';
import { ScalePoster } from '../../../../common-module/models/scale-poster.enum';
import { CompressedPosterService } from '../../../../common-module/services/compressed-poster/compressed-poster.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MediaService } from '../../../../media-module/services/media/media.service';
import { MediaModel } from '../../../../media-module/models/media.interface';
import { MovieModel } from '../../../../media-module/models/movie-model';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { SelectionType } from '../../../../media-module/models/selection-type.enum';
import { SortCatalog } from '../../../../media-module/models/catalog/sort-catalog.enum';
import { FILTERS } from '../../../../media-module/models/catalog/filters.interface';
import { FilterType } from '../../../../media-module/models/catalog/filter-type.enum';
import { Operation } from '../../../../media-module/models/catalog/operation.enum';
import { LogicalOperator } from '../../../../media-module/models/catalog/logical-operator';

type TopMediaViewMode = 'top' | 'historic';

@Component({
  standalone: true,
  selector: 'app-top-media',
  templateUrl: './top-media.component.html',
  styleUrls: ['./top-media.component.scss'],
  imports: [TranslatePipe],
})
export class TopMediaComponent {
  @Input() userId!: number;
  @ViewChild('mediaList') mediaListRef!: ElementRef<HTMLDivElement>;

  selectedMediaType: MediaTypeFilter = 'all';
  viewMode: TopMediaViewMode = 'top';

  private readonly HISTORIC_COUNT: number = 30;
  private readonly SCROLL_END_THRESHOLD: number = 50;

  filterOptions: FilterOption[] = [
    { value: 'all', label: 'ALL', icon: '🎬' },
    { value: 'MOVIE', label: 'MOVIES', icon: '🎥' },
    { value: 'SERIES', label: 'SERIES', icon: '📺' },
  ];

  topMediaData: TopMediaResponse | null = null;
  historicMediaList: MediaModel[] = [];
  historicOffset: number = 0;
  historicTotal: number = 0;
  loading: boolean = true;
  loadingMore: boolean = false;
  error: string | null = null;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private mouseDownHandler?: (e: MouseEvent) => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: () => void;
  private mouseLeaveHandler?: () => void;
  private scrollHandler?: () => void;
  srcReset: string = 'icon/modify.svg';
  srcLoading: string = 'icon/sablier.svg';

  constructor(
    private readonly userHistoricService: UserHistoricService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly mediaService: MediaService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupDragScroll();
    }, 100);
  }

  ngOnDestroy(): void {
    this.removeDragScrollListeners();
  }

  private setupDragScroll(): void {
    const element = this.mediaListRef?.nativeElement;
    if (!element) {
      return;
    }

    this.mouseDownHandler = (e: MouseEvent) => {
      this.isDragging = true;
      element.classList.add('dragging');
      this.startX = e.pageX - element.offsetLeft;
      this.scrollLeft = element.scrollLeft;
      e.preventDefault();
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - this.startX) * 2;
      element.scrollLeft = this.scrollLeft - walk;
    };

    this.mouseUpHandler = () => {
      this.isDragging = false;
      element.classList.remove('dragging');
    };

    this.mouseLeaveHandler = () => {
      if (this.isDragging) {
        this.isDragging = false;
        element.classList.remove('dragging');
      }
    };

    this.scrollHandler = () => {
      this.onMediaListScroll(element);
    };

    element.addEventListener('mousedown', this.mouseDownHandler);
    element.addEventListener('mousemove', this.mouseMoveHandler);
    element.addEventListener('mouseup', this.mouseUpHandler);
    element.addEventListener('mouseleave', this.mouseLeaveHandler);
    element.addEventListener('scroll', this.scrollHandler);
  }

  private removeDragScrollListeners(): void {
    const element = this.mediaListRef?.nativeElement;
    if (!element) return;

    if (this.mouseDownHandler) {
      element.removeEventListener('mousedown', this.mouseDownHandler);
    }
    if (this.mouseMoveHandler) {
      element.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseUpHandler) {
      element.removeEventListener('mouseup', this.mouseUpHandler);
    }
    if (this.mouseLeaveHandler) {
      element.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
    if (this.scrollHandler) {
      element.removeEventListener('scroll', this.scrollHandler);
    }

    this.mouseDownHandler = undefined;
    this.mouseMoveHandler = undefined;
    this.mouseUpHandler = undefined;
    this.mouseLeaveHandler = undefined;
    this.scrollHandler = undefined;
  }

  private onMediaListScroll(element: HTMLDivElement): void {
    if (this.viewMode !== 'historic') return;

    const distanceFromRight = element.scrollWidth - element.scrollLeft - element.clientWidth;
    if (distanceFromRight <= this.SCROLL_END_THRESHOLD) {
      this.loadMoreHistoricMedia();
    }
  }

  onFilterChange(mediaType: MediaTypeFilter): void {
    this.selectedMediaType = mediaType;
    this.loadData();
  }

  setViewMode(mode: TopMediaViewMode): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    if (this.viewMode === 'historic') {
      this.loadHistoricMedia();
    } else {
      this.loadTopMedia();
    }
  }

  private loadTopMedia(): void {
    this.userHistoricService
      .getUserTopMedia(this.userId, this.selectedMediaType)
      .subscribe({
        next: (data) => {
          this.topMediaData = data;
          this.loading = false;
          this.restartDragScroll();
        },
        error: (err) => {
          this.error = 'USER.HISTORIC.ERROR_TOP';
          this.loading = false;
        },
      });
  }

  private loadHistoricMedia(): void {
    this.historicOffset = 0;
    this.mediaService
      .fetchMediaByCatalogFilters(this.buildHistoricFilters(), SortCatalog.ALREADY_WATCHED, false, this.HISTORIC_COUNT, this.historicOffset, this.userId)
      .subscribe({
        next: (result) => {
          this.historicMediaList = result.medias;
          this.historicTotal = result.total;
          this.loading = false;
          this.restartDragScroll();
        },
        error: (err) => {
          this.error = 'USER.HISTORIC.ERROR_HISTORIC';
          this.loading = false;
        },
      });
  }

  private loadMoreHistoricMedia(): void {
    if (this.loadingMore || this.loading) return;
    if (this.historicMediaList.length >= this.historicTotal) return;

    this.loadingMore = true;
    const nextOffset = this.historicOffset + this.HISTORIC_COUNT;

    this.mediaService
      .fetchMediaByCatalogFilters(this.buildHistoricFilters(), SortCatalog.ALREADY_WATCHED, false, this.HISTORIC_COUNT, nextOffset, this.userId)
      .subscribe({
        next: (result) => {
          this.historicMediaList = [...this.historicMediaList, ...result.medias];
          this.historicOffset = nextOffset;
          this.historicTotal = result.total;
          this.loadingMore = false;
        },
        error: (err) => {
          this.loadingMore = false;
        },
      });
  }

  private buildHistoricFilters(): FILTERS[] {
    if (this.selectedMediaType === 'all') {
      return [];
    }
    return [
      {
        id: -1,
        typeData: FilterType.MEDIA,
        operation: Operation.CONTAIN,
        logic: LogicalOperator.AND,
        value: [
          {
            name: this.selectedMediaType === MediaTypeModel.MOVIE ? 'MOVIES' : 'SERIES',
            value: this.selectedMediaType,
          },
        ],
      },
    ];
  }

  private restartDragScroll(): void {
    setTimeout(() => {
      this.removeDragScrollListeners();
      this.setupDragScroll();
    }, 100);
  }

  getPosterUrl(media: TopMedia): string {
    if (media.posterName) {
      return `${this.compressedPosterService.insertIntoUrlBeforeFilename(media.posterName, ScalePoster.SCALE_600h)}`;
    }
    return '';
  }

  getHistoricPosterUrl(media: MediaModel): string {
    return this.compressedPosterService.getPosterMedia(SelectionType.NORMAL_POSTER, media, ScalePoster.SCALE_600h) ?? '';
  }

  hasWatchProgress(media: MediaModel): boolean {
    if (media.mediaType !== MediaTypeModel.MOVIE) return false;
    const movie = media as MovieModel;
    return movie.watchProgress > 0 && movie.watchProgress < 100;
  }

  getWatchProgress(media: MediaModel): number {
    return (media as MovieModel).watchProgress ?? 0;
  }

  isListEmpty(): boolean {
    if (this.viewMode === 'historic') {
      return this.historicMediaList.length === 0;
    }
    return (this.topMediaData?.topMedia ?? []).length === 0;
  }

  getMediaIcon(mediaType: string): string {
    return mediaType === 'MOVIE' ? '🎥' : '📺';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  }

  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#a3a3a3';
    if (rank === 3) return '#CD7F32';
    return '#E6E6E6';
  }

  refresh(): void {
    this.loadData();
  }
}
