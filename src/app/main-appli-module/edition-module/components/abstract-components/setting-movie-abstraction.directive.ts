import { Directive, ViewChild, ElementRef, HostListener } from "@angular/core";
import { SimpleModel } from "../../../../common-module/models/simple-model";
import { EditionMovieService } from "../../services/edition-movie/edition-movie.service";
import { Subscription } from "rxjs";
import { CategorySimpleModel } from "../../models/category/categorySimple.model";
import { AiButtonComponent } from "../ai-button/ai-button.component";
import { TranslationTitle } from "../../models/translation-title.interface";
import { EditTypePoster } from "../../models/edit-type-movie.interface";
import { TmdbOperationService } from "../../services/tmdb-operation/tmdb-operation.service";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { EditMovieModel } from "../../models/edit-movie.interface";
import { MediaTypeModel } from "../../../media-module/models/media-type.enum";
import { MediaCreditModel } from "../../../media-module/models/media-credit.interface";
import { EditionParametersService } from "../../services/edition-parameters/edition-parameters.service";

@Directive({})
export abstract class SettingMovieAbstraction extends UnauthorizedError {

    @ViewChild('buttonSearchTmdb') buttonSearchTmdb !: AiButtonComponent;
    @ViewChild('buttonSearchMediaLibrary') buttonSearchMediaLibrary !: AiButtonComponent;
    @ViewChild('otherTitles') otherTitlesRef!: ElementRef;
    @ViewChild('buttonOtherLanguage') buttonOtherLanguageRef!: ElementRef;

    protected exTextLogo: string = "EDITION.MOVIE.PLACEHOLDER_LOGO";
    protected exTestBackgroundImage: string = "EDITION.MOVIE.PLACEHOLDER_BACK";
    protected placeHolderTitle: string = "EDITION.MOVIE.PLACEHOLDER_TITLE";
    protected placeHolderMediaLibraryId: string = "EDITION.MOVIE.PLACEHOLDER_MEDIA_LIBRARY";

    protected editMovie !: EditMovieModel;
    protected typeSelectionPosters !: SimpleModel[];
    protected buttonShowHome !: SimpleModel[];
    protected buttonHorizontalSameAsBack !: SimpleModel[];
    protected subscription: Subscription = new Subscription();

    protected groupShowHome: string = 'groupShowHome';
    protected groupPosterHorizontalBack = 'groupPosterHorizontalBack';

    protected srcLanguage: string = './language/language.svg';
    protected displayOtherTitles: boolean = false;

    protected subscriptionSearch !: Subscription;
    protected mediaType: MediaTypeModel = MediaTypeModel.MOVIE;
    protected maxLenght: number = 1000;

    constructor(protected readonly editionMovieService: EditionMovieService,
        protected readonly tmdbOperationService: TmdbOperationService,
        editionParametersService: EditionParametersService
    ) {
        super(editionParametersService);
        this.typeSelectionPosters = this.editionMovieService.getAllTypeSelectionPoster();
    }

    ngOnInit(): void {
        this.initSubscriptionOfEditMovie();
    }

    ngOnDestroy(): void {
        this.unsubscribeEditMovie();
        this.unsubscribeSearchMovie();
    }

    protected initSubscriptionOfEditMovie(): void {
        this.subscription.add(
            this.editionMovieService.getEditMovie().subscribe((data: EditMovieModel) => {
                this.editMovie = data;
            })
        )
        this.subscription.add(
            this.editionMovieService.getRadioButtonHorizontalSameAsBack().subscribe((data: SimpleModel[]) => {
                this.buttonHorizontalSameAsBack = data;
            })
        )
    }

    protected unsubscribeEditMovie(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected unsubscribeSearchMovie(): void {
        if (this.subscriptionSearch) {
            this.subscriptionSearch.unsubscribe();
        }
    }

    protected onInputTimerStart(timerStart: string): void {
        this.editionMovieService.modifyStartShow(timerStart);
    }

    protected onInputTimerEnd(timerEnd: string): void {
        this.editionMovieService.modifyEndShow(timerEnd);
    }

    protected onInputDate(newDate: Date): void {
        this.editionMovieService.modifyDate(newDate);
    }

    protected onInputTitle(newTitle: string | undefined): void {
        this.editionMovieService.modifyTitleMovie(newTitle);
    }

    protected onInputMediaLibraryId(mediaLibraryId: string | undefined): void {
        this.editionMovieService.modifyMediaLibraryId(mediaLibraryId);
    }

    protected onInputOtherTitles(titles: TranslationTitle[]): void {
        this.editionMovieService.modifyOtherLanguageTitle(titles);
    }

    protected onInputCredits(credits: MediaCreditModel[]): void {
        this.editionMovieService.modifyCredits(credits);
    }

    protected onInputCategory(categories: CategorySimpleModel[]): void {
        this.editionMovieService.modifyCategories(categories);
    }

    protected onInputKeyWords(newKeyWords: string[]): void {
        this.editionMovieService.modifyKeyWords(newKeyWords);
    }

    protected onInputDescription(newDescription: string | undefined): void {
        this.editionMovieService.modifyDescription(newDescription);
    }

    protected onInputLogo(newLogo: string | ArrayBuffer | undefined | null): void {
        this.editionMovieService.modifyLogoMovie(newLogo);
    }

    protected onInputBackgroundImage(newBackgroundImage: string | ArrayBuffer | undefined | null): void {
        this.editionMovieService.modifyBackgroundImageMovie(newBackgroundImage);
    }

    protected addNewPoster(): void {
        this.editionMovieService.addPoster();
    }

    protected deletePoster(id: number): void {
        this.editionMovieService.removePoster(id)
    }

    protected addNewSelection(id: number): void {
        this.editionMovieService.addNewSelectionInPoster(id);
    }

    protected removeSelection(id: number[]) {
        this.editionMovieService.removeSelectionInPoster(id[0], id[1]);
    }

    protected onInputSelectionPoster(inputModif: EditTypePoster): void {
        if (inputModif.underId) {
            this.editionMovieService.modifySelectionInPoster(inputModif.id, inputModif.underId, inputModif.type);
        }
    }

    protected fillPoster(info: any[]): void {
        this.editionMovieService.fillPoster(info[0], info[1]);
    }

    protected toggleOtherTitleDisplayed(): void {
        this.displayOtherTitles = !this.displayOtherTitles;
    }

    protected addPosterHorizontal(): void {
        this.editionMovieService.addPosterHorizontal();
    }

    protected removePosterHorizontal(id: number): void {
        this.editionMovieService.removePosterHorizontal(id);
    }

    protected fillPosterHorizontal(infos: any[]): void {
        this.editionMovieService.fillPosterHorizontal(infos[0], infos[1]);
    }

    protected modifyStateHorizontalPoster(id: number): void {
        this.editionMovieService.modifyStateHorizontalPoster(id);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const clickedInside = this.otherTitlesRef?.nativeElement.contains(event.target);
        const clickedInside2 = this.buttonOtherLanguageRef?.nativeElement.contains(event.target);
        if (!clickedInside && !clickedInside2) {
            this.displayOtherTitles = false;
        }
    }
}