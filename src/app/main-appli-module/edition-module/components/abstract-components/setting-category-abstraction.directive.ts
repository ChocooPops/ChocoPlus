import { Directive } from "@angular/core";
import { CategoryService } from "../../services/category/category.service";
import { CategoryEntirelyModel } from "../../models/category/categoryEntirely.model";
import { Subscription } from "rxjs";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { SelectionType } from "../../../media-module/models/selection-type.enum";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { MovieModel } from "../../../media-module/models/movie-model";
import { SeriesModel } from "../../../media-module/models/series/series.interface";

@Directive({})
export abstract class SettingCategoryAbstraction extends UnauthorizedError {

    constructor(protected categoryService: CategoryService) {
        super();
    }

    protected exCategory: string = 'ex : Science Fiction';
    protected exNameSelectionCategory: string = 'ex : Film de Science Fiction';
    protected editCategory !: CategoryEntirelyModel;
    protected editSelectionMovie: SelectionModel[] = [];
    protected editSelectionSeries: SelectionModel[] = [];
    protected subscription: Subscription = new Subscription();

    ngOnInit(): void {
        this.initEditCategory();
    }

    protected initEditCategory(): void {
        this.subscription.add(
            this.categoryService.getEditCategory().subscribe((edit: CategoryEntirelyModel) => {
                this.editCategory = edit;
                this.editSelectionMovie = this.getEditSelectionMovie(edit);
                this.editSelectionSeries = this.getEditSelectionSeries(edit);
            })
        )
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    //MOVIES
    protected onChangeNameCategory(name: string): void {
        this.categoryService.modifyNameCategory(name);
    }

    protected onChangeNameSelectionCategory(name: string): void {
        this.categoryService.modifyNameSelectionCategory(name);
    }

    protected addMovieIntoCaregorie(media: MovieModel): void {
        this.categoryService.addMovieIntoCategory(media);
    }
    protected removeMovie(mediaId: number): void {
        this.categoryService.removeMovieIntoCategory(mediaId);
    }
    protected moveMovieLeft(mediaId: number): void {
        this.categoryService.moveMovieLeftAccordingToCategory(mediaId);
    }
    protected moveMovieRight(mediaId: number): void {
        this.categoryService.moveMovieRightAccordingToCategory(mediaId);
    }
    protected getEditSelectionMovie(edit: CategoryEntirelyModel): SelectionModel[] {
        return [{
            id: edit.id,
            name: edit.nameSelection,
            typeSelection: SelectionType.NORMAL_POSTER,
            mediaList: edit.movies,
        }]
    }

    //SERIES
    protected addSeriesIntoCaregorie(media: SeriesModel): void {
        this.categoryService.addSeriesIntoCategory(media);
    }
    protected removeSeries(mediaId: number): void {
        this.categoryService.removeSeriesIntoCategory(mediaId);
    }
    protected moveSeriesLeft(mediaId: number): void {
        this.categoryService.moveSeriesLeftAccordingToCategory(mediaId);
    }
    protected moveSeriesRight(mediaId: number): void {
        this.categoryService.moveSeriesRightAccordingToCategory(mediaId);
    }
    protected getEditSelectionSeries(edit: CategoryEntirelyModel): SelectionModel[] {
        return [{
            id: edit.id,
            name: edit.nameSelection,
            typeSelection: SelectionType.NORMAL_POSTER,
            mediaList: edit.series,
        }]
    }

}