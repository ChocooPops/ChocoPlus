import { Component } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Subscription, take } from 'rxjs';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { UserService } from '../../../user-module/service/user/user.service';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { PaginationPosterService } from '../../../media-module/services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { FilterComponent } from '../filter/filter.component';
import { FilterModel } from '../../../media-module/models/catalog/filter.interface';
import { FiltersCatalogService } from '../../../media-module/services/filters-catalog/filters-catalog.service';
import { FiltersModel } from '../../../media-module/models/catalog/filters.interface';
import { SortComponent } from '../sort/sort.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [MediaPageComponent, GridListComponent, MenuTmpComponent, FilterComponent, SortComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.css'
})
export class CatalogPageComponent {

  private abortController = new AbortController();
  title: string = '';
  medias: MediaModel[] | undefined = undefined;
  format = FormatPosterModel.VERTICAL;
  subscription: Subscription = new Subscription();
  subscritpionPagination!: Subscription;
  marginLeft !: number;
  width!: string;
  mediaSelected: MediaModel | undefined = undefined;
  nbPosterPerLine: number = 0;
  loadNewFormat: boolean = false;

  decadeFilter!: FiltersModel;
  categoryFilter!: FiltersModel;
  mediaTypeFilter!: FiltersModel;
  sortFilter!: FilterModel[];

  srcAsc: string = 'icon/asc.svg';
  srcDesc: string = 'icon/desc.svg';
  orderDirection!: boolean;

  constructor(private readonly userService: UserService,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly formatPosterService: FormatPosterService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly menuTabService: MenuTabService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly paginationPosterService: PaginationPosterService,
    private readonly filtersCatalogService: FiltersCatalogService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_CATALOG);
    this.decadeFilter = this.filtersCatalogService.getDecadeFilter();
    this.categoryFilter = this.filtersCatalogService.getCategoryFilter();
    this.mediaTypeFilter = this.filtersCatalogService.getMediaTypeFilter();
    this.sortFilter = this.filtersCatalogService.getSortFilter();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((medias: MediaModel | undefined) => {
        this.mediaSelected = medias;
      })
    )
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterCatalog().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.medias = undefined;
          this.reloadWhenFormatPosterChange();
        }
        if (this.format === FormatPosterModel.VERTICAL) {
          this.subscritpionPagination = this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
            this.marginLeft = dimension.marginLeft;
            this.width = `calc(100% - ${this.marginLeft}vw - ${this.marginLeft}vw)`;
          })
        } else if (this.format === FormatPosterModel.HORIZONTAL) {
          this.subscritpionPagination = this.paginationPosterService.getHorizontalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
            this.marginLeft = dimension.marginLeft;
            this.width = `calc(100% - ${this.marginLeft}vw - ${this.marginLeft}vw)`;
          })
        }
      })
    )
    this.subscription.add(
      this.filtersCatalogService.getOrderDirectionSort().subscribe((data: boolean) => {
        this.orderDirection = data;
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
    this.abortController.abort();
    if (this.subscritpionPagination) {
      this.subscritpionPagination.unsubscribe();
    }
  }

  private reloadWhenFormatPosterChange(): void {
    this.abortController.abort();
    this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe((medias: MediaModel[]) => {
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterMyListValue();
      const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(medias, format);

      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.medias = medias;
        this.loadNewFormat = true;
      })
    })
  }

  public onSelectedDecadeFilter(id: number): void {
    this.filtersCatalogService.onSelectedDecadeFilter(id);
  }
  public onSelectedCategoryFilter(id: number): void {
    this.filtersCatalogService.onSelectedCategoryFilter(id);
  }
  public onSelectedMediaTypeFilter(id: number): void {
    this.filtersCatalogService.onSelectedMediaTypeFilter(id);
  }
  public onSelectedSortFilter(id: number): void {
    this.filtersCatalogService.onSelectedSortFilter(id);
  }

  public toggleOrderDirection(): void {
    this.filtersCatalogService.toggleOrderDirectionSort();
  }
  
}
