import { Component } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Subscription, switchMap, take } from 'rxjs';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { StorageRepartitionComponent } from '../storage-repartition/storage-repartition.component';
import { PaginationPosterService } from '../../../media-module/services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';
import { TitleGridComponent } from '../../../media-module/components/grids/title-grid/title-grid.component';

@Component({
  selector: 'app-downloaded-media-page',
  standalone: true,
  imports: [TitleGridComponent, MenuTmpComponent, GridListComponent, StorageRepartitionComponent],
  templateUrl: './downloaded-media-page.component.html',
  styleUrls: ['./downloaded-media-page.component.css', '../../../media-module/components/grids/grid-poster.style.css']
})
export class DownloadedMediaPageComponent {

  title = 'DOWNLOAD.PAGE_TITLE';
  marginLeft!: number;

  medias: MediaModel[] | undefined = undefined;
  total: number | undefined = undefined;
  format !: FormatPosterModel;
  subscription: Subscription = new Subscription();

  constructor(private readonly downloadService: DownloadService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly paginationPosterService: PaginationPosterService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadDownloads();
  }

  ngOnInit(): void {
    this.mediaSelectedService.setIsOnLine(false);

    this.subscription.add(
      this.formatPosterService.fetchFormatPosterDownload().pipe(
        switchMap((format: FormatPosterModel) => {
          this.format = format;
          return format === FormatPosterModel.VERTICAL
            ? this.paginationPosterService.getVerticalGeometricDimensionSelection()
            : this.paginationPosterService.getHorizontalGeometricDimensionSelection();
        })
      ).subscribe((dimension: GeometricDimensionSelectionModel) => {
        this.marginLeft = dimension.marginLeft;
      })
    );

    this.subscription.add(
      this.downloadService.getMediaList().subscribe((data: MediaModel[] | undefined) => {
        this.medias = data;
        this.total = this.medias?.length;
      })
    );
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.setIsOnLine(true);
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
  }

  private loadDownloads(): void {
    this.subscription.add(
      this.downloadService.listDownloads().pipe(take(1)).subscribe()
    )
  }

}
