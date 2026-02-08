import { Directive, ElementRef, ViewChild, HostListener } from "@angular/core";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { EditionSeriesService } from "../../services/edition-series/edition-series.service";
import { EditSeriesModel } from "../../models/series/edit-series.interface";
import { SimpleModel } from "../../../../common-module/models/simple-model";
import { Subscription, take, finalize } from "rxjs";
import { TranslationTitle } from "../../models/translation-title.interface";
import { CategorySimpleModel } from "../../models/category/categorySimple.model";
import { EditTypePoster } from "../../models/edit-type-movie.interface";
import { MediaTypeModel } from "../../../media-module/models/media-type.enum";
import { EditSeasonModel } from "../../models/series/edit-season.interface";
import { TmdbOperationService } from "../../services/tmdb-operation/tmdb-operation.service";
import { AiButtonComponent } from "../ai-button/ai-button.component";

@Directive({})
export abstract class SettingSeriesAbstraction extends UnauthorizedError {

    @ViewChild('buttonSearchTmdb') buttonSearchTmdb !: AiButtonComponent;
    @ViewChild('buttonSearchJellyfin') buttonSearchJellyfin !: AiButtonComponent;
    @ViewChild('otherTitles') otherTitlesRef!: ElementRef;
    @ViewChild('buttonOtherLanguage') buttonOtherLanguageRef!: ElementRef;

    protected exTextLogo: string = "ex : Logo de la série";
    protected exTestBackgroundImage: string = "ex : Plan iconique de la série";
    protected placeHolderActor: string = "ex : Bryan Cranston";
    protected placeHolderTitle: string = "ex : Breaking Bad";
    protected placeHolderDirector: string = "ex : Vince Gilligan";
    protected placeHolderJellyfinId: string = "ex : gh0f55a6c3f269f79tc6d91fb55z3179"

    protected editSeries !: EditSeriesModel;
    protected editSeasons !: EditSeasonModel[];
    protected typeSelectionPosters !: SimpleModel[];
    protected buttonShowHome !: SimpleModel[];
    protected buttonHorizontalSameAsBack !: SimpleModel[];

    protected subscription: Subscription = new Subscription();
    protected subscriptionSearch !: Subscription;

    protected srcLanguage: string = './language/language.svg';
    protected displayOtherTitles: boolean = false;

    protected groupPosterHorizontalBack = 'groupPosterHorizontalBack';
    protected mediaType: MediaTypeModel = MediaTypeModel.SERIES;
    protected typeInfoDisplayed!: boolean;
    protected seasonIndexSelected: number = 0;

    protected maxLength: number = 1000;

    constructor(protected editionSeriesService: EditionSeriesService,
        protected tmdbOperationService: TmdbOperationService
    ) {
        super();
        this.typeSelectionPosters = this.editionSeriesService.getAllTypeSelectionPoster();
        this.typeInfoDisplayed = this.editionSeriesService.getTypeInfoDisplayed();
    }

    ngOnInit(): void {
        this.initSubscriptionOfEditSeries();
    }
    ngOnDestroy(): void {
        this.unsubscribeEditSeries();
        this.unsubscribeSearchSeries();
    }

    protected initSubscriptionOfEditSeries(): void {
        this.subscription.add(
            this.editionSeriesService.getEditSeries().subscribe((data: EditSeriesModel) => {
                this.editSeries = data;
            })
        )
        this.subscription.add(
            this.editionSeriesService.getEditSeasons().subscribe((data: EditSeasonModel[]) => {
                this.editSeasons = data;
            })
        )
        this.subscription.add(
            this.editionSeriesService.getRadioButtonHorizontalSameAsBack().subscribe((data: SimpleModel[]) => {
                this.buttonHorizontalSameAsBack = data;
            })
        )
    }

    protected unsubscribeEditSeries(): void {
        this.subscription.unsubscribe();
    }

    protected unsubscribeSearchSeries(): void {
        if (this.subscriptionSearch) {
            this.subscriptionSearch.unsubscribe();
        }
    }

    protected onInputTitle(newTitle: string | undefined): void {
        this.editionSeriesService.modifyTitleSeries(newTitle);
    }

