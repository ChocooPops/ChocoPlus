import { Component, ElementRef, ViewChild } from '@angular/core';
import { MediaBackgroundComponent } from '../media-background/media-background.component';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../button/modify-button/modify-button.component';
import { Subscription } from 'rxjs';
import { CrossButtonComponent } from '../../button/cross-button/cross-button.component';
import { MylistButtonComponent } from '../../button/mylist-button/mylist-button.component';
import { MediaSelectedService } from '../../../services/media-selected/media-selected.service';
import { MediaModel } from '../../../models/media.interface';
import { MoviePageComponent } from '../movie-page/movie-page.component';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { MovieModel } from '../../../models/movie-model';
import { SeriesModel } from '../../../models/series/series.interface';
import { SeriesPageComponent } from '../series-page/series-page.component';
import { SeasonModel } from '../../../models/series/season.interface';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [CrossButtonComponent, SeriesPageComponent, MoviePageComponent, MylistButtonComponent, ModifyButtonComponent, StartButtonComponent, MediaBackgroundComponent, NgClass],
  templateUrl: './media-page.component.html',
  styleUrls: ['./media-page.component.css', '../../../../common-module/styles/animation.css']
})
export class MediaPageComponent {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private _viewChildBack?: MediaBackgroundComponent;

  @ViewChild(MediaBackgroundComponent)
  set viewChildBack(component: MediaBackgroundComponent | undefined) {
    this._viewChildBack = component;
    if (component && this.media?.mediaType === MediaTypeModel.SERIES) {
      this.onLoadPoster();
    }
  }

  media: MediaModel | undefined = undefined;
  seasons: SeasonModel[] | undefined = undefined;
  MediaType = MediaTypeModel;

  refreshment: number = 490;
  timerHidden: any = null;
  isHidden !: boolean;

  subscriptionSelectedMedia: Subscription = new Subscription();

  isHover: boolean = false;
  displaying: boolean = false;

  constructor(private mediaSelectedService: MediaSelectedService) { }

  mouseEnter(): void {
    this.isHover = true;
  }
  mouseLeave(): void {
    this.isHover = false;
  }

  ngOnInit(): void {
    this.subscriptionSelectedMedia.add(
      this.mediaSelectedService.getMediaSelected().subscribe((media: MediaModel | undefined) => {
        this.media = media;
        this.stopTimer();
        this.scrollToTop();
        this.displaying = false;
        if (this._viewChildBack) {
          this._viewChildBack.resetImageLoading();
        }
        if (this.media?.mediaType === MediaTypeModel.SERIES) {
          this.onLoadPoster();
          this.seasons = (this.media as SeriesModel).seasons;
        } else {
          this.seasons = [];
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.mediaSelectedService.clearSelection();
  }

  startTimerHidden(): void {
    if (!this.isHidden) {
      this.stopTimer();
      this.timerHidden = setTimeout(() => {
        this.mediaSelectedService.clearSelection();
        this.isHidden = false;
      }, this.refreshment);
    }
  }

  stopTimer(): void {
    clearInterval(this.timerHidden);
    this.timerHidden = null;
  }

  deleteMoviePage(): void {
    this.startTimerHidden();
    this.isHidden = true;
  }

  onClickBackground() {
    this.deleteMoviePage();
  }

  onClickInformations(event: MouseEvent): void {
    event.stopPropagation();
  }

  public scrollToTop(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  loadingDisplaying(): void {
    this.displaying = true;
  }

  transformMediaIntoMovie(): MovieModel {
    return this.media as MovieModel;
  }

  transformMediaIntoSeries(): SeriesModel {
    return this.media as SeriesModel;
  }

  onLoadPoster(): void {
    this._viewChildBack?.onPosterLoad();
  }

}
