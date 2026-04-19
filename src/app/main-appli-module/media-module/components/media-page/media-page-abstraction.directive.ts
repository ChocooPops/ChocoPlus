import { Directive, ViewChild, ElementRef } from '@angular/core';
import { MediaBackgroundVerticalComponent } from './media-page-vertical/media-vertical-background/media-background.component';
import { MediaTypeModel } from '../../models/media-type.enum';
import { MediaModel } from '../../models/media.interface';
import { SeasonModel } from '../../models/series/season.interface';
import { Subscription } from 'rxjs';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { MenuTabService } from '../../../menu-module/service/menu-tab/menu-tab.service';
import { MovieModel } from '../../models/movie-model';
import { SeriesModel } from '../../models/series/series.interface';

@Directive({})
export abstract class MediaPageAbstraction {

    clearMediaSelected: boolean = true;

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    private _viewChildBack?: MediaBackgroundVerticalComponent;

    @ViewChild(MediaBackgroundVerticalComponent)
    set viewChildBack(component: MediaBackgroundVerticalComponent | undefined) {
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
    isHidden!: boolean;

    subscriptionSelectedMedia: Subscription = new Subscription();

    isHover: boolean = false;
    displaying: boolean = false;
    transitionMenuIsActivate: boolean = false;

    constructor(private readonly mediaSelectedService: MediaSelectedService,
        private readonly MenuTabService: MenuTabService) {}

    mouseEnter(): void {
        this.isHover = true;
    }
    mouseLeave(): void {
        this.isHover = false;
    }

    ngOnInit(): void {
        this.subscriptionSelectedMedia.add(
        this.mediaSelectedService
            .getMediaSelected()
            .subscribe((media: MediaModel | undefined) => {
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
            if (this.media) {
                this.transitionMenuIsActivate =
                this.MenuTabService.setActivateTransitionValue();
                if (this.transitionMenuIsActivate) {
                this.MenuTabService.setActivateTransitionFromMediaPage(false);
                }
            } else {
                if (this.transitionMenuIsActivate) {
                this.MenuTabService.setActivateTransitionFromMediaPage(true);
                }
                this.transitionMenuIsActivate = false;
            }
            }),
        );
    }

    ngOnDestroy(): void {
        this.stopTimer();
        if (this.clearMediaSelected) {
            this.mediaSelectedService.clearSelection();
        }
        this.subscriptionSelectedMedia.unsubscribe();
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

    transformMediaIntoMovie(): MovieModel {
        return this.media as MovieModel;
    }

    transformMediaIntoSeries(): SeriesModel {
        return this.media as SeriesModel;
    }

    loadingDisplaying(): void {
        this.displaying = true;
    }

    onLoadPoster(): void {
        this._viewChildBack?.onPosterLoad();
    }

    onClickFormatMediaPage(): void {
        this.clearMediaSelected = false;
    }
}
