import { Component } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { Subscription, take } from 'rxjs';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { UserService } from '../../../user-module/service/user/user.service';
import { GridListComponent } from '../../../media-module/components/grids/grid-list/grid-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
//import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';

@Component({
  selector: 'app-my-list-page',
  standalone: true,
  imports: [MenuTmpComponent, GridListComponent],
  templateUrl: './my-list-page.component.html',
  styleUrl: './my-list-page.component.css'
})
export class MyListPageComponent {

  title = 'MYLIST_PAGE';

  //private abortController = new AbortController();
  medias: MediaModel[] | undefined = undefined;
  format !: FormatPosterModel;
  subscription: Subscription = new Subscription();
  gap !: number;
  marginLeft !: number;
  marginBottom !: number;
  nbPosterPerLine: number = 0;
  loadNewFormat: boolean = false;

  constructor(private readonly userService: UserService,
    private readonly formatPosterService: FormatPosterService,
    //private readonly imagePreloaderService: ImagePreloaderService,
    private readonly menuTabService: MenuTabService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly mediaSelectedService: MediaSelectedService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_MYLIST);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe((medias: MediaModel[]) => {
        this.medias = medias;
        this.loadNewFormat = true;
        // const format: FormatPosterModel = this.formatPosterService.getFormatPosterMyListValue();
        // const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(medias, format);

        // this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        //   this.medias = medias;
        //   this.loadNewFormat = true;
        // })
      })
    );
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterMyList().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.medias = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    //this.abortController.abort();
    this.mediaSelectedService.clearSelection();
  }

  private reloadWhenFormatPosterChange(): void {
    //this.abortController.abort();
    this.userService.fetchMyMediaListByUserId().pipe(take(1)).subscribe((medias: MediaModel[]) => {
      this.medias = medias;
      this.loadNewFormat = true;
      // const format: FormatPosterModel = this.formatPosterService.getFormatPosterMyListValue();
      // const img: string[] = this.imagePreloaderService.getPosterFromMediaListToLoad(medias, format);

      // this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
      //   this.medias = medias;
      //   this.loadNewFormat = true;
      // });
    })
  }

}
