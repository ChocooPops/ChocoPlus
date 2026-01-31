import { Directive, ElementRef, EventEmitter } from "@angular/core";
import { Output, HostListener } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { SelectionModel } from "../../../media-module/models/selection.interface";
import { LicenseModel } from "../../../license-module/model/license.interface";
import { CategorySimpleModel } from "../../models/category/categorySimple.model";
import { MovieModel } from "../../../media-module/models/movie-model";
import { SeriesModel } from "../../../media-module/models/series/series.interface";

@Directive({})
export abstract class InputResearchAbstract<T extends MovieModel | SeriesModel | SelectionModel | LicenseModel | CategorySimpleModel> {

    @Output() addContentResearched = new EventEmitter<T>;
    protected contentWanted: T[] = [];

    protected displayContentWanted: boolean = false;
    protected formGroup !: FormGroup;
    protected placeHolder!: string;
    protected srcImageresearch: string = 'icon/research.svg';
    protected typeFocus: boolean = false;

    ngOnInit(): void {
        this.setFormGroup('');
    }

    constructor(protected fb: FormBuilder,
        protected elementRef: ElementRef
    ) { }

    setFormGroup(text: string): void {
        this.formGroup = this.fb.group({
            inputValue: [text]
        });

        this.formGroup.get('inputValue')?.valueChanges.subscribe(value => {
            if (this.typeFocus) {
                this.displayContentWanted = true;
                this.startResearch();
            } else {
                if (value != '') {
                    this.displayContentWanted = true;
                    this.startResearch();
                } else {
                    this.displayContentWanted = false;
                    this.contentWanted = [];
                }
            }
        })
    }

    protected abstract startResearch(): void;

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInside) {
            this.displayContentWanted = false;
        }
    }

    onClickOnContentWanted(content: T) {
        this.addContentResearched.emit(content);
        this.setFormGroup('');
        this.displayContentWanted = false;
        this.contentWanted = [];
    }

    onEnterKey(): void {
        if (this.contentWanted.length != 0) {
            this.onClickOnContentWanted(this.contentWanted[0]);
        }
    }

    protected getValueInput(): string {
        return this.formGroup.get('inputValue')?.value || '';
    }

    protected onFocusWithHollowContent(): void {
        if (this.contentWanted.length > 0) {
            this.displayContentWanted = true;
        }
    }

    protected onFocus(): void {
        this.displayContentWanted = true;
        return this.startResearch();
    }
}