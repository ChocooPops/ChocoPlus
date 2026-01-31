import { Injectable } from '@angular/core';
import { LicenseModel } from '../../model/license.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { MediaModel } from '../../../media-module/models/media.interface';
import { SelectionModel } from '../../../media-module/models/selection.interface';
import { SelectionType } from '../../../media-module/models/selection-type.enum';
import { MovieService } from '../../../media-module/services/movie/movie.service';
import { SelectionService } from '../../../media-module/services/selection/selection.service';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { SeriesService } from '../../../media-module/services/series/series.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  private licenseHome: LicenseModel[] = [];
  private licenseResearch: LicenseModel[] = [];
  private apiUrlLicense: string = `${environment.apirUrlLicense}`;
  private urlHomeLicense: string = 'home-page';
  private urlResearchLicense: string = 'research-page';
  private urlWantedLicense: string = 'research';

  constructor(private http: HttpClient,
    private movieService: MovieService,
    private seriesService: SeriesService,
    private selectionService: SelectionService
  ) { }

  public fetchAllLicenseHome(): Observable<LicenseModel[]> {
    if (this.licenseHome.length <= 0) {
      let timestamp = `?t=${new Date().getTime()}`;
      timestamp = '';
      return this.http.get<any[]>(`${this.apiUrlLicense}/${this.urlHomeLicense}`).pipe(
        map((data) => {
          const licenses: LicenseModel[] = [];
          data.forEach(license => {
            licenses.push({
              id: license.id,
              name: license.name,
              srcIcon: license.srcIcon ? `${license.srcIcon}${timestamp}` || undefined : undefined,
              visited: false,
              selectionList: []
            })
          });
          return this.licenseHome = licenses;
        })
      );
    } else {
      return of(this.licenseHome);
    }
  }

  public fetchAllLicenseResearch(): Observable<LicenseModel[]> {
    if (this.licenseResearch.length <= 0) {
      let timestamp = `?t=${new Date().getTime()}`;
      timestamp = '';
      return this.http.get<any[]>(`${this.apiUrlLicense}/${this.urlResearchLicense}`).pipe(
        map((data) => {
          const licenses: LicenseModel[] = [];
          data.forEach(license => {
            licenses.push({
              id: license.id,
              name: license.name,
              srcIcon: license.srcIcon ? `${license.srcIcon}${timestamp}` || undefined : undefined,
              visited: false,
              selectionList: []
            })
          });
          return this.licenseResearch = licenses;
        })
      );
    } else {
      return of(this.licenseResearch);
    }
  }

  public createNewLicense(data: any): LicenseModel {
    const mediaList: MediaModel[] = [];
    const mediaSelectionList: SelectionModel[] = [];
    data.mediaList.forEach((media: MediaModel) => {
      if (media.mediaType === MediaTypeModel.MOVIE) {
        mediaList.push(this.movieService.createNewMovie(media));
      } else if (media.mediaType === MediaTypeModel.SERIES) {
        mediaList.push(this.seriesService.createNewSeries(media));
      }
    });
    const firstMediaSelection: SelectionModel = this.selectionService.createNewSelection(
      0,
      mediaList.length > 0 ? data.name : '',
      SelectionType.LICENSE_POSTER,
      mediaList
    );
    mediaSelectionList.push(firstMediaSelection);
    data.selectionList.forEach((mediaSelection: any) => {
      mediaSelectionList.push(this.selectionService.createNewSelectionByFetch(mediaSelection));
    });
    const license: LicenseModel = {
      id: data.id || -1,
      name: data.name || 'Nameless',
      position: data.position || false,
      srcIcon: data.srcIcon ? data.srcIcon || undefined : undefined,
      srcLogo: data.srcLogo ? data.srcLogo || undefined : undefined,
      srcBackground: data.srcBackground ? data.srcBackground || undefined : undefined,
      selectionList: mediaSelectionList || undefined,
      visited: true
    }
    return license;
  }

  public fetchLicenseWanted(keyWord: String): Observable<LicenseModel[]> {
    return this.http.get<any[]>(`${this.apiUrlLicense}/${this.urlWantedLicense}/${keyWord}`).pipe(
      map((data) => {
        const licenseList: LicenseModel[] = [];
        data.forEach((license: any) => {
          licenseList.push(this.createNewLicense(license));
        });
        return licenseList;
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  public fetchLicenseById(id: number): Observable<LicenseModel> {
    const index: number | undefined = this.licenseResearch.findIndex((license: LicenseModel) => license.id === id);
    if (index >= 0) {
      if (this.licenseResearch[index].visited) {
        return of(this.licenseResearch[index]);
      } else {
        return this.fetchLicenseByIdPrivate(id, index, true);
      }
    } else {
      const index2: number | undefined = this.licenseHome.findIndex((license: LicenseModel) => license.id === id);
      if (index2 >= 0) {
        if (this.licenseHome[index2].visited) {
          return of(this.licenseHome[index2]);
        } else {
          return this.fetchLicenseByIdPrivate(id, index2, false);
        }
      } else {
        return this.fetchLicenseByIdPrivate(id, -1, false);
      }
    }
  }

  private fetchLicenseByIdPrivate(id: number, index: number, state: boolean): Observable<LicenseModel> {
    return this.http.get<any>(`${this.apiUrlLicense}/${id}`).pipe(
      map((data) => {
        if (index >= 0) {
          if (state) {
            return this.licenseResearch[index] = this.createNewLicense(data);
          } else {
            return this.licenseHome[index] = this.createNewLicense(data);
          }
        } else {
          return this.createNewLicense(data);
        }
      }),
      catchError((error) => {
        const license: LicenseModel = {
          id: 0,
          name: 'Nameless',
          selectionList: [],
          visited: false
        }
        return of(license);
      })
    );
  }

  public resetLicenseById(id: number): void {
    const index: number | undefined = this.licenseResearch.findIndex((license: LicenseModel) => license.id === id);
    if (index >= 0) {
      this.licenseResearch[index].visited = false;
    } else {
      const index2: number | undefined = this.licenseHome.findIndex((license: LicenseModel) => license.id === id);
      if (index2 >= 0) {
        this.licenseHome[index2].visited = false;
      }
    }
  }

  public deleteLicenseById(id: number): void {
    this.licenseHome = this.licenseHome.filter((license: LicenseModel) => license.id !== id);
    this.licenseResearch = this.licenseResearch.filter((license: LicenseModel) => license.id !== id);
  }

  public resetAllLicenses(): void {
    this.licenseHome = [];
    this.licenseResearch = [];
  }

  public addLicenseHome(license: LicenseModel): void {
    if (this.licenseHome.length > 0) {
      this.licenseHome.push(license);
    }
  }

  public addLicenseResearch(license: LicenseModel): void {
    if (this.licenseResearch.length > 0) {
      this.licenseResearch.push(license)
    }
  }

  public setLicenseHome(license: LicenseModel[]): void {
    this.licenseHome = license;
  }

  public setLicenseResearch(license: LicenseModel[]): void {
    this.licenseResearch = license;
  }

  public changeMyList(mediaId: number, state: boolean): void {
    this.licenseHome.forEach((license: LicenseModel) => {
      license.selectionList?.forEach((selection: SelectionModel) => {
        selection.mediaList.forEach((media: MediaModel) => {
          if (media.id === mediaId) {
            media.isInList = state;
            return;
          }
        })
      })
    });
    this.licenseResearch.forEach((license: LicenseModel) => {
      license.selectionList?.forEach((selection: SelectionModel) => {
        selection.mediaList.forEach((media: MediaModel) => {
          if (media.id === mediaId) {
            media.isInList = state;
            return;
          }
        })
      })
    });
  }
}
