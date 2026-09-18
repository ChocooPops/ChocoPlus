import { Component } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Subscription, take } from 'rxjs';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageRepartitionComponent } from '../storage-repartition/storage-repartition.component';
import { PaginationPosterService } from '../../../media-module/services/pagination-poster/pagination-poster.service';
import { GeometricDimensionSelectionModel } from '../../../media-module/models/geometric-dimension-selection.interface';

@Component({
  selector: 'app-downloaded-media-page',
  standalone: true,
  imports: [MenuTmpComponent, GridListComponent, TranslatePipe, StorageRepartitionComponent],
  templateUrl: './downloaded-media-page.component.html',
  styleUrls: ['./downloaded-media-page.component.css', '../../../media-module/components/grids/grid-poster.style.css']
})
export class DownloadedMediaPageComponent {

  title = 'DOWNLOAD.PAGE_TITLE';
  marginLeft!: number;

  medias: MediaModel[] | undefined = undefined;
  format !: FormatPosterModel;
  subscritpionPagination!: Subscription;
  subscription: Subscription = new Subscription();
  loadNewFormat: boolean = false;

  constructor(private readonly downloadService: DownloadService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly paginationPosterService: PaginationPosterService
  ) {
    this.menuTabService.setActivateTransition(false);
  }

  ngOnInit(): void {
    this.mediaSelectedService.setIsOnLine(false);
    this.loadDownloads();
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterDownload().subscribe((format: FormatPosterModel) => {
        this.format = format;
        const obs = this.format === FormatPosterModel.VERTICAL
          ? this.paginationPosterService.getVerticalGeometricDimensionSelection()
          : this.paginationPosterService.getHorizontalGeometricDimensionSelection();

        this.subscritpionPagination = obs.subscribe((dimension: GeometricDimensionSelectionModel) => {
          this.marginLeft = dimension.marginLeft;
        });
      })
    );

    this.subscription.add(
      this.formatPosterService.fetchFormatPosterDownload().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          this.loadDownloads();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.setIsOnLine(true);
    if (this.subscritpionPagination) this.subscritpionPagination.unsubscribe();
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
  }

  private loadDownloads(): void {
    this.downloadService.listDownloads().pipe(take(1)).subscribe((medias: MediaModel[]) => {
      this.medias = medias;
      this.loadNewFormat = true;
    });
  }

  onDeleteMedia(media: MediaModel): void {
    this.downloadService.deleteDownloadsForMedia(media).pipe(take(1)).subscribe(() => {
      this.loadDownloads();
    });
  }

}
