import { Component, ElementRef, EventEmitter, Output, ViewChild, HostListener } from '@angular/core';
import { Library } from '../../../models/library/library.interface';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { ISO_3166_1 } from '../../../models/iso-3166-1.enum';
import { FormsModule } from '@angular/forms';
import { ElectronService } from '../../../../../common-module/services/electron/electron.service';
import { LibraryService } from '../../../services/library/library.service';
import { PopupComponent } from '../../popup/popup.component';
import { UnauthorizedError } from '../../abstract-components/unauthorized-error-abstract.directive';
import { EditionParametersService } from '../../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { Subscription, take } from 'rxjs';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { StateLibrary } from '../../../models/library/state-library.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-new-library',
  standalone: true,
  imports: [FormsModule, PopupComponent, TranslatePipe],
  templateUrl: './new-library.component.html',
  styleUrl: './new-library.component.css'
})
export class NewLibraryComponent extends UnauthorizedError {

  protected override menuType: MenuType = MenuType.LIBRARY;
  private message = 'EDITION.LIBRARY.MESSAGE_ADD_LIBRARY';
  private librairie!: Library | null;

  private subscription!: Subscription;

  @Output() submitted = new EventEmitter<Library>();
  @Output() cancelled = new EventEmitter<void>();
 
  @ViewChild('form') form!: ElementRef;
  @ViewChild('selectTypeMedia') selectTypeMedia!: ElementRef;
  @ViewChild('selectLanguage') selectLanguage!: ElementRef;

  constructor(private readonly electronService: ElectronService,
    private readonly libraryService: LibraryService,
    editionParametersService: EditionParametersService
  ) { 
    super(editionParametersService);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    const clickedInside = this.form?.nativeElement.contains(target);
    if (!clickedInside) {
      this.cancel();
    } else {
      const clickInsideMedia = this.selectTypeMedia?.nativeElement.contains(target);
      const clickInsideLang = this.selectLanguage?.nativeElement.contains(target);
      if (!clickInsideLang) {
        this.langOpen = false;
      }
      if (!clickInsideMedia) {
        this.mediaTypeOpen = false;
      }
    }
  }

  readonly MediaType = MediaTypeModel;
  readonly ISO_3166_1 = ISO_3166_1;
 
  readonly mediaTypeOptions = [
    { value: MediaTypeModel.MOVIE,  label: 'MOVIES'  },
    { value: MediaTypeModel.SERIES, label: 'SERIES' },
  ];
 
  readonly langOptions: { value: ISO_3166_1; label: string; flag: string }[] = [
    { value: ISO_3166_1.FR, label: 'FRENCH',          flag: '🇫🇷' },
    { value: ISO_3166_1.US, label: 'ENGLISH',         flag: '🇺🇸' },
    { value: ISO_3166_1.GB, label: 'ENGLISH',         flag: '🇬🇧' },
    { value: ISO_3166_1.ES, label: 'SPANISH',         flag: '🇪🇸' },
    { value: ISO_3166_1.DE, label: 'GERMAN',          flag: '🇩🇪' },
    { value: ISO_3166_1.IT, label: 'ITALIAN',         flag: '🇮🇹' },
    { value: ISO_3166_1.JP, label: 'JAPANESE',        flag: '🇯🇵' },
    { value: ISO_3166_1.RU, label: 'RUSSIAN',         flag: '🇷🇺' },
    { value: ISO_3166_1.KR, label: 'KOREAN',          flag: '🇰🇷' },
    { value: ISO_3166_1.CN, label: 'CHINESE',         flag: '🇨🇳' },
    { value: ISO_3166_1.PT, label: 'PORTUGUESE',      flag: '🇵🇹' },
  ];
 
  path: string = '';
  mediaType: MediaTypeModel | null = null;
  lang: ISO_3166_1 | null = null;
 
  mediaTypeOpen = false;
  langOpen = false;
 
  get isValid(): boolean {
    return this.path.trim().length > 0
      && this.mediaType !== null
      && this.lang !== null;
  }
 
  get selectedMediaLabel(): string {
    return this.mediaTypeOptions.find(o => o.value === this.mediaType)?.label ?? 'EDITION.LIBRARY.SELECT...';
  }
 
  get selectedLangOption() {
    return this.langOptions.find(o => o.value === this.lang) ?? null;
  }
 
  selectMediaType(value: MediaTypeModel): void {
    this.mediaType = value;
    this.mediaTypeOpen = false;
  }
 
  selectLang(value: ISO_3166_1): void {
    this.lang = value;
    this.langOpen = false;
  }
 
  toggleMediaType(): void {
    this.mediaTypeOpen = !this.mediaTypeOpen;
    //if (this.mediaTypeOpen) this.langOpen = false;
  }
 
  toggleLang(): void {
    this.langOpen = !this.langOpen;
    //if (this.langOpen) this.mediaTypeOpen = false;
  }
 
  submit(): void {
    if (!this.isValid) return;
    this.librairie = {
      id: '-1',
      path: this.path.trim(),
      mediaType: this.mediaType!,
      lang: this.lang!,
      state: StateLibrary.NOT_WORKED
    }
    this.popup.setMessage(this.message, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
  }
 
  cancel(): void {
    this.reset();
    this.cancelled.emit();
  }
 
  private reset(): void {
    this.librairie = null;
    this.path = '';
    this.mediaType = null;
    this.lang = null;
    this.mediaTypeOpen = false;
    this.langOpen = false;
  }

  async onBrowse(): Promise<void> {
    const path = await this.electronService.openFileDialog();
    if (path.length > 0) {
      this.path = path[0];
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  emitAction(): void {
    if (this.librairie) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.subscription = this.libraryService.fetchCreateNewLibrary(this.librairie).pipe(take(1)).subscribe({
        next: (data: MessageReturnedModel) => {
          this.popup.setMessage(data.message, data.state);
          this.popup.setEndTask(true);
          this.popup.setDisplayButton(false);
          this.displayLoader = false;
        },
        error: (error: HttpErrorResponse) => {
          this.displayPopupOnError(error, 1);
        },
      })
    }
  }

}
