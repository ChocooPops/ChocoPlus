import { Component } from '@angular/core';
import { UnauthorizedError } from '../../abstract-components/unauthorized-error-abstract.directive';
import { EditionParametersService } from '../../../services/edition-parameters/edition-parameters.service';
import { MenuType } from '../../../../menu-module/model/menu-type.enum';
import { LibraryService } from '../../../services/library/library.service';
import { PopupComponent } from '../../popup/popup.component';
import { NewLibraryComponent } from '../new-library/new-library.component';
import { Subscription, take } from 'rxjs';
import { Library } from '../../../models/library/library.interface';
import { LibraryComponent } from '../library/library.component';
import { ButtonAddComponent } from '../../button-add/button-add.component';
import { MessageReturnedModel } from '../../../../../common-module/models/message-returned.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MediaLibrary } from '../../../models/library/media-library.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { StateLibrary } from '../../../models/library/state-library.enum';
import { MovieLibraryTabComponent } from '../movie-library-tab/movie-library-tab.component';
import { MediaTypeModel } from '../../../../media-module/models/media-type.enum';
import { SeriesLibraryTabComponent } from '../series-library-tab/series-library-tab.component';

@Component({
  selector: 'app-setting-edit-library',
  standalone: true,
  imports: [PopupComponent, SeriesLibraryTabComponent, TranslatePipe, NewLibraryComponent, LibraryComponent, ButtonAddComponent, MovieLibraryTabComponent],
  templateUrl: './setting-edit-library.component.html',
  styleUrls: ['./setting-edit-library.component.css', '../../../../../common-module/styles/loader.css', '../../../styles/edition.css', '../../../../common-module/styles/animation.css']
})
export class SettingEditLibraryComponent extends UnauthorizedError {

  private messageDelete = "EDITION.LIBRARY.MESSAGE_DELETE";

  protected override menuType: MenuType = MenuType.LIBRARY;
  
  private subscription: Subscription = new Subscription();
  private subscriptionLoadLibrary!: Subscription;
  private subscriptionLoadMediaLibraries!: Subscription;

  public libraries: Library[] = [];
  public mediaLibraries: MediaLibrary[] | null = null;
  public librarySelected: Library | null = null;

  displayFormNewLibrary: boolean = false;
  srcReset: string = 'icon/modify.svg';
  idSelectedForDeleting: string | null = null;
  displayLoaderMediaLibraries: boolean = false;

  StateLibrary = StateLibrary;
  MediaType = MediaTypeModel;

  constructor(editionParametersService: EditionParametersService,
    private readonly libraryService: LibraryService
  ) {
    super(editionParametersService);
    this.toggleUnderParameter();
    this.displayLoader = true;
  }

  private unsubscribLoadLibrary(): void {
    if (this.subscriptionLoadLibrary) {
      this.subscriptionLoadLibrary.unsubscribe();
    }
  }

  private unsubscribLoadMediaLibraries(): void {
    if (this.subscriptionLoadMediaLibraries) {
      this.subscriptionLoadMediaLibraries.unsubscribe();
    }
  }

  private fetchAllLibrary(): void {
    this.unsubscribLoadLibrary();
    this.subscriptionLoadLibrary = this.libraryService.fetchAllLibrary().pipe(take(1)).subscribe(() => {
      this.displayLoader = false;
    });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.libraryService.getLibrary().subscribe((data: Library[]) => {
          this.libraries = data;
      })
    );
    this.subscription.add(
      this.libraryService.getMediaLibraries().subscribe((data: MediaLibrary[] | null) => {
        this.mediaLibraries = data;
      })
    );
    this.subscription.add(
      this.libraryService.getLibrarySelected().subscribe((data: Library | null) => {
        this.librarySelected = data;
      })
    );
    this.fetchAllLibrary();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unsubscribLoadLibrary();
  }

  onClickReset(): void {
    this.displayLoader = true;
    this.libraryService.setLibrary([]);
    this.libraryService.setLibrarySelected(null);
    this.libraryService.setMediaLibraries(null);
    this.fetchAllLibrary();
    this.idSelectedForDeleting = null;
  }

  onClickAdd(): void {
    this.displayFormNewLibrary = true;
  }

  hiddeForm(): void {
    this.displayFormNewLibrary = false;
  }

  refreshLibrary(library: Library): void {
    this.libraryService.callFetchRefreshLibrary(library.id, library.mediaType);
    if (library.id && library.id === this.librarySelected?.id) {
      this.libraryService.setMediaLibraries(null);
    }
  }

  deleteLibrary(id: string): void {
    this.popup.setMessage(this.messageDelete, undefined);
    this.popup.setDisplayPopup(true);
    this.popup.setDisplayButton(true);
    this.idSelectedForDeleting = id;
  }

  emitDeleteLibrary(): any {
    if (!this.idSelectedForDeleting) return null;
    this.libraryService.fetchDeleteLibrary(this.idSelectedForDeleting).pipe(take(1)).subscribe({
      next: (data: MessageReturnedModel) => {
        this.popup.setMessage(data.message, data.state);
        this.popup.setEndTask(true);
        this.popup.setDisplayButton(false);
        this.displayLoader = false;
        if (this.idSelectedForDeleting === this.librarySelected?.id) {
          this.libraryService.setLibrarySelected(null);
          this.libraryService.setMediaLibraries(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 3);
      }
    });
  }

  onSelectedLibrary(library: Library): void {
    this.libraryService.setLibrarySelected(library);
    this.libraryService.setMediaLibraries(null);
    this.unsubscribLoadMediaLibraries();
    this.displayLoaderMediaLibraries = true;
    this.subscriptionLoadMediaLibraries = this.libraryService.fetchAllMediaLibraryByLibraryId(library.id).pipe(take(1)).subscribe((data: MediaLibrary[]) => {
      this.displayLoaderMediaLibraries = false;
    });
  }

}
