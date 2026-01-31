import { Directive, Input } from "@angular/core";
import { SelectionModel } from "../../models/selection.interface";
import { SelectionType } from "../../models/selection-type.enum";
import { PaginationModel } from "../../models/pagination.interface";
import { Subscription } from "rxjs";
import { MediaModel } from "../../models/media.interface";
import { GeometricDimensionSelectionModel } from "../../models/geometric-dimension-selection.interface";
import { FormatPosterModel } from "../../../common-module/models/format-poster.enum";
import { PaginationPosterService } from "../../services/pagination-poster/pagination-poster.service";

@Directive({})
export abstract class SelectionAbstraction {

    @Input() selection !: SelectionModel;
    protected selectionShowed !: SelectionModel;
    protected formatType = FormatPosterModel;

    protected SelectionType = SelectionType;
    protected pagination !: PaginationModel[];
    protected offsetX: number = 0;
    protected nbPagination !: number;
    protected nbPosterPerLine !: number;

    protected displayScrollLeft!: boolean;
    protected displayScrollRight!: boolean;
    protected activateTransition: boolean = true;
    protected subscription: Subscription = new Subscription();

    protected marginBottom: number = 0;

    constructor(protected paginationPosterService: PaginationPosterService) { }

    protected widthPosterValue!: number;
    protected heightSelection !: number;
    protected heightForScrollButton !: number;
    protected gap !: number;
    protected marginLeft !: number;
    protected initialMarginLeft !: number;
    protected marginLeftAfterScrolling !: number;
    protected marginLeftTitle !: number;

    ngOnInit(): void {
        this.setPagination();
    }

    protected abstract setPagination(): void;

    protected setMarginBottomWithVerticalPoster(): void {
        this.subscription.add(
            this.paginationPosterService.getVerticalGeometricDimensionSelection().subscribe((dimension: GeometricDimensionSelectionModel) => {
                this.marginLeftTitle = dimension.marginLeft;
            })
        )
    }

    protected fillGeometricDimension(dimension: GeometricDimensionSelectionModel): void {
        this.nbPosterPerLine = dimension.nbPosterPerLine;
        this.gap = dimension.gapBetweenPoster;
        this.marginLeft = dimension.marginLeft;
        this.initialMarginLeft = dimension.marginLeft;
        this.marginLeftAfterScrolling = dimension.widthPoster - this.marginLeft;
        this.heightSelection = dimension.heightPoster;
        this.setNbPage();
        this.setSelectionShowed();
    }

    protected setSelectionShowed(): void {
        this.selectionShowed = {
            id: 1,
            typeSelection: SelectionType.NORMAL_POSTER,
            name: "",
            mediaList: structuredClone(this.selection.mediaList.slice(0, this.nbPosterPerLine + 1))
        };
        this.selectionShowed.mediaList[0].typeZoomX = true;
        if (this.selection.mediaList.length > this.nbPosterPerLine) {
            this.selectionShowed.mediaList[this.selectionShowed.mediaList.length - 2].typeZoomX = false;
        } else if (this.selection.mediaList.length === this.nbPosterPerLine) {
            this.selectionShowed.mediaList[this.selectionShowed.mediaList.length - 1].typeZoomX = false;
        }
    }

    protected setNbPage(): void {
        this.nbPagination = Math.ceil(this.selection.mediaList.length / this.nbPosterPerLine)
        this.pagination = this.paginationPosterService.setPaginationSelection(this.nbPagination);
        if (this.nbPagination > 1) {
            this.displayScrollRight = true;
        }
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    protected getClientWidth(): number {
        return document.documentElement.clientWidth;
    }

    private vwToPx(vw: number): number {
        const width = window.innerWidth;
        return (vw / 100) * width;
    }

    timerDuringScrolling: any | null;
    activateScrolling: boolean = true;

    protected startTimerDuringScrolling(direction: boolean): void {
        this.timerDuringScrolling = setTimeout(() => {
            this.activateScrolling = true;
            clearTimeout(this.timerDuringScrolling);
            this.timerDuringScrolling = null;
            this.removeMovieNotDisplayed(direction);
            if (!this.displayScrollLeft) {
                this.displayScrollLeft = true;
            }
        }, 1100)
    }

    protected clickRight(): void {
        if (this.activateScrolling) {
            const maxIndex: number = this.selection.mediaList.findIndex((media: MediaModel) => media.id === this.selectionShowed.mediaList[this.selectionShowed.mediaList.length - 1].id)
            this.selectionShowed.mediaList.push(...this.getNextValues(maxIndex, this.nbPosterPerLine));
            this.onClickButtonLeftOrRight(true);
            this.paginationPosterService.nextPagination(this.pagination);
        }
    }

    protected clickLeft(): void {
        if (this.activateScrolling) {
            const maxIndex: number = this.selection.mediaList.findIndex((media: MediaModel) => media.id === this.selectionShowed.mediaList[0].id)
            this.selectionShowed.mediaList.unshift(...this.getPreviousValues(maxIndex, this.nbPosterPerLine));

            this.activateTransition = false;
            const innerWidth: number = this.getClientWidth();
            const marginLefPx: number = this.vwToPx(this.initialMarginLeft);
            const gapPx: number = this.vwToPx(this.gap);
            this.offsetX = (-innerWidth + (marginLefPx * 2) - gapPx) * 1;
            this.paginationPosterService.beforePagination(this.pagination);

            setTimeout(() => {
                this.onClickButtonLeftOrRight(false)
            }, 10)
        }
    }

    private getNextValues(startIndex: number, count: number): MediaModel[] {
        const result: MediaModel[] = [];
        const listLength: number = this.selection.mediaList.length;
        for (let i = 1; i <= count; i++) {
            const index = (startIndex + i) % listLength;
            result.push(this.selection.mediaList[index]);
        }
        return result;
    }

    private getPreviousValues(startIndex: number, count: number): MediaModel[] {
        const result: MediaModel[] = [];
        const listLength: number = this.selection.mediaList.length;
        for (let i = 1; i <= count; i++) {
            const index = (startIndex - i + listLength) % listLength;
            result.push(this.selection.mediaList[index]);
        }
        return result.reverse();
    }

    private removeMovieNotDisplayed(direction: boolean): void {
        if (direction) { //right
            this.selectionShowed.mediaList.splice(0, this.selectionShowed.mediaList.length - (this.nbPosterPerLine + 2));
        } else { //left
            this.selectionShowed.mediaList.length = this.nbPosterPerLine + 2;
        }
        this.activateTransition = false;
        this.offsetX = 0;
        this.marginLeft = -this.marginLeftAfterScrolling - this.gap;
        this.updateZoomTypes();
    }

    private updateZoomTypes(): void {
        for (let i = 0; i < this.selectionShowed.mediaList.length; i++) {
            if (i === 1) {
                this.selectionShowed.mediaList[i].typeZoomX = true;
            } else if (i === this.selectionShowed.mediaList.length - 2) {
                this.selectionShowed.mediaList[i].typeZoomX = false;
            } else {
                this.selectionShowed.mediaList[i].typeZoomX = undefined;
            }
        }
    }

    private onClickButtonLeftOrRight(direction: boolean): void {
        this.activateScrolling = false;
        this.activateTransition = true;
        const innerWidth: number = this.getClientWidth();
        const marginLefPx: number = this.vwToPx(this.initialMarginLeft);
        const gapPx: number = this.vwToPx(this.gap);
        if (direction) {
            this.offsetX = (-innerWidth + (marginLefPx * 2) - gapPx);
        } else {
            this.offsetX = 0;
        }
        this.startTimerDuringScrolling(direction);
    }
}