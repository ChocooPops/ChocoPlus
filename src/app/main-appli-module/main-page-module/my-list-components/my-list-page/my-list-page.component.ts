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

@Component({
  selector: 'app-my-list-page',
  standalone: true,
  imports: [MenuTmpComponent, MediaPageComponent, GridListComponent],
  templateUrl: './my-list-page.component.html',
  styleUrl: './my-list-page.component.css'
})
export class MyListPageComponent {

  private abortController = new AbortController();
  title: string = 'Votre Liste';
  medias: MediaModel[] | undefined = undefined;
  format !: FormatPosterModel;
  subscription: Subscription = new Subscription();
  gap !: number;
  marginLeft !: number;
  marginBottom !: number;
  mediaSelected: MediaModel | undefined = undefined;
  nbPosterPerLine: number = 0;
  loadNewFormat: boolean = false;

  constructor(private userService: UserService,
    private mediaSelectedService: MediaSelectedService,
    private formatPosterService: FormatPosterService,
    private imagePreloaderService: ImagePreloaderService,
    private menuTabService: MenuTabService
  ) {
    this.menuTabService.setActivateTransition(false);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe((medias: MediaModel[]) => {
        const format: FormatPosterModel = this.formatPosterService.getFormatPosterMyListValue();
        const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(medias, format);

        this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
          this.medias = medias;
          this.loadNewFormat = true;
        })
      })
    )
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((medias: MediaModel | undefined) => {
        this.mediaSelected = medias;
      })
    )
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterMyList().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.movies = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.mediaSelectedService.clearSelection();
    this.abortController.abort();
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

}
