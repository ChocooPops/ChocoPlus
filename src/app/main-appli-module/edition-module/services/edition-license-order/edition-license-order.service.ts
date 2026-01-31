import { Injectable } from '@angular/core';
import { LicenseModel } from '../../../license-module/model/license.interface';
import { SimpleModel } from '../../../../common-module/models/simple-model';
import { BehaviorSubject, map, Observable, take, of } from 'rxjs';
import { MessageReturnedModel } from '../../../../common-module/models/message-returned.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { LicenseService } from '../../../license-module/service/license/licence.service';

@Injectable({
  providedIn: 'root'
})
export class EditionLicenseOrderService {

  private apiUrlLicense: string = `${environment.apirUrlLicense}`;
  private urlChangeOrderHomeLicense: string = 'change-order-home-license';
  private urlChangeOrderResearchLicense: string = 'change-order-research-license';

  private radioButtonLicenseTypeSubject: BehaviorSubject<SimpleModel[]> = new BehaviorSubject<SimpleModel[]>(this.getInitialRadioButtonLocationLicense())
  private radioButtonLicenseType$: Observable<SimpleModel[]> = this.radioButtonLicenseTypeSubject.asObservable();

  private editOrderLicenseSubject: BehaviorSubject<LicenseModel[]> = new BehaviorSubject<LicenseModel[]>([]);
  private editOrderLicense$: Observable<LicenseModel[]> = this.editOrderLicenseSubject.asObservable();

  private licenseTypeSubject: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  private licenseType$: Observable<boolean | undefined> = this.licenseTypeSubject.asObservable();

  constructor(private licenseService: LicenseService,
    private http: HttpClient
  ) { }

  private getInitialRadioButtonLocationLicense(): SimpleModel[] {
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

  public modifyLicenseType(id: number): void {
    const updatedSelection: SimpleModel[] = this.radioButtonLicenseTypeSubject.value.map(radio => ({
      ...radio,
      state: radio.id === id
    }));
    this.radioButtonLicenseTypeSubject.next(updatedSelection);
    this.licenseTypeSubject.next(updatedSelection.find((item: SimpleModel) => item.state === true)?.value);
    if (this.licenseTypeSubject.value) {
      this.licenseService.fetchAllLicenseHome().pipe(take(1)).subscribe((licenses: LicenseModel[]) => {
        this.editOrderLicenseSubject.next(licenses);
      })
    } else {
      this.licenseService.fetchAllLicenseResearch().pipe(take(1)).subscribe((licenses: LicenseModel[]) => {
        this.editOrderLicenseSubject.next(licenses);
      })
    }
  }

  public moveRight(id: number, steps: number): void {
    const licenses: LicenseModel[] = this.editOrderLicenseSubject.value;
    const index = licenses.findIndex(license => license.id === id);
    if (index !== -1) {
      const newIndex = Math.min(index + steps, licenses.length - 1);
      const updated = [...licenses];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      this.editOrderLicenseSubject.next(updated);
    }
  }

  public moveLeft(id: number, steps: number): void {
    const licenses: LicenseModel[] = this.editOrderLicenseSubject.value;
    const index = licenses.findIndex(license => license.id === id);
    if (index !== -1) {
      const newIndex = Math.max(index - steps, 0);
      const updated = [...licenses];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      this.editOrderLicenseSubject.next(updated);
    }
  }

  public getRadioButton(): Observable<SimpleModel[]> {
    return this.radioButtonLicenseType$;
  }
  public getEditOrderLicense(): Observable<LicenseModel[]> {
    return this.editOrderLicense$;
  }
  public getLicenseType(): Observable<boolean | undefined> {
    return this.licenseType$;
  }

  public resetEditOrderLicense(): void {
    this.radioButtonLicenseTypeSubject.next(this.getInitialRadioButtonLocationLicense());
    this.editOrderLicenseSubject.next([]);
    this.licenseTypeSubject.next(undefined);
  }

  private fetchModifyHomeLicenseOrder(): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlLicense}/${this.urlChangeOrderHomeLicense}`, this.getIds()).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.licenseService.setLicenseHome(this.editOrderLicenseSubject.value);
        }
        return data;
      })
    )
  }

  private fetchModifyReseachLicenseOrder(): Observable<MessageReturnedModel> {
    return this.http.put<any>(`${this.apiUrlLicense}/${this.urlChangeOrderResearchLicense}`, this.getIds()).pipe(
      map((data: MessageReturnedModel) => {
        if (data.state) {
          this.licenseService.setLicenseResearch(this.editOrderLicenseSubject.value);
        }
        return data;
      })
    )
  }

  public fetchOrderLicenseAccordingToType(): Observable<MessageReturnedModel> {
    const type: boolean | undefined = this.licenseTypeSubject.value;
    if (type != undefined) {
      if (type) {
        return this.fetchModifyHomeLicenseOrder();
      } else {
        return this.fetchModifyReseachLicenseOrder();
      }
    } else {
      return of(
        {
          id: -1,
          state: false,
          message: "Aucun type de lience  n'a été sélectionné"
        }
      )
    }
  }

  private getIds(): number[] {
    return this.editOrderLicenseSubject.value.map(license => license.id);
  }

}
