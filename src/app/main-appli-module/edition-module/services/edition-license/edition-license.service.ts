import { Injectable } from '@angular/core';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { MediaModel } from '../../../media-module/models/media.interface';
import { BehaviorSubject, catchError, map, Observable, throwError, take } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { EditLicenseModel } from '../../models/edit-license.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { LicenseService } from '../../../license-module/service/license/licence.service';

@Injectable({
  providedIn: 'root'
})
export class EditionLicenseService {

  private radioButtonLocationLicenseSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitialRaduiButtonLocationLicense());
  private radioButtonLocationLicense$: Observable<SimpleModel[]> = this.radioButtonLocationLicenseSubject.asObservable();

  private editLicenseSubject: BehaviorSubject<LicenseModel> = new BehaviorSubject<LicenseModel>(this.getInitialLicense());
  private editLicense$: Observable<LicenseModel> = this.editLicenseSubject.asObservable();

  private mediasIntoLicenseSubject: BehaviorSubject<SelectionModel> = new BehaviorSubject<SelectionModel>(this.getInitialMediaIntoLicense());
  private mediasIntoLicense$: Observable<SelectionModel> = this.mediasIntoLicenseSubject.asObservable();

  private nameFirstSelection: string = '';

  private apiUrlLicense: string = `${environment.apirUrlLicense}`;
  private urlAddLicense: string = 'add';
  private urlModifyLicense: string = 'modify';
  private urlDeleteLicense: string = 'delete';

  constructor(private http: HttpClient,
    private licenseService: LicenseService
  ) {
    this.addMediasContainesIntoLicenseIntoLicense();
  }

  public setEditLicenseById(id: number): void {
    this.licenseService.fetchLicenseById(id).pipe(take(1)).subscribe((license: LicenseModel) => {
      this.setLicenseWanted(license);
    });
  }

  public setLicenseWanted(license: LicenseModel): void {
    if (license.selectionList && license.selectionList[0].mediaList.length <= 0) {
      license.selectionList[0] = this.getInitialMediaIntoLicense();
    } else {
      this.nameFirstSelection = license.name;
    }

    this.editLicenseSubject.next(license);
    if (license.selectionList != undefined && license.selectionList.length >= 0) {
      this.mediasIntoLicenseSubject.next(license.selectionList[0]);
    }

    if (license.position) {
      this.modifyLicensePosition(2);
    } else {
      this.modifyLicensePosition(1);
    }
  }

  private addMediasContainesIntoLicenseIntoLicense(): void {
    const currentLicense = this.editLicenseSubject.getValue();
    const currentMedias = this.mediasIntoLicenseSubject.getValue();

    if (currentLicense.selectionList) {
      currentLicense.selectionList.push(currentMedias);
      this.editLicenseSubject.next({ ...currentLicense });
    }
  }

  private getInitialRaduiButtonLocationLicense(): SimpleModel[] {
    return [
      {
        id: 1,
        name: 'Page de recherche',
        value: false,
        state: false
      },
      {
        id: 2,
        name: "Page d'accueil",
        value: true,
        state: false
      }
    ]
  }

  private getInitialLicense(): LicenseModel {
    return {
      id: -1,
      name: '',
      position: undefined,
      srcIcon: undefined,
      srcLogo: undefined,
      srcBackground: undefined,
      selectionList: [],
      visited: false
    }
  }

  private getInitialMediaIntoLicense(): SelectionModel {
    return {
      id: -1,
      name: '',
      typeSelection: SelectionType.LICENSE_POSTER,
      mediaList: []
    }
  }

  public getLicenseEdition(): Observable<LicenseModel> {
    return this.editLicense$;
  }

  public getRadiouttonLocatioonLicense(): Observable<SimpleModel[]> {
    return this.radioButtonLocationLicense$;
  }

  public getMediasIntoLicense(): Observable<SelectionModel> {
    return this.mediasIntoLicense$;
  }

  public modifyLicensePosition(id: number): void {
    const updatedSelection: SimpleModel[] = this.radioButtonLocationLicenseSubject.value.map(radio => ({
      ...radio,
      state: radio.id === id
    }));

    this.radioButtonLocationLicenseSubject.next(updatedSelection);

    const updatedLicense: LicenseModel = { ...this.editLicenseSubject.value, position: updatedSelection.find(item => item.id === id)?.value };
    this.editLicenseSubject.next(updatedLicense);
  }

  public modifyImageLicense(newImage: string | ArrayBuffer | undefined | null): void {
    const updatedLicense: LicenseModel = { ...this.editLicenseSubject.value, srcIcon: newImage };
    this.editLicenseSubject.next(updatedLicense);
  }

  public modifyLogoLicense(newLogo: string | ArrayBuffer | undefined | null): void {
    const updatedLicense: LicenseModel = { ...this.editLicenseSubject.value, srcLogo: newLogo };
    this.editLicenseSubject.next(updatedLicense);
  }

  public modifyBackgroundImageLicense(newBackImage: string | ArrayBuffer | undefined | null): void {
    const updatedLicense: LicenseModel = { ...this.editLicenseSubject.value, srcBackground: newBackImage };
    this.editLicenseSubject.next(updatedLicense);
  }

  public modifyNameSelection(nameLicense: string): void {
    this.nameFirstSelection = nameLicense;
    const currentMedias: SelectionModel = this.mediasIntoLicenseSubject.value;

    if (currentMedias.mediaList.length > 0) {
      const updatedMedias: SelectionModel = { ...currentMedias, name: "Film " + nameLicense };
      this.mediasIntoLicenseSubject.next(updatedMedias);
    }
    const updateLicense: LicenseModel = { ...this.editLicenseSubject.value, name: nameLicense }
    this.editLicenseSubject.next(updateLicense);
    this.updateLicenseMediaIntoEditLicense();
  }

  public addMediaIntoSelection(media: MediaModel): void {
    const currentMedias: MediaModel[] = this.mediasIntoLicenseSubject.value.mediaList;
    if (!currentMedias.some(item => item.id === media.id)) {
      let updatedMedias !: SelectionModel;
      if (this.mediasIntoLicenseSubject.value.name == '') {
        updatedMedias = {
          ...this.mediasIntoLicenseSubject.value,
          name: this.nameFirstSelection,
          mediaList: [...currentMedias, media]
        };
      } else {
        updatedMedias = {
          ...this.mediasIntoLicenseSubject.value,
          mediaList: [...currentMedias, media]
        };
      }
      this.mediasIntoLicenseSubject.next(updatedMedias);
      this.updateLicenseMediaIntoEditLicense();
    }
  }

  public removeMediaFromSelection(id: number): void {
    let updatedMedias = { ...this.mediasIntoLicenseSubject.value, mediaList: this.mediasIntoLicenseSubject.value.mediaList.filter(media => media.id !== id) };
    if (updatedMedias.mediaList.length > 0) {
      this.mediasIntoLicenseSubject.next(updatedMedias);
    } else {
      this.mediasIntoLicenseSubject.next(this.getInitialMediaIntoLicense());
    }
    this.updateLicenseMediaIntoEditLicense();
  }

  public moveMediaOnTheLeftOfSelection(id: number): void {
    const mediaList: MediaModel[] = [...this.mediasIntoLicenseSubject.value.mediaList];
    const index = mediaList.findIndex(media => media.id === id);
    if (index > 0) {
      [mediaList[index], mediaList[index - 1]] = [mediaList[index - 1], mediaList[index]];
      this.mediasIntoLicenseSubject.next({ ...this.mediasIntoLicenseSubject.value, mediaList: mediaList });
    }
    this.updateLicenseMediaIntoEditLicense();
  }

  public moveMediaOnTheRightOfSelection(id: number): void {
    const mediaList: MediaModel[] = [...this.mediasIntoLicenseSubject.value.mediaList];
    const index = mediaList.findIndex(media => media.id === id);
    if (index < mediaList.length - 1) {
      [mediaList[index], mediaList[index + 1]] = [mediaList[index + 1], mediaList[index]];
      this.mediasIntoLicenseSubject.next({ ...this.mediasIntoLicenseSubject.value, mediaList: mediaList });
    }
    this.updateLicenseMediaIntoEditLicense();
  }

  private updateLicenseMediaIntoEditLicense() {
    const updatedMedias = this.mediasIntoLicenseSubject.value;
    const currentLicense = this.editLicenseSubject.value;

    const updatedLicense: LicenseModel = {
      ...currentLicense,
      selectionList: currentLicense.selectionList
        ? [...currentLicense.selectionList]
        : []
    };

    if (updatedLicense.selectionList.length > 0) {
      updatedLicense.selectionList[0] = updatedMedias;
    } else {
      updatedLicense.selectionList.push(updatedMedias);
    }
    this.editLicenseSubject.next(updatedLicense);
  }

  public addMediaSelectionIntoLicense(mediaSelection: SelectionModel): void {
    const currentSelection: SelectionModel[] = this.editLicenseSubject.value.selectionList || [];
    if (!currentSelection.some(item => item.id === mediaSelection.id)) {
      const updatedLicense: LicenseModel = { ...this.editLicenseSubject.value, selectionList: [...currentSelection, mediaSelection] };
      this.editLicenseSubject.next(updatedLicense);
    }
  }

  public removeSelectionFromLicense(id: number): void {
    const updatedLicense: LicenseModel = {
      ...this.editLicenseSubject.value,
      selectionList: this.editLicenseSubject.value.selectionList?.filter(selection => selection.id !== id) || []
    };
    this.editLicenseSubject.next(updatedLicense);
  }

  public moveSelectionOnTheBottomOfLicense(id: number): void {
    if (!this.editLicenseSubject.value.selectionList) return;
    const selections: SelectionModel[] = [...this.editLicenseSubject.value.selectionList];
    const index = selections.findIndex(selection => selection.id === id);
    if (index !== -1 && index < selections.length - 1) {
      [selections[index], selections[index + 1]] = [selections[index + 1], selections[index]];
      this.editLicenseSubject.next({ ...this.editLicenseSubject.value, selectionList: selections });
    }
  }

  public moveSelectionOnTheTopOfLicense(id: number): void {
    if (!this.editLicenseSubject.value.selectionList) return;
    const selections: SelectionModel[] = [...this.editLicenseSubject.value.selectionList];
    const index = selections.findIndex(selection => selection.id === id);
    if (index > 1) {
      [selections[index], selections[index - 1]] = [selections[index - 1], selections[index]];
      this.editLicenseSubject.next({ ...this.editLicenseSubject.value, selectionList: selections });
    }
  }

  public resetAllEditLicense(): void {
    this.editLicenseSubject.next(this.getInitialLicense());
    this.radioButtonLocationLicenseSubject.next(this.getInitialRaduiButtonLocationLicense());
    this.mediasIntoLicenseSubject.next(this.getInitialMediaIntoLicense());
    this.addMediasContainesIntoLicenseIntoLicense();
    this.nameFirstSelection = '';
  }

  public fetchAddNewLicense(): Observable<MessageReturnedModel> {
    const actualEditlicense: LicenseModel = this.editLicenseSubject.value;
    const newLicense: EditLicenseModel = this.getEditLicenseFormated(actualEditlicense);
    return this.http.post<any>(`${this.apiUrlLicense}/${this.urlAddLicense}`, newLicense).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.licenseService.fetchLicenseById(data.other.id).pipe(take(1)).subscribe((license: LicenseModel) => {
            license.visited = true;
            this.setLicenseWanted(license);
            if (newLicense.position) {
              this.licenseService.addLicenseHome(license);
            } else {
              this.licenseService.addLicenseResearch(license);
            }
          });
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  public fetchModifyLicense(): Observable<MessageReturnedModel> {
    const updateLicense: EditLicenseModel = this.getEditLicenseFormated(this.editLicenseSubject.value);
    return this.http.put<any>(`${this.apiUrlLicense}/${this.urlModifyLicense}`, updateLicense).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state && data.other) {
          this.licenseService.resetLicenseById(data.other.id);
          this.setEditLicenseById(data.other.id);
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  public fetchDeleteLicense(): Observable<MessageReturnedModel> {
    const id: number = this.editLicenseSubject.value.id;
    return this.http.delete<any>(`${this.apiUrlLicense}/${this.urlDeleteLicense}/${id}`).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.resetAllEditLicense();
          this.licenseService.deleteLicenseById(id);
        }
        return data;
      }),
      catchError((error) => {
        return throwError(() => error)
      })
    )
  }

  public getEditLicenseFormated(license: LicenseModel): EditLicenseModel {
    let mediaList: number[] = [];
    const mediaSelectionList: number[] = [];
    if (license.selectionList) {
      mediaList = license.selectionList[0].mediaList.map((media: MediaModel) => media.id);
      for (let i = 1; i < license.selectionList.length; i++) {
        mediaSelectionList.push(license.selectionList[i].id);
      }
    }
    return {
      id: license.id,
      name: license.name,
      position: license.position || false,
      srcIcon: license.srcIcon,
      srcLogo: license.srcLogo,
      srcBackground: license.srcBackground,
      mediaList: mediaList,
      selectionList: mediaSelectionList
    }
  }

}
