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

@Component({
  selector: 'app-downloaded-media-page',
  standalone: true,
  imports: [MenuTmpComponent, GridListComponent],
  templateUrl: './downloaded-media-page.component.html',
  styleUrl: './downloaded-media-page.component.css'
})
export class DownloadedMediaPageComponent {

  title = 'DOWNLOAD.PAGE_TITLE';

  medias: MediaModel[] | undefined = undefined;
  format !: FormatPosterModel;
  subscription: Subscription = new Subscription();
  loadNewFormat: boolean = false;

  constructor(private readonly downloadService: DownloadService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly mediaSelectedService: MediaSelectedService
  ) {
    this.menuTabService.setActivateTransition(false);
  }

  ngOnInit(): void {
    this.loadDownloads();
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterDownload().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          this.loadDownloads();
        }
      })
    )
  }

  ngOnDestroy(): void {
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