    protected onInputJellyfinId(jellyfinId: string | undefined): void {
        this.editionSeriesService.modifyJellyfinId(jellyfinId);
    }

    protected onInputOtherTitles(titles: TranslationTitle[]): void {
        this.editionSeriesService.modifyOtherLanguageTitle(titles);
    }

    protected onInputDirector(newDirector: string[]): void {
        this.editionSeriesService.modifyDirectorSeries(newDirector);
    }

    protected onInputActors(actors: string[]): void {
        this.editionSeriesService.modifyActorsSeries(actors);
    }

    protected onInputCategory(categories: CategorySimpleModel[]): void {
        this.editionSeriesService.modifyCategories(categories);
    }

    protected onInputKeyWords(newKeyWords: string[]): void {
        this.editionSeriesService.modifyKeyWords(newKeyWords);
    }

    protected onInputDescription(newDescription: string | undefined): void {
        this.editionSeriesService.modifyDescription(newDescription);
    }

    protected onInputDate(date: Date): void {
        this.editionSeriesService.modifyDate(date);
    }

    protected onInputLogo(newLogo: string | ArrayBuffer | undefined | null): void {
        this.editionSeriesService.modifyLogo(newLogo);
    }

    protected onInputBackgroundImage(newBackgroundImage: string | ArrayBuffer | undefined | null): void {
        this.editionSeriesService.modifyBackgroundImage(newBackgroundImage);
    }

    protected addNewPoster(): void {
        this.editionSeriesService.addPoster();
    }

    protected deletePoster(id: number): void {
        this.editionSeriesService.removePoster(id)
    }

    protected addNewSelection(id: number): void {
        this.editionSeriesService.addNewSelectionInPoster(id);
    }

    protected removeSelection(id: number[]) {
        this.editionSeriesService.removeSelectionInPoster(id[0], id[1]);
    }

    public modifyStartShow(timerStart: string): void {
        this.editionSeriesService.modifyStartShow(timerStart);
    }

    public modifyEndShow(timerEnd: string): void {
        this.editionSeriesService.modifyEndShow(timerEnd);
    }

    protected onInputSelectionPoster(inputModif: EditTypePoster): void {
        if (inputModif.underId) {
            this.editionSeriesService.modifySelectionInPoster(inputModif.id, inputModif.underId, inputModif.type);
        }
    }

    protected fillPoster(info: any[]): void {
        this.editionSeriesService.fillPoster(info[0], info[1]);
    }

    protected toggleOtherTitleDisplayed(): void {
        this.displayOtherTitles = !this.displayOtherTitles;
    }

    protected addPosterHorizontal(): void {
        this.editionSeriesService.addPosterHorizontal();
    }

    protected removePosterHorizontal(id: number): void {
        this.editionSeriesService.removePosterHorizontal(id);
    }

    protected fillPosterHorizontal(infos: any[]): void {
        this.editionSeriesService.fillPosterHorizontal(infos[0], infos[1]);
    }

    protected modifyStateHorizontalPoster(id: number): void {
        this.editionSeriesService.modifyStateHorizontalPoster(id);
    }

    protected modifyTypeInfoDisplayed(state: boolean): void {
        this.editionSeriesService.modifyTypeInfoDisplayed(state);
        this.typeInfoDisplayed = state;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const clickedInside = this.otherTitlesRef?.nativeElement.contains(event.target);
        const clickedInside2 = this.buttonOtherLanguageRef?.nativeElement.contains(event.target);
        if (!clickedInside && !clickedInside2) {
            this.displayOtherTitles = false;
        }
    }

    protected addNewSeason(): void {
        this.editionSeriesService.addNewSeason();
    }
    protected deleteSeasonByIndex(seasonIdx: number): void {
        const index: number = this.editionSeriesService.deleteSeasonByIndex(seasonIdx, this.seasonIndexSelected);
        if (index >= 0) {
            this.seasonIndexSelected = index;
        }
    }
    protected addNewEpisode(seasonIdx: number): void {
        this.editionSeriesService.addNewEpisode(seasonIdx);
    }
    protected deleteEpisodeByIndex(seasonIdx: number, episodeIdx: number): void {
        this.editionSeriesService.deleteEpisodeByIndex(seasonIdx, episodeIdx);
    }

