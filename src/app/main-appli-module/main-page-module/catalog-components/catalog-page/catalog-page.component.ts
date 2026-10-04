import { Component, NgZone, Renderer2 } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { combineLatest, Subscription, switchMap, take } from 'rxjs';
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
import { FiltersCatalogService } from '../../../media-module/services/filters-catalog/filters-catalog.service';
import { FiltersChoicesModel } from '../../../media-module/models/catalog/filters-choices.interface';
import { FilterChoiceModel } from '../../../media-module/models/catalog/filter-choice.interface';
import { FILTERS } from '../../../media-module/models/catalog/filters.interface';
import { OtherFiltersComponent } from '../other-filters/other-filters.component';
import { FilterType } from '../../../media-module/models/catalog/filter-type.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { OperatorPipe } from '../../../../common-module/pipe/operator.pipe';
import { UpperCasePipe, LowerCasePipe } from '@angular/common';
import { ResultCatalog } from '../../../media-module/models/catalog/result-catalog.interface';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [OperatorPipe, LowerCasePipe, UpperCasePipe, OtherFiltersComponent, TranslatePipe, GridListComponent, MenuTmpComponent, FilterComponent, SortComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.css', '../../../common-module/styles/animation.css']
})
export class CatalogPageComponent {

  medias: MediaModel[] | undefined = undefined;
  total: number | undefined = undefined;

  private subscription: Subscription = new Subscription();
  private catalogSubscription?: Subscription;
  private scrollUnlisten?: () => void;
  private scrollTimeoutId?: ReturnType<typeof setTimeout>;
  private errorTimeoutId?: ReturnType<typeof setTimeout>;
  private fillScreenTimeoutId?: ReturnType<typeof setTimeout>;

  title: string = '';
  format: FormatPosterModel = FormatPosterModel.VERTICAL;

  marginLeft!: number;
  width!: string;

  decadeFilter!: FiltersChoicesModel;
  categoryFilter!: FiltersChoicesModel;
  mediaTypeFilter!: FiltersChoicesModel;
  sortFilter!: FilterChoiceModel[];
  TypeData = FilterType;

  decadeSelected!: number;
  categorySelected!: number;
  mediaTypeSelected!: MediaTypeModel;
  sortSelected!: SortCatalog;

  srcAsc: string = 'icon/asc.svg';
  srcDesc: string = 'icon/desc.svg';
  srcYellowCross: string = 'icon/yellow-cross.svg'
  orderDirection!: boolean;

  private readonly  PAGE_SIZE!: number;
  private currentOffset: number = 0;
  public isLoading: boolean = false;
  private hasMore: boolean = true;

  heightScrolling: number = 0;

  FILTERS: FILTERS[] = [];

  constructor(
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly paginationPosterService: PaginationPosterService,
    private readonly filtersCatalogService: FiltersCatalogService,
    private readonly mediaService: MediaService,
    private readonly scrollEventService: ScrollEventService,
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_CATALOG);

    this.PAGE_SIZE = this.filtersCatalogService.getPAGE_SIZE();
    this.decadeFilter = this.filtersCatalogService.getDecadeFilter();
    this.categoryFilter = this.filtersCatalogService.getCategoryFilter();
    this.mediaTypeFilter = this.filtersCatalogService.getMediaTypeFilter();
    this.sortFilter = this.filtersCatalogService.getSortFilter();

