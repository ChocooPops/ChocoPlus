import { Component } from '@angular/core';
import { MediaModel } from '../../../media-module/models/media.interface';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { FormatPosterModel } from '../../../common-module/models/format-poster.enum';
import { Subscription, take, forkJoin } from 'rxjs';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MediaSelectedService } from '../../../media-module/services/media-selected/media-selected.service';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { FormatPosterService } from '../../../common-module/services/format-poster/format-poster.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { VideoRunningPresentationComponent } from '../video-running-presentation/video-running-presentation.component';
import { VideoRunningPresentationLoadingComponent } from '../video-running-presentation-loading/video-running-presentation-loading.component';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { NewsVideoRunningService } from '../../../news-module/services/news-video-running/news-video-running.service';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { LoadOpeningPageService } from '../../../../launch-module/services/load-opening-page/load-opening-page.service';
import { PageModel } from '../../../../launch-module/models/page.enum';

@Component({
  selector: 'app-movie-page',
  standalone: true,
  imports: [MediaPageComponent, VideoRunningPresentationComponent, VideoRunningPresentationLoadingComponent, SelectionsListComponent],
  templateUrl: './movie-page.component.html',
  styleUrl: './movie-page.component.css'
})
export class MoviePageComponent {

  private abortController = new AbortController();
  movieShowHome !: NewsVideoRunningModel | undefined;
  movieSelections: SelectionModel[] | undefined = undefined;
  movieSelected: MediaModel | undefined = undefined;
  format !: FormatPosterModel;
  private loadNewFormat: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private selectionService: SelectionService,
    private mediaSelectedService: MediaSelectedService,
    private imagePreloaderService: ImagePreloaderService,
    private formatPosterService: FormatPosterService,
    private menuTabService: MenuTabService,
    private newsVideoRunningService: NewsVideoRunningService,
    private loadOpeningPageService: LoadOpeningPageService
  ) {
    this.menuTabService.setActivateTransition(true);
    this.loadOpeningPageService.setLastPageVisited(PageModel.PAGE_MOVIE);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((movie: MediaModel | undefined) => {
        this.movieSelected = movie;
      })
    );
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterMovie().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.movieSelections = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )
    this.setPage();
  }

  private setPage(): void {
    forkJoin({
      selections: this.selectionService.fetchRandomSelectionOnMoviePage(),
      movieShow: this.newsVideoRunningService.fetchRandomNewsMovieRunning(),
    }).pipe(take(1)).subscribe((result: { selections: SelectionModel[], movieShow: NewsVideoRunningModel }) => {
      const img: string[] = [];
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterMovieValue();
      img.push(...this.imagePreloaderService.getImageFormNewsVideoRunning(result.movieShow));
      img.push(...this.imagePreloaderService.getPosterFromSelectionToLoad(result.selections, format));

      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.movieShowHome = result.movieShow;
        this.movieSelections = result.selections;
        this.loadNewFormat = true;
      });
    })
  }

  private reloadWhenFormatPosterChange(): void {
    this.abortController.abort();
    this.selectionService.fetchRandomSelectionOnMoviePage().pipe(take(1)).subscribe((selections: SelectionModel[]) => {
      const img: string[] = this.imagePreloaderService.getPosterFromSelectionToLoad(selections, this.format);
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.movieSelections = selections;
      })
    })
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

}