    protected changeSeasonIndexSelected(index: number): void {
        this.seasonIndexSelected = index;
    }

    protected modifyNameBySeasonIndex(idx: number, name: string): void {
        this.editionSeriesService.modifyNameBySeasonIndex(idx, name);
    }
    protected modifyJellyfinIdBySeasonIndex(idx: number, jellyfinId: string): void {
        this.editionSeriesService.modifyJellyfinIdBySeasonIndex(idx, jellyfinId);
    }
    protected modifyPosterBySeasonIndex(idx: number, poster: string | ArrayBuffer | undefined | null): void {
        this.editionSeriesService.modifyPosterBySeasonIndex(idx, poster);
    }

    protected modifyJellyfinIdEpisodeByIndex(seasonIdx: number, episodeIdx: number, jellyfinId: string): void {
        this.editionSeriesService.modifyJellyfinIdEpisodeByIndex(seasonIdx, episodeIdx, jellyfinId);
    }
    protected modifyPosterEpisodeByIndex(seasonIdx: number, episodeIdx: number, poster: string | ArrayBuffer | undefined | null): void {
        this.editionSeriesService.modifyPosterEpisodeByIndex(seasonIdx, episodeIdx, poster);
    }
    protected modifyTitleEpisodeByIndex(seasonIdx: number, episodeIdx: number, name: string): void {
        this.editionSeriesService.modifyTitleEpisodeByIndex(seasonIdx, episodeIdx, name);
    }
    protected modifyDescriptionEpisodeByIndex(seasonIdx: number, episodeIdx: number, description: string): void {
        this.editionSeriesService.modifyDescriptionEpisodeByIndex(seasonIdx, episodeIdx, description);
    }
    protected modifyDateEpisodeByIndex(seasonIdx: number, episodeIdx: number, date: Date): void {
        this.editionSeriesService.modifyDateEpisodeByIndex(seasonIdx, episodeIdx, date);
    }

    protected moveEpisodeToTop(seasonIdx: number, episodeIdx: number): void {
        this.editionSeriesService.moveEpisodeToTop(seasonIdx, episodeIdx);
    }
    protected moveEpisodeToBottom(seasonIdx: number, episodeIdx: number): void {
        this.editionSeriesService.moveEpisodeToBottom(seasonIdx, episodeIdx);
    }

    protected onClickButtonTmdb(): void {
        if (this.editSeries.title && this.editSeries.title.trim() !== '') {
            this.buttonSearchTmdb.changeLoadingActivate(true);
            this.unsubscribeSearchSeries();
            this.subscriptionSearch = this.tmdbOperationService.fetchSearchSeriesInfoByTmdbDataBase(this.editSeries.title, this.editSeries.id, this.editSeries).pipe(take(1), finalize(() => {
                this.buttonSearchTmdb.changeLoadingActivate(false);
            })).subscribe({
                next: (data: EditSeriesModel) => {
                    this.editionSeriesService.updateSeasons(data.seasons);
                    data.seasons = [];
                    this.editionSeriesService.updateSeries(data);
                }
            })
        }
    }

    protected onClickButtonJellyfin(modifyMetaData: boolean): void {
        if (this.editSeries.jellyfinId && this.editSeries.jellyfinId.trim() !== '') {
            this.buttonSearchJellyfin.changeLoadingActivate(true);
            this.unsubscribeSearchSeries();
            this.subscriptionSearch = this.tmdbOperationService.fetchSearchSeriesInfoByJellyfin(this.editSeries.jellyfinId, this.editSeries.id, this.editSeries, this.editSeasons, modifyMetaData).pipe(take(1), finalize(() => {
                this.buttonSearchJellyfin.changeLoadingActivate(false);
            })).subscribe({
                next: (data: EditSeriesModel) => {
                    this.editionSeriesService.updateSeasons(data.seasons);
                    data.seasons = [];
                    this.editionSeriesService.updateSeries(data);
                }
            })
        }
    }

}