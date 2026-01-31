import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormatPosterModel } from '../../models/format-poster.enum';

@Injectable({
  providedIn: 'root'
})
export class FormatPosterService {

  private readonly formatHome: string = 'FORMAT_HOME';
  private readonly formatMovie: string = 'FORMAT_MOVIE';
  private readonly formatSeries: string = 'FORMAT_SERIES';
  private readonly formatResearch: string = 'FORMAT_RESEARCH';
  private readonly formatLicense: string = 'FORMAT_LICENSE';
  private readonly formatMyList: string = 'FORMAT_MYLIST';

  private formatPosterHomeSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatHome));
  private formatPosterHome$: Observable<FormatPosterModel> = this.formatPosterHomeSubject.asObservable();

  private formatPosterMovieSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatMovie));
  private formatPosterMovie$: Observable<FormatPosterModel> = this.formatPosterMovieSubject.asObservable();

  private formatPosterSeriesSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatSeries));
  private formatPosterSeries$: Observable<FormatPosterModel> = this.formatPosterSeriesSubject.asObservable();

  private formatPosterResearchSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatResearch));
  private formatPosterResearch$: Observable<FormatPosterModel> = this.formatPosterResearchSubject.asObservable();

  private formatPosterLicenseSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatLicense));
  private formatPosterLicense$: Observable<FormatPosterModel> = this.formatPosterLicenseSubject.asObservable();

  private formatPosterMyListSubject: BehaviorSubject<FormatPosterModel> = new BehaviorSubject<FormatPosterModel>(this.initFormatPoster(this.formatMyList));
  private formatPosterMyList$: Observable<FormatPosterModel> = this.formatPosterMyListSubject.asObservable();

  public fetchFormatPosterHome(): Observable<FormatPosterModel> {
    return this.formatPosterHome$;
  }
  public fetchFormatPosterMovie(): Observable<FormatPosterModel> {
    return this.formatPosterMovie$;
  }
  public fetchFormatPosterSeries(): Observable<FormatPosterModel> {
    return this.formatPosterSeries$;
  }
  public fetchFormatPosterResearch(): Observable<FormatPosterModel> {
    return this.formatPosterResearch$;
  }
  public fetchFormatPosterLicense(): Observable<FormatPosterModel> {
    return this.formatPosterLicense$;
  }
  public fetchFormatPosterMyList(): Observable<FormatPosterModel> {
    return this.formatPosterMyList$;
  }

  public setFormatPosterHome(format: FormatPosterModel): void {
    localStorage.setItem(this.formatHome, format);
    this.formatPosterHomeSubject.next(format);
  }
  public setFormatPosterMovie(format: FormatPosterModel): void {
    localStorage.setItem(this.formatMovie, format);
    this.formatPosterMovieSubject.next(format);
  }
  public setFormatPosterSeries(format: FormatPosterModel): void {
    localStorage.setItem(this.formatSeries, format);
    this.formatPosterSeriesSubject.next(format);
  }
  public setFormatPosterResearch(format: FormatPosterModel): void {
    localStorage.setItem(this.formatResearch, format);
    this.formatPosterResearchSubject.next(format);
  }
  public setFormatPosterLicense(format: FormatPosterModel): void {
    localStorage.setItem(this.formatLicense, format);
    this.formatPosterLicenseSubject.next(format);
  }
  public setFormatPosterMyList(format: FormatPosterModel): void {
    localStorage.setItem(this.formatMyList, format);
    this.formatPosterMyListSubject.next(format);
  }

  public getFormatPosterHomeValue(): FormatPosterModel {
    return this.formatPosterHomeSubject.value;
  }
  public getFormatPosterMovieValue(): FormatPosterModel {
    return this.formatPosterMovieSubject.value;
  }
  public getFormatPosterSeriesValue(): FormatPosterModel {
    return this.formatPosterSeriesSubject.value;
  }
  public getFormatPosterResearchValue(): FormatPosterModel {
    return this.formatPosterResearchSubject.value;
  }
  public getFormatPosterLicenseValue(): FormatPosterModel {
    return this.formatPosterLicenseSubject.value;
  }
  public getFormatPosterMyListValue(): FormatPosterModel {
    return this.formatPosterMyListSubject.value;
  }

  private initFormatPoster(format: string): any {
    const item = localStorage.getItem(format) as FormatPosterModel;
    if (item && Object.values(FormatPosterModel).includes(item)) {
      return localStorage.getItem(format);
    } else {
      localStorage.setItem(format, FormatPosterModel.VERTICAL);
      return FormatPosterModel.VERTICAL;
    }
  }

  constructor() { }

}
