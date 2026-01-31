import { Component } from '@angular/core';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { forkJoin, Subscription, take } from 'rxjs';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { MediaModel } from '../../../media-module/models/media.interface';
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

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MediaPageComponent, SelectionsListComponent, HomeLicenseListComponent, MenuTmpComponent, NewsListComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {

  private abortController = new AbortController();
  mediaSelected: MediaModel | undefined = undefined;
  selections: SelectionModel[] = [];
  format !: FormatPosterModel;
  news: NewsModel[] | undefined = undefined;
  private loadNewFormat: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private selectionService: SelectionService,
    private newsService: NewsService,
    private mediaSelectedService: MediaSelectedService,
    private formatPosterService: FormatPosterService,
    private menuTabService: MenuTabService,
    private imagePreloaderService: ImagePreloaderService,
  ) {
    this.menuTabService.setActivateTransition(false);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.mediaSelected = media;
      })
    )
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterHome().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.selections = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )
    this.setPage();
  }

  private setPage(): void {
    forkJoin({
      selections: this.selectionService.fetchSelectionOnHomePage(),
      news: this.newsService.fetchGetAllNews()
    }).pipe(take(1)).subscribe((result: { selections: SelectionModel[], news: NewsModel[] }) => {
      const img: string[] = [];
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterHomeValue();
      img.push(...this.imagePreloaderService.getPosterFromSelectionToLoad(result.selections, format));
      img.push(...this.imagePreloaderService.getImageFromNewsList(result.news));

      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.news = result.news;
        this.selections = result.selections;
        this.loadNewFormat = true;
      });
    })
  }

  private reloadWhenFormatPosterChange(): void {
    this.abortController.abort();
    this.selectionService.fetchSelectionOnHomePage().pipe(take(1)).subscribe((selections: SelectionModel[]) => {
      const img: string[] = this.imagePreloaderService.getPosterFromSelectionToLoad(selections, this.format);
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.selections = selections;
      })
    })
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

}
