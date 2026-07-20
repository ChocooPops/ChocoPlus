import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { MediaModel } from '../../models/media.interface';
import { MediaHistoryModel, SeasonHistoryModel } from '../../models/media-history.interface';
import { MediaInfoModel } from '../../models/media-info.interface';
import { MediaTypeModel } from '../../models/media-type.enum';
import { MovieModel } from '../../models/movie-model';
import { SeriesModel } from '../../models/series/series.interface';
import { SeasonModel } from '../../models/series/season.interface';
import { ProgressStateMedia } from '../../models/progress-state-media.enum';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MediaSelectedService {

  private readonly LIMIT_CACHE: number = 15;
  private readonly LIMIT_CACHE_HISTORY: number = 15;
  private readonly apiUrlMedia: string = `${environment.apiUrlMedia}`;
  private readonly apiUrlMediaInfo: string = 'media-info';
  private mediaInfoMap: Map<number, MediaInfoModel> = new Map();

  private mediaSelectedSubject: BehaviorSubject<MediaModel | undefined> = new BehaviorSubject<MediaModel | undefined>(undefined);
  private mediaSelected$: Observable<MediaModel | undefined> = this.mediaSelectedSubject.asObservable();

  private history: MediaHistoryModel[] = [];
  private currentIndex = -1;

  private canGoBackSubject = new BehaviorSubject<boolean>(false);
  private canGoForwardSubject = new BehaviorSubject<boolean>(false);

  private canGoBack$ = this.canGoBackSubject.asObservable();
  private canGoForward$ = this.canGoForwardSubject.asObservable();

  constructor(private readonly http: HttpClient) { }

  selectMedia(media: MediaModel): void {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(this.toHistoryEntry(media));
    this.currentIndex = this.history.length - 1;
    if (this.history.length > this.LIMIT_CACHE_HISTORY) {
      this.history.shift();
      this.currentIndex--;
    }
    this.mediaSelectedSubject.next(media);
    this.updateStates();
  }
  clearSelection(): void {
    this.history = [];
    this.currentIndex = -1;
    this.mediaSelectedSubject.next(undefined);
    this.updateStates();
  }
  getMediaSelected(): Observable<MediaModel | undefined> {
    return this.mediaSelected$;
  }

  getCanGoBack(): Observable<boolean> {
    return this.canGoBack$;
  }

  getCanGoForward(): Observable<boolean> {
    return this.canGoForward$;
  }

  back(): void {
    if (!this.canGoBack()) return;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.mediaSelectedSubject.next(this.toMediaModel(this.history[this.currentIndex]));
    } else {
      this.currentIndex = -1;
      this.mediaSelectedSubject.next(undefined);
    }
    this.updateStates();
  }

  forward(): void {
    if (!this.canGoForward()) return;
    this.currentIndex++;
    this.mediaSelectedSubject.next(this.toMediaModel(this.history[this.currentIndex]));
    this.updateStates();
  }

  canGoBack(): boolean {
    return this.currentIndex >= 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private toHistoryEntry(media: MediaModel): MediaHistoryModel {
    return {
      id: media.id,
      title: media.title,
      description: media.description,
      date: media.date,
      srcPosterNormal: media.srcPosterNormal,
      srcPosterSpecial: media.srcPosterSpecial,
      srcPosterLicense: media.srcPosterLicense,
      srcLogo: media.srcLogo,
      srcBackgroundImage: media.srcBackgroundImage,
      mediaType: media.mediaType,
      seasons: media.mediaType === MediaTypeModel.SERIES
        ? (media as SeriesModel).seasons.map((season: SeasonModel): SeasonHistoryModel => ({
          id: season.id,
          seriesId: season.seriesId,
          name: season.name,
          seasonNumber: season.seasonNumber,
          srcPoster: season.srcPoster,
          isRecent: season.isRecent
        }))
        : undefined,
      duration: media.mediaType === MediaTypeModel.MOVIE ? (media as MovieModel).duration : undefined,
      resolution: media.mediaType === MediaTypeModel.MOVIE ? (media as MovieModel).resolution : undefined
    };
  }

  private toMediaModel(entry: MediaHistoryModel): MediaModel {
    const base = {
      id: entry.id,
      description: entry.description,
      title: entry.title,
      mediaLibraryId: '',
      date: entry.date,
      srcPosterNormal: entry.srcPosterNormal,
      srcPosterSpecial: entry.srcPosterSpecial,
      srcPosterLicense: entry.srcPosterLicense,
      srcLogo: entry.srcLogo,
      srcBackgroundImage: entry.srcBackgroundImage,
      typeZoomX: undefined,
      typeZoomY: false,
      isRecent: false
    };

    if (entry.mediaType === MediaTypeModel.SERIES) {
      const series: SeriesModel = {
        ...base,
        mediaType: MediaTypeModel.SERIES,
        seasons: (entry.seasons ?? []).map((season: SeasonHistoryModel): SeasonModel => ({
          id: season.id,
          seriesId: season.seriesId,
          mediaLibraryId: '',
          name: season.name,
          seasonNumber: season.seasonNumber,
          srcPoster: season.srcPoster,
          isRecent: season.isRecent ?? false,
          isClicked: false,
          episodes: []
        }))
      };
      return series;
    }

    const movie: MovieModel = {
      ...base,
      mediaType: MediaTypeModel.MOVIE,
      duration: entry.duration ?? 0,
      resolution: entry.resolution ?? '',
      watchProgress: 0,
      stateProgress: ProgressStateMedia.NOT_WATCHED
    };
    return movie;
  }

  private updateStates(): void {
    this.canGoBackSubject.next(this.canGoBack());
    this.canGoForwardSubject.next(this.canGoForward());
  }

  public fetchGetMediaInfoById(mediaId: number): Observable<MediaInfoModel | null> {
    const cached: MediaInfoModel | undefined = this.mediaInfoMap.get(mediaId);
    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiUrlMedia}/${this.apiUrlMediaInfo}/${mediaId}`).pipe(
      map((data: any) => {
        if (!data.id) return null;

        const mediaInfo: MediaInfoModel = {
          id: data.id,
          casts: data.casts ?? [],
          crews: data.crews ?? [],
          categories: data.categories ?? [],
          keyWords: data.keyWords ?? []
        };

        this.mediaInfoMap.set(mediaId, mediaInfo);
        if (this.mediaInfoMap.size > this.LIMIT_CACHE) {
          this.deleteFirstKey();
        }
        return mediaInfo;
      }),
      catchError(() => of(null))
    );
  }

  private deleteFirstKey(): void {
    const firstKey = this.mediaInfoMap.keys().next().value;
    if (firstKey) {
      this.mediaInfoMap.delete(firstKey);
    }
  }

}
