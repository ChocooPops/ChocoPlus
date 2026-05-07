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
import { MediaLibraryTabComponent } from '../media-library-tab/media-library-tab.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-setting-edit-library',
  standalone: true,
  imports: [PopupComponent, TranslatePipe, NewLibraryComponent, LibraryComponent, ButtonAddComponent, MediaLibraryTabComponent],
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

  displayFormNewLibrary: boolean = false;
  srcReset: string = 'icon/modify.svg';
  idSelectedForDeleting: string | null = null;
  librarySelected: string | null = null;
  displayLoaderMediaLibraries: boolean = false;

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
    )
    this.fetchAllLibrary();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unsubscribLoadLibrary();
  }

  onClickReset(): void {
    this.displayLoader = true;
    this.libraryService.resetLibrary();
    this.fetchAllLibrary();
    this.mediaLibraries = null;
    this.idSelectedForDeleting = null;
    this.librarySelected = null;
  }

  onClickAdd(): void {
    this.displayFormNewLibrary = true;
  }

  hiddeForm(): void {
    this.displayFormNewLibrary = false;
  }

  refreshLibrary(id: string): void {
    this.libraryService.callFetchRefreshLibrary(id);
    if (id && id === this.librarySelected) {
      this.mediaLibraries = null;
      this.librarySelected = null;
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
        if (this.idSelectedForDeleting === this.librarySelected) {
          this.mediaLibraries = null;
          this.librarySelected = null;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.displayPopupOnError(error, 3);
      }
    });
  }

  onSelectedLibrary(id: string): void {
    this.librarySelected = id;
    this.mediaLibraries = null;
    this.unsubscribLoadMediaLibraries();
    this.displayLoaderMediaLibraries = true;
    this.subscriptionLoadMediaLibraries = this.libraryService.fetchAllMediaLibraryByLibraryId(id).pipe(take(1)).subscribe((data: MediaLibrary[]) => {
      this.mediaLibraries = data;
      this.displayLoaderMediaLibraries = false;
    })
  }

}
