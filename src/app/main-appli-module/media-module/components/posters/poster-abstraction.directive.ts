import { Directive, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { DisplayOrderService } from '../../services/display-order/display-order.service';
import { Subscription } from 'rxjs';
import { DimensionModel } from '../../../../common-module/models/dimension.interface';
import { GeometricDimensionSelectionModel } from '../../models/geometric-dimension-selection.interface';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';
import { SelectionType } from '../../models/selection-type.enum';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { PaginationPosterService } from '../../services/pagination-poster/pagination-poster.service';
import { MediaSelectedService } from '../../services/media-selected/media-selected.service';
import { MediaModel } from '../../models/media.interface';
import { MovieModel } from '../../models/movie-model';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SeriesModel } from '../../models/series/series.interface';
import { SeasonModel } from '../../models/series/season.interface';

@Directive()
export class PosterAbstraction {

    @Input() media !: MediaModel;
    @Input() typeZoomX: boolean | undefined = undefined;
    @Input() typeZoomY: boolean = false;
    @ViewChild('poster') poster !: ElementRef<HTMLDivElement>;
    @Input() displayOnEditionPage: boolean = false;

    protected MediaType = MediaTypeModel;
    protected typePoster: SelectionType = SelectionType.NORMAL_POSTER;
    protected srcPoster !: string | undefined;
    protected srcLogo !: string | undefined;
    protected transformScale: number = 1;
    protected transformTranslateX: number = 0;
    protected transformTranslateY: number = 0;
    protected transformStyle: string = '';
    private gap: number = 0;
    private marginLeft: number = 0;
    isHover: boolean = false;
    zIndex !: number;
    subscription: Subscription = new Subscription();
    dimension !: DimensionModel;
    duration !: string;
    quality !: string;
    nbSeason !: string;
    seasons !: SeasonModel[];

    constructor(protected mediaSelectedService: MediaSelectedService,
        protected displayOrderService: DisplayOrderService,
        protected paginationPosterService: PaginationPosterService,
        protected verifTimerShowService: VerifTimerShowService,
        protected compressedPosterService: CompressedPosterService
    ) {
        this.zIndex = this.displayOrderService.getInitOrder();
    }

    public selectedMovieActivate(media: MediaModel): void {
        this.mediaSelectedService.selectMedia(media);
    }

    ngOnInit() {
        if (this.media.mediaType === MediaTypeModel.MOVIE) {
            this.duration = this.verifTimerShowService.extractHourAndMinute((this.media as MovieModel).time);
            this.quality = (this.media as MovieModel).quality || 'any quality';
        } else if (this.media.mediaType === MediaTypeModel.SERIES) {
            const nb: number = (this.media as SeriesModel).seasons.length;
            this.seasons = (this.media as SeriesModel).seasons;
            if (nb > 1) {
                this.nbSeason = `${nb} Saisons`;
            } else {
                this.nbSeason = `${nb} Saison`;
            }
        }
        this.srcPoster = this.compressedPosterService.getPosterMedia(this.typePoster, this.media);
        if (this.typePoster === SelectionType.NORMAL_POSTER) {
            this.subscription.add(
                this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
                    this.dimension = {
                        height: this.displayOnEditionPage ? dimension.heightPoster * 0.87 : dimension.heightPoster,
                        width: dimension.widthPoster
                    };
                    this.marginLeft = dimension.marginLeft;
                    this.gap = dimension.gapBetweenPoster;
                    this.setScaleAndTranslateXY();
                })
            )
        } else if (this.typePoster === SelectionType.SPECIAL_POSTER) {
            this.subscription.add(
                this.paginationPosterService.getSpecialGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
                    this.dimension = {
                        height: dimension.heightPoster,
                        width: dimension.widthPoster
                    };
                })
            )
        } else if (this.typePoster === SelectionType.LICENSE_POSTER) {
            this.subscription.add(
                this.paginationPosterService.getLicenseGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
                    this.dimension = {
                        height: dimension.heightPoster,
                        width: dimension.widthPoster
                    };
                })
            )
        } else if (this.typePoster === SelectionType.HORIZONTAL_POSTER) {
            this.srcLogo = this.compressedPosterService.getLogoForMedia(this.media);
            this.subscription.add(
                this.paginationPosterService.getHorizontalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
                    this.dimension = {
                        height: dimension.heightPoster,
                        width: dimension.widthPoster
                    }
                    this.marginLeft = dimension.marginLeft;
                    this.gap = dimension.gapBetweenPoster;
                    this.setScaleAndTranslateXY();
                })
            )
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['typeZoomX']) {
            this.setScaleAndTranslateXY();
        }
    }

    onErrorImage(): void {
        this.srcPoster = undefined;
    }

    onMouseEnter(): void {
        this.displayOrderService.startTimerZoom(() => {
            this.isHover = true;
            this.setTransformStyle(this.transformScale, this.transformTranslateX, this.transformTranslateY);
            this.zIndex = this.displayOrderService.getOrderDisplay();
        })
    }

    onMouseLeave(): void {
        this.isHover = false;
        this.setTransformStyle(1, 0, 0);
        this.displayOrderService.stopTimerZoom();
        this.displayOrderService.startTimerEndZoom(() => {
            this.zIndex = this.displayOrderService.getInitOrder();
        })
    }

    private setTransformStyle(scale: number, translateX: number, translateY: number): void {
        this.transformStyle = `scale(${scale}) translate(${translateX}vw, ${translateY}vw)`;
    }

    private setScaleAndTranslateXY(): void {
        if (this.typeZoomX != undefined) {
            if (this.typeZoomX) {
                this.transformTranslateX = this.marginLeft - this.gap;
            } else {
                this.transformTranslateX = - (this.marginLeft - this.gap);
            }
        } else {
            this.transformTranslateX = 0;
        }

        if (this.typeZoomY) {
            this.transformTranslateY = this.marginLeft - this.gap;
        } else {
            this.transformTranslateY = 0;
        }
    }

}