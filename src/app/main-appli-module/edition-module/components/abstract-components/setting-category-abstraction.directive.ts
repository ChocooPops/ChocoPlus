import { Directive } from "@angular/core";
import { CategoryService } from "../../services/category/category.service";
import { CategoryEntirelyModel } from "../../models/category/categoryEntirely.model";
import { Subscription } from "rxjs";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { SelectionType } from "../../../media-module/models/selection-type.enum";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { MovieModel } from "../../../media-module/models/movie-model";
import { SeriesModel } from "../../../media-module/models/series/series.interface";
import { EditionParametersService } from "../../services/edition-parameters/edition-parameters.service";
import { MediaTypeModel } from "../../../media-module/models/media-type.enum";

@Directive({})
export abstract class SettingCategoryAbstraction extends UnauthorizedError {

    constructor(protected readonly categoryService: CategoryService,
        editionParametersService: EditionParametersService
    ) {
        super(editionParametersService);
    }

    protected placeholderTextTmdbId = 'EDITION.PLACEHOLDER_TMDB';
    protected exCategory = 'EDITION.CATEGORY.PLACEHOLDER_NAME_CATEGORY';
    protected exNameSelectionCategory = 'EDITION.CATEGORY.PLACEHOLDER_NAME_SELECTION';
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

    protected onChangeTranslationKeyCategory(name: string): void {
        this.categoryService.modifyTranslationKeyCategory(name);
    }

    protected onChangeTmdbId(tmdbId: number): void {
        this.categoryService.modifyTmdbId(tmdbId);
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
            createFrom: MediaTypeModel.OTHER
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
            createFrom: MediaTypeModel.OTHER
        }]
    }

}