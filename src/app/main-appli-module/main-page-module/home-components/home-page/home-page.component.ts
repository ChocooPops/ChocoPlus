import { Component } from '@angular/core';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { forkJoin, Subject, Subscription, take, takeUntil } from 'rxjs';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { HomeLicenseListComponent } from '../../../license-module/components/home-license-list/home-license-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { NewsService } from '../../../news-module/services/news/news.service';
import { NewsModel } from '../../../news-module/models/news.interface';
import { MenuTmpComponent } from '../../../menu-module/components/menu-tmp/menu-tmp.component';
import { NewsListComponent } from '../../../news-module/components/news-list/news-list.component';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SelectionsListComponent, HomeLicenseListComponent, MenuTmpComponent, NewsListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {

  private abortController = new AbortController();
  private subscription: Subscription = new Subscription();

  news: NewsModel[] | undefined = undefined;
  selections: SelectionModel[] | undefined = undefined;
  format !: FormatPosterModel;

  constructor(private selectionService: SelectionService,
    private newsService: NewsService,
    private mediaSelectedService: MediaSelectedService,
    private formatPosterService: FormatPosterService,
    private menuTabService: MenuTabService,
    private imagePreloaderService: ImagePreloaderService,
    private loadOpeningPageService: LoadOpeningPageService
  ) {
    this.menuTabService.setActivateTransition(false);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_HOME);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterHome().subscribe((format: FormatPosterModel) => {
        this.format = format;
      })
    )
    this.setPage();
  }

  private setPage(): void {
    this.subscription.add(
      forkJoin({
        selections: this.selectionService.fetchSelectionOnHomePage().pipe(take(1)),
        news: this.newsService.fetchGetAllNews().pipe(take(1))
      }).subscribe({
        next: (result: { selections: SelectionModel[], news: NewsModel[] }) => {
          const img: string[] = this.imagePreloaderService.getImageFromNewsList(result.news.slice(0, 1));

          this.imagePreloaderService.preloadImages(img, this.abortController.signal)
            .finally(() => {
              if (this.abortController.signal.aborted) return;
              this.news = result.news;
              this.selections = result.selections;
            });
        },
        error: () => {
          this.news = [];
          this.selections = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

}
