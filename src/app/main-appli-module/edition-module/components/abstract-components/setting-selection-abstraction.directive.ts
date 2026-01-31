import { Directive, ViewChild } from "@angular/core";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { SimpleModel } from "../../../../common-module/models/simple-model";
import { MediaModel } from "../../../media-module/models/media.interface";
import { Subscription } from "rxjs";
import { AiButtonComponent } from "../ai-button/ai-button.component";
import { EditionSelectionService } from "../../services/edition-selection/edition-selection.service";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";

@Directive()
export abstract class SettingSelectionAbstraction extends UnauthorizedError {

    @ViewChild(AiButtonComponent) aiButton !: AiButtonComponent;

    placeHolderNameSelection: string = "ex : Sélection spéciale sur les Polars";
    radioButtonTypeSelection: SimpleModel[] = [];
    groupTypeSelection: string = "groupTypeSelection";
    groupPosition: string = "groupPosition";
    editSelection !: SelectionModel;
    selectionTabFormated: SelectionModel[] = [];

    protected subscription: Subscription = new Subscription();

    constructor(protected editionSelectionService: EditionSelectionService) {
        super();
    }

    ngOnInit(): void {
        this.initEditSelectionWithRadioButton();
    }

    ngOnDestroy(): void {
        this.unsubscribeEditSelection();
    }

    protected initEditSelectionWithRadioButton(): void {
        this.subscription.add(
            this.editionSelectionService.getSelectionEdition().subscribe((data: SelectionModel) => {
                this.editSelection = data;
                this.selectionTabFormated = this.getFormatMediaSelectionInTab(data);
            })
        );
        this.subscription.add(
            this.editionSelectionService.getRadioButtonTypeSelection().subscribe((data: SimpleModel[]) => {
                this.radioButtonTypeSelection = data;
            })
        )
    }

    protected unsubscribeEditSelection(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected changeSelectionName(selectionName: string): void {
        this.editionSelectionService.modifySelectionName(selectionName);
    }

    protected changeTypeSelection(id: number): void {
        this.editionSelectionService.modifyTypeSelection(id);
    }

    protected addMediaIntoSelection(newMedia: MediaModel): void {
        this.editionSelectionService.addMediaIntoSelection(newMedia);
    }

    protected moveMediaLeft(mediaId: number): void {
        this.editionSelectionService.moveMediaOnTheLeftOfSelection(mediaId);
    }

    protected moveMediaRight(mediaId: number): void {
        this.editionSelectionService.moveMediaOnTheRightOfSelection(mediaId);
    }

    protected removeMedia(mediaId: number): void {
        this.editionSelectionService.removeMediaFromSelection(mediaId);
    }

    protected getFormatMediaSelectionInTab(selection: SelectionModel): SelectionModel[] {
        return [selection];
    }

}