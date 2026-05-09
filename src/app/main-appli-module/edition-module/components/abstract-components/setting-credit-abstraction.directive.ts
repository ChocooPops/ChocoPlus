import { Directive, ViewChild } from "@angular/core";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { EditCreditModel } from "../../models/edit-credit.interface";
import { finalize, Subscription, take } from "rxjs";
import { CreditService } from "../../../media-module/services/credit/credit.service";
import { TmdbOperationService } from "../../services/tmdb-operation/tmdb-operation.service";
import { AiButtonComponent } from "../ai-button/ai-button.component";
import { EditionParametersService } from "../../services/edition-parameters/edition-parameters.service";

@Directive({})
export abstract class SettingCreditAbstraction extends UnauthorizedError {

    @ViewChild('buttonSearchTmdbId') buttonSearchTmdbId !: AiButtonComponent;
    @ViewChild('buttonSearchFullName') buttonSearchFullName !: AiButtonComponent;

    protected placeholderTextTmdbId = 'EDITION.PLACEHOLDER_TMDB';
    protected placeholderTextFullName = 'EDITION.CREDIT.PLACEHOLDER_FULLNAME';
    protected placeholderTextOriginalFullName = 'EDITION.CREDIT.PLACEHOLDER_ORIGINAL_FULLNAME';
    protected exTextPoster = 'EDITION.CREDIT.PLACEHOLDER_POSTER';
    protected editCredit!: EditCreditModel;

    protected subscriptionMain: Subscription = new Subscription();
    protected subscriptionSearch: Subscription = new Subscription();

    constructor(protected readonly creditService: CreditService,
        protected readonly tmdbOperationService: TmdbOperationService,
        editionParametersService: EditionParametersService
    ) { 
        super(editionParametersService);
    }

    ngOnInit(): void {
        this.initSubscriptionOfEditCredit();
    }

    ngOnDestroy(): void {
        this.unsubscribeAllSubscription();
    }

    protected initSubscriptionOfEditCredit(): void {
        this.subscriptionMain.add(
            this.creditService.getEditCredit().subscribe((data: EditCreditModel) => {
                this.editCredit = data;
            })
        )
    }

    protected unsubscribeAllSubscription(): void {
        if (this.subscriptionMain) {
            this.subscriptionMain.unsubscribe();
        }
        this.unsubscribeSubscriptionSearch();
    }

    private unsubscribeSubscriptionSearch(): void {
       if (this.subscriptionSearch) {
            this.subscriptionSearch.unsubscribe();
        }
    }

    protected onInputTmdbId(tmdbId: number): void {
        this.creditService.modifyTmdbId(tmdbId);
    }

    protected onInputFullName(fullName: string): void {
        this.creditService.modifyFullName(fullName);
    }

    protected onInputOriginalFullName(originalFullName: string): void {
        this.creditService.modifyOriginalFullName(originalFullName);
    }

    protected onInputSrcPoster(srcPoster: string | ArrayBuffer | undefined | null): void {
        this.creditService.modifySrcPoster(srcPoster);
    }

    protected onClickButtonTmdbById(): void {
        if (this.editCredit.tmdbId && this.editCredit.tmdbId > 0) {
            this.buttonSearchTmdbId.changeLoadingActivate(true);
            this.unsubscribeSubscriptionSearch();
            this.subscriptionSearch = this.tmdbOperationService.fetchSearchCreditByTmdbId(this.editCredit.tmdbId, this.editCredit).pipe(take(1), finalize(() => {
                this.buttonSearchTmdbId.changeLoadingActivate(false);
            })).subscribe({
                next: (data: EditCreditModel) => {
                    this.creditService.updateCredit(data);
                }
            }) 
        }
    }

    protected onClickButtonTmdbByFullName(): void {
        if (this.editCredit.fullName && this.editCredit.fullName.trim() !== '') {
            this.buttonSearchFullName.changeLoadingActivate(true);
            this.unsubscribeSubscriptionSearch();
            this.subscriptionSearch = this.tmdbOperationService.fetchSearchCreditByFullName(this.editCredit.fullName, this.editCredit).pipe(take(1), finalize(() => {
                this.buttonSearchFullName.changeLoadingActivate(false);
            })).subscribe({
                next: (data: EditCreditModel) => {
                    this.creditService.updateCredit(data);
                }
            }) 
        }
    }

}