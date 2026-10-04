import { Component } from '@angular/core';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { Subscription, take, forkJoin } from 'rxjs';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { VideoRunningPresentationComponent } from '../video-running-presentation/video-running-presentation.component';
import { VideoRunningPresentationLoadingComponent } from '../video-running-presentation-loading/video-running-presentation-loading.component';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { NewsVideoRunningService } from '../../../news-module/services/news-video-running/news-video-running.service';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';

@Component({
  selector: 'app-movie-page',
  standalone: true,
  imports: [VideoRunningPresentationComponent, VideoRunningPresentationLoadingComponent, SelectionsListComponent],
  templateUrl: './movie-page.component.html',
  styleUrl: './movie-page.component.css'
})
export class MoviePageComponent {

  private abortController = new AbortController();
  private subscription: Subscription = new Subscription();

  movieShowHome !: NewsVideoRunningModel | undefined;
  movieSelections: SelectionModel[] | undefined = undefined;
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
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_MOVIE);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterMovie().subscribe((format: FormatPosterModel) => {
        this.format = format;
      })
    )
    this.setPage();
  }

  private setPage(): void {
    this.subscription.add(
      forkJoin({
        selections: this.selectionService.fetchRandomSelectionOnMoviePage().pipe(take(1)),
        movieShow: this.newsVideoRunningService.fetchRandomNewsMovieRunning().pipe(take(1)),
      }).subscribe({
        next: (result: { selections: SelectionModel[], movieShow: NewsVideoRunningModel }) => {
          const img: string[] = this.imagePreloaderService.getImageFormNewsVideoRunning(result.movieShow);

          this.imagePreloaderService.preloadImages(img, this.abortController.signal)
            .finally(() => {
              if (this.abortController.signal.aborted) return;
              this.movieShowHome = result.movieShow;
              this.movieSelections = result.selections;
            });
        },
        error: () => {
          this.movieShowHome = undefined;
          this.movieSelections = [];
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