    this.decadeSelected = this.decadeFilter.filters.find((item) => item.isSelected)?.value;
    this.categorySelected = this.categoryFilter.filters.find((item) => item.isSelected)?.value;
    this.mediaTypeSelected = this.mediaTypeFilter.filters.find((item) => item.isSelected)?.value;
    this.sortSelected = this.sortFilter.find((item) => item.isSelected)?.value;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterCatalog().pipe(
        switchMap((format: FormatPosterModel) => {
          this.format = format;
          return format === FormatPosterModel.VERTICAL
            ? this.paginationPosterService.getVerticalGeometricDimensionSelection()
            : this.paginationPosterService.getHorizontalGeometricDimensionSelection();
        })
      ).subscribe((dimension: GeometricDimensionSelectionModel) => {
        const marginBottom: number = this.format === FormatPosterModel.VERTICAL
          ? this.paginationPosterService.getMarginBottomForVerticalPoster()
          : this.paginationPosterService.getMarginBottomForHorizontalPoster();

        this.marginLeft = dimension.marginLeft;
        this.width = `calc(100% - ${this.marginLeft}vw - ${this.marginLeft}vw)`;
        this.heightScrolling = dimension.heightPoster * 1.1 + marginBottom;
      })
    );

    this.subscription.add(
      combineLatest([
        this.filtersCatalogService.getOrderDirectionSort(),
        this.filtersCatalogService.getFILTERS()
      ]).subscribe(([orderDirection, filters]: [boolean, FILTERS[]]) => {
        this.orderDirection = orderDirection;
        this.FILTERS = filters;
        this.startNewCatalog();
      })
    );
  }

  ngAfterViewInit(): void {
    this.scrollTimeoutId = setTimeout(() => {
      const container = this.scrollEventService.getContainerElement();
      if (!container) return;
      this.ngZone.runOutsideAngular(() => {
        this.scrollUnlisten = this.renderer.listen(container, 'scroll', () => this.onScroll());
      });
    }, 100);
  }

  ngOnDestroy(): void {
    clearTimeout(this.scrollTimeoutId);
    clearTimeout(this.errorTimeoutId);
    clearTimeout(this.fillScreenTimeoutId);
    if (this.scrollUnlisten) this.scrollUnlisten();
    this.catalogSubscription?.unsubscribe();
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
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

  public toggleFilterLogic(filtre: FILTERS, index: number): void {
    this.filtersCatalogService.toggleFilterLogic(filtre, index);
  }

  public toggleValueLogic(filtre: FILTERS): void {
    this.filtersCatalogService.toggleValueLogic(filtre);
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

    const threshold: number = this.vwToPx(this.heightScrolling) + 220;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - threshold) {
      this.ngZone.run(() => this.loadNextPage());
    }
  }

  private checkFillScreen(): void {
    clearTimeout(this.fillScreenTimeoutId);
    this.fillScreenTimeoutId = setTimeout(() => this.onScroll());
  }

  private loadNextPage(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;

    this.catalogSubscription?.unsubscribe();
    this.catalogSubscription = this.mediaService
      .fetchMediaByCatalogFilters(
        this.FILTERS,
        this.sortSelected,
        this.orderDirection,
        this.PAGE_SIZE,
        this.currentOffset
      )
      .pipe(take(1))
      .subscribe({
        next: (result: ResultCatalog) => {
          this.currentOffset = this.currentOffset + result.medias.length;
          this.hasMore = result.medias.length >= this.PAGE_SIZE;
          if (this.medias) {
            this.medias.push(...result.medias);
          } else {
            this.medias = result.medias
          }
          this.isLoading = false;
          this.checkFillScreen();
        },
        error: () => {
          this.errorTimeoutId = setTimeout(() => this.isLoading = false, 2000);
        }
      })
  }
  
  public startNewCatalog(): void {
    clearTimeout(this.errorTimeoutId);
    this.currentOffset = 0;
    this.hasMore = true;
    this.isLoading = true;
    this.medias = undefined;
    this.total = undefined;

    this.catalogSubscription?.unsubscribe();
    this.catalogSubscription = this.mediaService
      .fetchMediaByCatalogFilters(this.FILTERS, this.sortSelected, this.orderDirection, this.PAGE_SIZE, 0)
      .pipe(take(1))
      .subscribe({
        next: (result: ResultCatalog) => {
          this.currentOffset = result.medias.length;
          this.hasMore = result.medias.length >= this.PAGE_SIZE;
          this.medias = result.medias;
          this.total = result.total ?? 0;
          this.isLoading = false;
          this.checkFillScreen();
        },
        error: () => {
          this.hasMore = false;
          this.medias = [];
          this.total = 0;
          this.isLoading = false;
        }
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