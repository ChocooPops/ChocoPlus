import { Component, Renderer2 } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Subscription, take } from 'rxjs';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { PaginationPosterService } from '../../../media-module/services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { FilterComponent } from '../filter/filter.component';
import { SortComponent } from '../sort/sort.component';
import { MediaService } from '../../../media-module/services/media/media.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SortCatalog } from '../../../media-module/models/catalog/sort-catalog.enum';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { FiltersCatalogService } from '../../../media-module/services/filters-catalog/filters-catalog.service';
import { FiltersChoicesModel } from '../../../media-module/models/catalog/filters-choices.interface';
import { FilterChoiceModel } from '../../../media-module/models/catalog/filter-choice.interface';
import { FILTERS } from '../../../media-module/models/catalog/filters.interface';
import { OtherFiltersComponent } from '../other-filters/other-filters.component';
import { FilterType } from '../../../media-module/models/catalog/filter-type.enum';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [OtherFiltersComponent, MediaPageComponent, GridListComponent, MenuTmpComponent, FilterComponent, SortComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css'
})
export class CatalogPageComponent {

  medias: MediaModel[] | undefined = undefined;

  subscription: Subscription = new Subscription();
  subscritpionPagination!: Subscription;
  subscriptionCatalog!: Subscription;
  private scrollUnlisten!: () => void;
  private abortController = new AbortController();

  title: string = '';
  format: FormatPosterModel = FormatPosterModel.VERTICAL;

  marginLeft!: number;
  width!: string;
  mediaSelected: MediaModel | undefined = undefined;

  decadeFilter!: FiltersChoicesModel;
  categoryFilter!: FiltersChoicesModel;
  mediaTypeFilter!: FiltersChoicesModel;
  sortFilter!: FilterChoiceModel[];
  TypeData = FilterType;

  declareSelected!: number;
  categorySelected!: number;
  mediaTypeSelected!: MediaTypeModel;
  sortSelected!: SortCatalog;

  srcAsc: string = 'icon/asc.svg';
  srcDesc: string = 'icon/desc.svg';
  srcYellowCross: string = 'icon/yellow-cross.svg'
  orderDirection!: boolean;

  private currentOffset: number = 0;
  private PAGE_SIZE!: number;
  public isLoading: boolean = false;
  private hasMore: boolean = true;

  heightScrolling: number = 0;

  FILTERS: FILTERS[] = [];

  constructor(
    private readonly renderer: Renderer2,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly paginationPosterService: PaginationPosterService,
    private readonly filtersCatalogService: FiltersCatalogService,
    private readonly mediaService: MediaService,
    private readonly scrollEventService: ScrollEventService,
    private readonly imagePreloaderService: ImagePreloaderService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_CATALOG);

    this.PAGE_SIZE = this.filtersCatalogService.getPAGE_SIZE();
    this.decadeFilter = this.filtersCatalogService.getDecadeFilter();
    this.categoryFilter = this.filtersCatalogService.getCategoryFilter();
    this.mediaTypeFilter = this.filtersCatalogService.getMediaTypeFilter();
    this.sortFilter = this.filtersCatalogService.getSortFilter();

