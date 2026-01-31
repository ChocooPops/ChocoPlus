import { Directive } from "@angular/core";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { Subscription, take } from "rxjs";
import { EditionSelectionPageService } from "../../services/edition-selection-page/edition-selection-page.service";
import { SelectionService } from "../../../media-module/services/selection/selection.service";

@Directive({})
export abstract class SettingSelectionPageAbstract extends UnauthorizedError {

    protected selections: SelectionModel[] | undefined = undefined;
    protected subscription: Subscription = new Subscription();

    constructor(protected editionSelectionPageService: EditionSelectionPageService,
        protected selectionService: SelectionService
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscription.add(
            this.editionSelectionPageService.getSelectionPage().subscribe((data: SelectionModel[] | undefined) => {
                this.selections = data;
            })
        );
        this.loadSelectionByPage();
    }

    abstract loadSelectionByPage(): void;

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.editionSelectionPageService.resetEditSelectionPage();
    }

    protected addSelectionIntoPage(selection: SelectionModel): void {
        this.selectionService.fetchSelectionById(selection.id).pipe(take(1)).subscribe((selection: SelectionModel) => {
            this.editionSelectionPageService.addNewSelectionIntoPage(selection);
        });
    }

    protected removeSelectionIntoPage(id: number): void {
        this.editionSelectionPageService.removeSelectionIntoPage(id)
    }

    protected moveSelectionOnTheTopOfPage(id: number): void {
        this.editionSelectionPageService.moveSelectionOnTheTopOfPage(id);
    }

    protected moveSelectionOnTheBottomOfPage(id: number): void {
        this.editionSelectionPageService.moveSelectionOnTheBottomOfPage(id);
    }

}