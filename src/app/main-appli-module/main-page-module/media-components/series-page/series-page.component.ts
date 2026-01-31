import { Component } from '@angular/core';
import { VideoRunningPresentationComponent } from '../video-running-presentation/video-running-presentation.component';
import { VideoRunningPresentationLoadingComponent } from '../video-running-presentation-loading/video-running-presentation-loading.component';
import { SelectionsListComponent } from '../../../media-module/components/selections/selections-list/selections-list.component';
import { MediaPageComponent } from '../../../media-module/components/media-page/media-page/media-page.component';
import { MediaModel } from '../../../media-module/models/media.interface';
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

@Component({
  selector: 'app-series-page',
  standalone: true,
  imports: [VideoRunningPresentationComponent, VideoRunningPresentationLoadingComponent, SelectionsListComponent, MediaPageComponent],
  templateUrl: './series-page.component.html',
  styleUrl: './series-page.component.css'
})
export class SeriesPageComponent {

  private abortController = new AbortController();
  seriesShowHome !: NewsVideoRunningModel | undefined;
  seriesSelection: SelectionModel[] | undefined;
  seriesSelected: MediaModel | undefined = undefined;
  format !: FormatPosterModel;
  private loadNewFormat: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private selectionService: SelectionService,
    private mediaSelectedService: MediaSelectedService,
    private imagePreloaderService: ImagePreloaderService,
    private formatPosterService: FormatPosterService,
    private menuTabService: MenuTabService,
    private newsVideoRunningService: NewsVideoRunningService
  ) {
    this.menuTabService.setActivateTransition(true);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.mediaSelectedService.getMediaSelected().subscribe((series: MediaModel | undefined) => {
        this.seriesSelected = series;
      })
    )
    this.subscription.add(
      this.formatPosterService.fetchFormatPosterSeries().subscribe((format: FormatPosterModel) => {
        this.format = format;
        if (this.loadNewFormat) {
          //this.seriesSelection = undefined;
          this.reloadWhenFormatPosterChange();
        }
      })
    )
    this.setPage();
  }

  private setPage(): void {
    forkJoin({
      selections: this.selectionService.fetchRandomSelectionOnSeries(),
      seriesShow: this.newsVideoRunningService.fetchRandomSeriesRunning(),
    }).pipe(take(1)).subscribe((result: { selections: SelectionModel[], seriesShow: NewsVideoRunningModel }) => {
      const img: string[] = [];
      const format: FormatPosterModel = this.formatPosterService.getFormatPosterMovieValue();
      img.push(...this.imagePreloaderService.getImageFormNewsVideoRunning(result.seriesShow));
      img.push(...this.imagePreloaderService.getPosterFromSelectionToLoad(result.selections, format));

      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.seriesShowHome = result.seriesShow;
        this.seriesSelection = result.selections;
        this.loadNewFormat = true;
      });
    })
  }

  private reloadWhenFormatPosterChange(): void {
    this.abortController.abort();
    this.selectionService.fetchRandomSelectionOnSeries().pipe(take(1)).subscribe((selections: SelectionModel[]) => {
      const img: string[] = this.imagePreloaderService.getPosterFromSelectionToLoad(selections, this.format);
      this.imagePreloaderService.preloadImages(img, this.abortController.signal).finally(() => {
        this.seriesSelection = selections;
      })
    })
  }

  ngOnDestroy(): void {
    this.mediaSelectedService.clearSelection();
    this.subscription.unsubscribe();
    this.abortController.abort();
  }

}
