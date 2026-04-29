import { Directive, ViewChild } from "@angular/core";
import { UnauthorizedError } from "./unauthorized-error-abstract.directive";
import { EditCreditModel } from "../../models/edit-credit.interface";
import { Subscription } from "rxjs";
import { CreditService } from "../../../media-module/services/credit/credit.service";
import { TmdbOperationService } from "../../services/tmdb-operation/tmdb-operation.service";
import { AiButtonComponent } from "../ai-button/ai-button.component";

@Directive({})
export abstract class SettingCreditAbstraction extends UnauthorizedError {

    @ViewChild('buttonSearchTmdbId') buttonSearchTmdbId !: AiButtonComponent;
    @ViewChild('buttonSearchFullName') buttonSearchFullName !: AiButtonComponent;

    protected placeholderTextTmdbId: string = 'ex: 8596';
    protected placeholderTextFullName: string = 'ex: Hiroshi Kamiya';
    protected placeholderTextOriginalFullName: string = 'ex: 神谷浩史';
    protected exTextPoster: string = 'ex: Photo de Bryan Cranston';
    protected editCredit!: EditCreditModel;

    protected subscriptionMain: Subscription = new Subscription();
    protected subscriptionCreditSearch: Subscription = new Subscription();

    constructor(protected readonly creditService: CreditService,
        protected readonly tmdbOperationService: TmdbOperationService
    ) { 
        super();
    }

    ngOnInit(): void {
        this.initSubscriptionOfEditMovie();
    }

    ngOnDestroy(): void {
        this.unsubscribeAllSubscription();
    }

    protected initSubscriptionOfEditMovie(): void {
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
        if (this.subscriptionCreditSearch) {
            this.subscriptionCreditSearch.unsubscribe();
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

    }

    protected onClickButtonTmdbByFullName(): void {

    }

}