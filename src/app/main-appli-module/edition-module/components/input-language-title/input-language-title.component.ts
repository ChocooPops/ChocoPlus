import { Component, EventEmitter, Input, Output, HostListener, SimpleChanges, ElementRef } from '@angular/core';
import { TranslationTitle } from '../../models/translation-title.interface';
import { ButtonAddComponent } from '../button-add/button-add.component';
import { ISO_3166_1 } from '../../models/iso-3166-1.enum';

@Component({
  selector: 'app-input-language-title',
  standalone: true,
  imports: [ButtonAddComponent],
  templateUrl: './input-language-title.component.html',
  styleUrl: './input-language-title.component.css'
})
export class InputLanguageTitleComponent {

  @Input() titles: TranslationTitle[] = [];
  @Output() changeTitles = new EventEmitter<TranslationTitle[]>();

  srcImages: { [iso: string]: string } = {};
  displayLanguageChoice: { [iso: string]: boolean } = {};
  isoTab: ISO_3166_1[] = [ISO_3166_1.FR, ISO_3166_1.US, ISO_3166_1.ES, ISO_3166_1.DE, ISO_3166_1.IT, ISO_3166_1.RU, ISO_3166_1.PT, ISO_3166_1.CN, ISO_3166_1.JP, ISO_3166_1.KR, ISO_3166_1.VO]
  isoAvailable: ISO_3166_1[] = [];
  srcDelete: string = './icon/delete.svg';

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['titles']) {
      this.setIsoAvailable();
    }
  }

  ngOnInit(): void {
    this.isoTab.forEach((iso: ISO_3166_1) => {
      this.srcImages[iso] = `./language/${iso}.png`;
    });
    this.setDisplayingLanguageChoice(false);
    this.setIsoAvailable();
  }

  onClickLanguage(currentIso: ISO_3166_1, event: Event): void {
    event.stopPropagation();
    this.setDisplayingLanguageChoice(false);
    this.displayLanguageChoice[currentIso] = true;
  }

  onClickContainer(): void {
    this.setDisplayingLanguageChoice(false);
  }

  addNewTitle(): void {
    if (this.isoAvailable.length > 0) {
      this.titles.push({
        title: '',
        iso_639_1: this.isoAvailable[0]
      })
    }
    this.changeTitles.emit(this.titles);
    this.setIsoAvailable();
  }

  onBlur(iso: ISO_3166_1, text: string): void {
    const index: number = this.titles.findIndex(title => title.iso_639_1 === iso);
    if (index >= 0) {
      this.titles[index].title = text;
    }
    this.changeTitles.emit(this.titles);
  }

  changeLanguage(oldIso: ISO_3166_1, newIso: ISO_3166_1): void {
    const index: number = this.titles.findIndex(title => title.iso_639_1 === oldIso);
    if (index >= 0) {
      this.titles[index].iso_639_1 = newIso;
      this.displayLanguageChoice[oldIso] = false;
      this.displayLanguageChoice[newIso] = false;
    }
    this.changeTitles.emit(this.titles);
    this.setIsoAvailable();
  }

  deleteTitle(iso: ISO_3166_1): void {
    this.titles = this.titles.filter(title => title.iso_639_1 !== iso);
    this.displayLanguageChoice[iso] = false;
    this.changeTitles.emit(this.titles);
    this.setIsoAvailable();
  }

  private setDisplayingLanguageChoice(state: boolean): void {
    this.isoTab.forEach((iso: ISO_3166_1) => {
      this.displayLanguageChoice[iso] = state;
    })
  }

  private setIsoAvailable(): void {
    this.isoAvailable = this.isoTab.filter(x => !this.titles.map(title => title.iso_639_1).includes(x));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.setDisplayingLanguageChoice(false);
    }
  }

}