    this.declareSelected = this.decadeFilter.filters.find((item) => item.isSelected)?.value;
    this.categorySelected = this.categoryFilter.filters.find((item) => item.isSelected)?.value;
    this.mediaTypeSelected = this.mediaTypeFilter.filters.find((item) => item.isSelected)?.value;
    this.sortSelected = this.sortFilter.find((item) => item.isSelected)?.value;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.mediaSelected = media;
      })
    );

    this.subscription.add(
      this.formatPosterService.fetchFormatPosterCatalog().subscribe((format: FormatPosterModel) => {
        this.format = format;
        const obs = this.format === FormatPosterModel.VERTICAL
          ? this.paginationPosterService.getVerticalGeometricDimensionSelection()
          : this.paginationPosterService.getHorizontalGeometricDimensionSelection();

        this.subscritpionPagination = obs.subscribe((dimension: GeometricDimensionSelectionModel) => {
          const marginBottom: number = this.format === FormatPosterModel.VERTICAL
            ? this.paginationPosterService.getMarginBottomForVerticalPoster()
            : this.paginationPosterService.getMarginBottomForHorizontalPoster()

          this.marginLeft = dimension.marginLeft;
          this.width = `calc(100% - ${this.marginLeft}vw - ${this.marginLeft}vw)`;
          this.heightScrolling = dimension.heightPoster * 1.1 + marginBottom;
        });
      })
    );

    this.subscription.add(
      this.filtersCatalogService.getOrderDirectionSort().subscribe((data: boolean) => {
        this.orderDirection = data;
        this.startNewCatalog();
      })
    );

    this.subscription.add(
      this.filtersCatalogService.getFILTERS().subscribe((data: FILTERS[]) => {
        this.FILTERS = data;
        this.startNewCatalog();
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const container = this.scrollEventService.getContainerElement();
      if (container) {
        this.scrollUnlisten = this.renderer.listen(container, 'scroll', () => this.onScroll());
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
    if (this.scrollUnlisten) this.scrollUnlisten();
    if (this.subscritpionPagination) this.subscritpionPagination.unsubscribe();
    if (this.subscriptionCatalog) this.subscriptionCatalog.unsubscribe();
    this.abortController.abort();
  }

  public onSelectedDecadeFilter(filtre: FILTERS): void {
    this.filtersCatalogService.onSelectedDecadeFilter(filtre);
  }
  public onSelectedCategoryFilter(filtre: FILTERS): void {
    this.filtersCatalogService.onSelectedCategoryFilter(filtre);
  }
  public onSelectedMediaTypeFilter(filtre: FILTERS): void {
    this.filtersCatalogService.onSelectedMediaTypeFilter(filtre);
  }
  public onFilterCreated(filtre: FILTERS): void {
    this.filtersCatalogService.addFilters(filtre);
  }

  public onSelectedSortFilter(id: number): void {
    this.sortSelected = this.filtersCatalogService.onSelectedSortFilter(id);
    this.startNewCatalog();
  }

  public toggleOrderDirection(): void {
    this.filtersCatalogService.toggleOrderDirectionSort();
  }

  private onScroll(): void {
    if (this.isLoading || !this.hasMore) return;

    const container = this.scrollEventService.getContainerElement();
    if (!container) return;

    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight - this.vwToPx(this.heightScrolling) - 220) {
      this.loadNextPage();
    }
  }

  private loadNextPage(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.currentOffset += this.PAGE_SIZE;

    if (this.subscriptionCatalog) this.subscriptionCatalog.unsubscribe();

    this.subscriptionCatalog = this.mediaService
      .fetchMediaByCatalogFilters(
        this.FILTERS,
        this.sortSelected,
        this.orderDirection,
        this.PAGE_SIZE,
        this.currentOffset
      )
      .pipe(take(1))
      .subscribe((media: MediaModel[]) => {
        this.abortController.abort();
        const format: FormatPosterModel = this.formatPosterService.getFormatPosterCatalogValue();
        const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(media, format);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          if (media.length < this.PAGE_SIZE) this.hasMore = false;
          if (this.medias) this.medias.push(...media);
          this.isLoading = false;
        });
      });
  }

  public startNewCatalog(): void {
    this.currentOffset = 0;
    this.hasMore = true;
    this.isLoading = false;
    this.medias = undefined;

    if (this.subscriptionCatalog) this.subscriptionCatalog.unsubscribe();

    this.subscriptionCatalog = this.mediaService
      .fetchMediaByCatalogFilters(
        this.FILTERS,
        this.sortSelected,
        this.orderDirection,
        this.PAGE_SIZE,
        0
      )
      .pipe(take(1))
      .subscribe((media: MediaModel[]) => {
        this.abortController.abort();
        const format: FormatPosterModel = this.formatPosterService.getFormatPosterCatalogValue();
        const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(media, format);
        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          if (media.length < this.PAGE_SIZE) this.hasMore = false;
          this.medias = media;
          this.isLoading = false;
        });
      });
  }

  private vwToPx(vw: number): number {
    const width = window.innerWidth;
    return (vw / 100) * width;
  }

  deleteFilter(filtre: FILTERS): void {
    this.filtersCatalogService.deleteFilter(filtre);
  }

}