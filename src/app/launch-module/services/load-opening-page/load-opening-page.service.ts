import { Injectable } from '@angular/core';
import { SelectionService } from '../../../main-appli-module/media-module/services/selection/selection.service';
import { NewsService } from '../../../main-appli-module/news-module/services/news/news.service';
import { LicenseService } from '../../../main-appli-module/license-module/service/license/licence.service';
import { ImagePreloaderService } from '../../../common-module/services/image-preloader/image-preloader.service';
import { forkJoin, take } from 'rxjs';
import { SelectionModel } from '../../../main-appli-module/media-module/models/selection.interface';
import { NewsModel } from '../../../main-appli-module/news-module/models/news.interface';
import { FormatPosterModel } from '../../../main-appli-module/common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../main-appli-module/common-module/services/format-poster/format-poster.service';
import { Router } from '@angular/router';
import { LicenseModel } from '../../../main-appli-module/license-module/model/license.interface';
import { PageModel } from '../../models/page.enum';
import { UserService } from '../../../main-appli-module/user-module/service/user/user.service';
import { MediaModel } from '../../../main-appli-module/media-module/models/media.interface';
import { NewsVideoRunningService } from '../../../main-appli-module/news-module/services/news-video-running/news-video-running.service';
import { NewsVideoRunningModel } from '../../../main-appli-module/news-module/models/news-video-running.interface';

@Injectable({
  providedIn: 'root',
})
export class LoadOpeningPageService {
  private readonly lastPageVisited: string = 'LAST_PAGE_VISITED';
  private readonly openingPage: string = 'OPENING_PAGE';

  constructor(
    private selectionService: SelectionService,
    private newsService: NewsService,
    private licenseService: LicenseService,
    private imagePreloaderService: ImagePreloaderService,
    private formatPosterService: FormatPosterService,
    private userService: UserService,
    private newsVideoRunningService: NewsVideoRunningService,
    private router: Router,
  ) {}

  public setLastPageVisited(page: PageModel): void {
    localStorage.setItem(this.lastPageVisited, page);
  }
  public getLastPageVisited(): PageModel {
    const page: PageModel = localStorage.getItem(
      this.lastPageVisited,
    ) as PageModel;
    if (page) {
      return page;
    } else {
      this.setLastPageVisited(PageModel.PAGE_HOME);
      return PageModel.PAGE_HOME;
    }
  }

  public setOpeningPage(page: PageModel): void {
    localStorage.setItem(this.openingPage, page);
  }
  public getOpeningPage(): PageModel {
    const page: PageModel = localStorage.getItem(this.openingPage) as PageModel;
    if (page) {
      return page;
    } else {
      this.setOpeningPage(PageModel.PAGE_HOME);
      return PageModel.PAGE_HOME;
    }
  }

  public loadHomePageDataAndNavigate(): void {
    forkJoin({
      selections: this.selectionService.fetchSelectionOnHomePage(),
      news: this.newsService.fetchGetAllNews(),
      licensesHome: this.licenseService.fetchAllLicenseHome(),
    })
      .pipe(take(1))
      .subscribe(
        (result: {
          selections: SelectionModel[];
          news: NewsModel[];
          licensesHome: LicenseModel[];
        }) => {
          const img: string[] = [];
          const format: FormatPosterModel =
            this.formatPosterService.getFormatPosterHomeValue();
          img.push(
            ...this.imagePreloaderService.getAllIconsFromLicense(
              result.licensesHome,
            ),
          );
          img.push(
            ...this.imagePreloaderService.getImageFromNewsList(result.news),
          );
          img.push(
            ...this.imagePreloaderService.getPosterFromSelectionToLoad(
              result.selections,
              format,
            ),
          );

          this.imagePreloaderService.preloadImages(img).finally(() => {
            this.router.navigateByUrl('main-app');
          });
        },
      );
  }

  public loadResearchPageDataAndNavigate(): void {
    this.licenseService
      .fetchAllLicenseResearch()
      .pipe(take(1))
      .subscribe((data: LicenseModel[] | undefined) => {
        if (data) {
          const img: string[] =
            this.imagePreloaderService.getAllIconsFromLicense(data);
          this.imagePreloaderService.preloadImages(img).finally(() => {
            this.router.navigateByUrl('main-app/search');
          });
        }
      });
  }

  public loadMoviePageDataAndNavigate(): void {
    forkJoin({
      selections: this.selectionService.fetchRandomSelectionOnMoviePage(),
      movieShow: this.newsVideoRunningService.fetchRandomNewsMovieRunning(),
    })
      .pipe(take(1))
      .subscribe(
        (result: {
          selections: SelectionModel[];
          movieShow: NewsVideoRunningModel;
        }) => {
          const img: string[] = [];
          const format: FormatPosterModel =
            this.formatPosterService.getFormatPosterMovieValue();
          img.push(
            ...this.imagePreloaderService.getImageFormNewsVideoRunning(
              result.movieShow,
            ),
          );
          img.push(
            ...this.imagePreloaderService.getPosterFromSelectionToLoad(
              result.selections,
              format,
            ),
          );

          this.imagePreloaderService.preloadImages(img).finally(() => {
            this.router.navigateByUrl('main-app/movies');
          });
        },
      );
  }

  public loadSeriesPageDataAndNavigate(): void {
    forkJoin({
      selections: this.selectionService.fetchRandomSelectionOnSeries(),
      seriesShow: this.newsVideoRunningService.fetchRandomSeriesRunning(),
    })
      .pipe(take(1))
      .subscribe(
        (result: {
          selections: SelectionModel[];
          seriesShow: NewsVideoRunningModel;
        }) => {
          const img: string[] = [];
          const format: FormatPosterModel =
            this.formatPosterService.getFormatPosterMovieValue();
          img.push(
            ...this.imagePreloaderService.getImageFormNewsVideoRunning(
              result.seriesShow,
            ),
          );
          img.push(
            ...this.imagePreloaderService.getPosterFromSelectionToLoad(
              result.selections,
              format,
            ),
          );

          this.imagePreloaderService.preloadImages(img).finally(() => {
            this.router.navigateByUrl('main-app/series');
          });
        },
      );
  }

  public loadMyListPageDataAndNavigate(): void {
    this.userService
      .fetchMyMediaListByUserId()
      .pipe(take(1))
      .subscribe((medias: MediaModel[]) => {
        const format: FormatPosterModel =
          this.formatPosterService.getFormatPosterMyListValue();
        const img: string[] =
          this.imagePreloaderService.getPosterFromMediaListToLoad(
            medias,
            format,
          );
        this.imagePreloaderService.preloadImages(img).finally(() => {
          this.router.navigateByUrl('main-app/my-list');
        });
      });
  }

  public loadEditionPageDataAndNavigate(): void {
    this.router.navigateByUrl('main-app/edition');
  }

  public loadUserPageDataAndNavigate(): void {
    this.router.navigateByUrl('main-app/user/edit-profil');
  }

}
