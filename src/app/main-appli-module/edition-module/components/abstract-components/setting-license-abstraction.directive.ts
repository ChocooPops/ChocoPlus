import { Directive } from "@angular/core";
import { EditionLicenseService } from "../../services/edition-license/edition-license.service";
import { LicenseModel } from "../../../license-module/model/license.interface";
import { SimpleModel } from "../../../../common-module/models/simple-model";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { Subscription, take } from "rxjs";
import { MediaModel } from "../../../media-module/models/media.interface";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { SelectionService } from "../../../media-module/services/selection/selection.service";

@Directive({})
export abstract class SettingLicenseAbstraction extends UnauthorizedError {

    editLicense !: LicenseModel;
    radioButtonLocationLicense !: SimpleModel[];
    mediasIntoLicense: SelectionModel[] = [];
    allSelectionsIntoLicense: SelectionModel[] = [];

    placeHolderInputText: string = 'ex : Studio Ghibli';
    placeHolderInputButton: string = 'ex : Image illustrant le Studio Ghibli';
    placeHolderInputBack: string = 'ex : Plan culte du Studio Ghibli';
    placeHolderInputLogo: string = 'ex : Logo du Studio Ghibli';
    subscription: Subscription = new Subscription;

    constructor(protected editionLicenseService: EditionLicenseService,
        private selectionService: SelectionService
    ) {
        super();
    }

    ngOnInit(): void {
        this.initEditLicenseWithRadioButton();
    }

    ngOnDestroy(): void {
        this.unsubscribeEditLicence();
    }

    protected initEditLicenseWithRadioButton(): void {
        this.subscription.add(
            this.editionLicenseService.getLicenseEdition().subscribe((data: LicenseModel) => {
                if (this.editLicense && (this.editLicense.name !== data.name || this.editLicense.selectionList !== data.selectionList)) {
                    this.allSelectionsIntoLicense = this.getFormatAllMediaSelectionList(data);
                }
                this.editLicense = data;
            })
        )
        this.subscription.add(
            this.editionLicenseService.getMediasIntoLicense().subscribe((data: SelectionModel) => {
                this.mediasIntoLicense = this.getFormatMediaSelectionInTab(data);
            })
        )
        this.subscription.add(
            this.editionLicenseService.getRadiouttonLocatioonLicense().subscribe((data: SimpleModel[]) => {
                this.radioButtonLocationLicense = data;
            })
        )
    }

    protected unsubscribeEditLicence(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    protected modifyLicensePosition(id: number): void {
        this.editionLicenseService.modifyLicensePosition(id);
    }

    protected modifyNameLicense(name: string) {
        this.editionLicenseService.modifyNameSelection(name);
    }

    protected addMediaIntoSelection(newMedia: MediaModel): void {
        this.editionLicenseService.addMediaIntoSelection(newMedia);
    }

    protected moveMediaLeft(mediaId: number): void {
        this.editionLicenseService.moveMediaOnTheLeftOfSelection(mediaId);
    }

    protected moveMediaRight(mediaId: number): void {
        this.editionLicenseService.moveMediaOnTheRightOfSelection(mediaId);
    }

    protected removeMedia(mediaId: number): void {
        this.editionLicenseService.removeMediaFromSelection(mediaId);
    }

    protected moveSelectionBottom(id: number): void {
        this.editionLicenseService.moveSelectionOnTheBottomOfLicense(id);
    }

    protected moveSelectionTop(id: number): void {
        this.editionLicenseService.moveSelectionOnTheTopOfLicense(id);
    }

    protected removeSelection(id: number): void {
        this.editionLicenseService.removeSelectionFromLicense(id);
    }

    protected addMediaSelection(movieSelection: SelectionModel): void {
        this.selectionService.fetchSelectionById(movieSelection.id).pipe(take(1)).subscribe((selection: SelectionModel) => {
            this.editionLicenseService.addMediaSelectionIntoLicense(selection);
        });
    }

    public onModifyImageLicense(newImage: string | ArrayBuffer | undefined | null): void {
        this.editionLicenseService.modifyImageLicense(newImage);
    }

    public onModifyLogoLicense(newLogo: string | ArrayBuffer | undefined | null): void {
        this.editionLicenseService.modifyLogoLicense(newLogo);
    }

    public onModifyBackgroundImageLicense(newBackImage: string | ArrayBuffer | undefined | null): void {
        this.editionLicenseService.modifyBackgroundImageLicense(newBackImage);
    }

    protected getFormatMediaSelectionInTab(selection: SelectionModel): SelectionModel[] {
        return [selection];
    }

    protected getFormatAllMediaSelectionList(license: LicenseModel): SelectionModel[] {
        const selections: SelectionModel[] = [];
        license.selectionList?.forEach((item) => {
            selections.push(item)
        })
        return selections;
    }

}