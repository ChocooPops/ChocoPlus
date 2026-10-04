import { Component } from '@angular/core';
import { VideoRunningPresentationComponent } from '../video-running-presentation/video-running-presentation.component';
import { VideoRunningPresentationLoadingComponent } from '../video-running-presentation-loading/video-running-presentation-loading.component';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { forkJoin, Subscription, take } from 'rxjs';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { NewsVideoRunningService } from '../../../news-module/services/news-video-running/news-video-running.service';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';

@Component({
  selector: 'app-series-page',
  standalone: true,
  imports: [VideoRunningPresentationComponent, VideoRunningPresentationLoadingComponent, SelectionsListComponent],
  templateUrl: './series-page.component.html',
  styleUrl: './series-page.component.css'
})
export class SeriesPageComponent {

  private abortController = new AbortController();
  private subscription: Subscription = new Subscription();

  seriesShowHome !: NewsVideoRunningModel | undefined;
  seriesSelection: SelectionModel[] | undefined;
  format !: FormatPosterModel;

  constructor(private readonly selectionService: SelectionService,
    private readonly mediaSelectedService: MediaSelectedService,
    private readonly imagePreloaderService: ImagePreloaderService,
    private readonly formatPosterService: FormatPosterService,
    private readonly menuTabService: MenuTabService,
    private readonly newsVideoRunningService: NewsVideoRunningService,
    private readonly loadOpeningPageService: LoadOpeningPageService,
    private readonly scrollEventService: ScrollEventService
  ) {
    this.scrollEventService.checkTopAchievement();
    this.menuTabService.setActivateTransition(true);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_SERIES);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterSeries().subscribe((format: FormatPosterModel) => {
        this.format = format;
      })
    )
    this.setPage();
  }

  private setPage(): void {
    this.subscription.add(
      forkJoin({
        selections: this.selectionService.fetchRandomSelectionOnSeries().pipe(take(1)),
        seriesShow: this.newsVideoRunningService.fetchRandomSeriesRunning().pipe(take(1)),
      }).subscribe({
        next: (result: { selections: SelectionModel[], seriesShow: NewsVideoRunningModel }) => {
          const img: string[] = this.imagePreloaderService.getImageFormNewsVideoRunning(result.seriesShow);

          this.imagePreloaderService.preloadImages(img, this.abortController.signal)
            .finally(() => {
              if (this.abortController.signal.aborted) return;
              this.seriesShowHome = result.seriesShow;
              this.seriesSelection = result.selections;
            });
        },
        error: () => {
          this.seriesShowHome = undefined;
          this.seriesSelection = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.abortController.abort();
    this.mediaSelectedService.clearSelection();
  }

}
