import { Directive, Input, SimpleChanges } from "@angular/core";
import { MediaModel } from "../../models/media.interface";
import { Subscription } from "rxjs";
import { ImagePreloaderService } from "../../../../common-module/services/image-preloader/image-preloader.service";
import { GeometricDimensionSelectionModel } from "../../models/geometric-dimension-selection.interface";
import { PaginationPosterService } from "../../services/pagination-poster/pagination-poster.service";

@Directive({})
export abstract class GridAbstraction {

    @Input() mediaList: MediaModel[] | undefined = undefined;
    @Input() title: string = '';
    protected subscription: Subscription = new Subscription();
    protected marginLeft !: number;
    protected marginBottom !: number;
    protected gap !: number;
    protected nbPosterPerLine: number | undefined = undefined;
    protected height !: number;
    protected width !: number;
    protected marginBottomLoading !: number;
    protected postersLoading: number[] = [];

    protected verifTypeY: boolean = false;

    constructor(protected paginationPosterService: PaginationPosterService,
        protected imagePreloaderService: ImagePreloaderService
    ) { }

    ngOnInit(): void {
        this.subscribePagination();
        for (let i = 0; i < 24; i++) {
            this.postersLoading.push(i);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['mediaList'] && this.nbPosterPerLine) {
            this.resetTypeZoomMovie(this.nbPosterPerLine);
        }
    }

    protected abstract subscribePagination(): void;

    protected setPagination(dimension: GeometricDimensionSelectionModel): void {
        this.gap = dimension.gapBetweenPoster;
        this.marginLeft = dimension.marginLeft;
        this.nbPosterPerLine = dimension.nbPosterPerLine;
        this.width = dimension.widthPoster;
        this.resetTypeZoomMovie(dimension.nbPosterPerLine);
    }

    protected resetTypeZoomMovie(nbPosterPerLine: number): void {
        if (this.mediaList) {
            const list = this.mediaList;
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (!item) continue;

                if (i % nbPosterPerLine === 0) {
                    item.typeZoomX = true;
                } else if ((i + 1) % nbPosterPerLine === 0) {
                    item.typeZoomX = false;
                } else {
                    item.typeZoomX = undefined;
                }
            }

            if (this.verifTypeY && this.nbPosterPerLine) {
                for (let i = 0; i < this.mediaList.length; i++) {
                    if (i < this.nbPosterPerLine) {
                        this.mediaList[i].typeZoomY = true;
                    } else {
                        this.mediaList[i].typeZoomY = false;
                    }
                }
            }
        }
    }

}