import { Injectable } from '@angular/core';
import { forkJoin, from, map, Observable, of, take, BehaviorSubject, switchMap, throwError, catchError } from 'rxjs';
import { MediaService } from '../media/media.service';
import { MediaModel } from '../../models/media.interface';
import { MediaInfoModel } from '../../models/media-info.interface';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { SelectionType } from '../../models/selection-type.enum';
import { MediaTypeModel } from '../../models/media-type.enum';
import { SeriesService } from '../series/series.service';
import { EpisodeModel } from '../../models/series/episode.interface';
import { SeriesModel } from '../../models/series/series.interface';
import { SeasonModel } from '../../models/series/season.interface';
import { StorageInfoModel } from '../../models/storage-info.interface';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private readonly progressSubjects: Map<string, BehaviorSubject<number>> = new Map();

  constructor(private readonly mediaService: MediaService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly seriesService: SeriesService
  ) { 
    window.electron.onDownloadProgress((data: { key: string, percent: number }) => {
      this.getOrCreateProgressSubject(data.key).next(data.percent);
    });
  }

  private getOrCreateProgressSubject(key: string): BehaviorSubject<number> {
    let subject: BehaviorSubject<number> | undefined = this.progressSubjects.get(key);
    if (!subject) {
      subject = new BehaviorSubject<number>(0);
      this.progressSubjects.set(key, subject);
    }
    return subject;
  }

  public getDownloadProgress(key: string): Observable<number> {
    return this.getOrCreateProgressSubject(key).asObservable();
  }

  public isDownloadInProgress(key: string): boolean {
    const subject: BehaviorSubject<number> | undefined = this.progressSubjects.get(key);
    return subject !== undefined && subject.getValue() < 100;
  }

  private compressedAllPosterFromMedia(media: MediaModel): MediaModel {
    const compressPosters = (posters: (string | undefined)[] | undefined, type: SelectionType): string[] =>
      (posters ?? [])
        .map((poster) => this.compressedPosterService.getPosterMediaFromPoster(type, poster))
        .filter((poster): poster is string => poster !== undefined);

    media.srcPosterNormal = compressPosters(media.srcPosterNormal, SelectionType.NORMAL_POSTER);
    media.srcPosterHorizontal = compressPosters(media.srcPosterHorizontal, SelectionType.HORIZONTAL_POSTER);
    media.srcPosterSpecial = compressPosters(media.srcPosterSpecial, SelectionType.SPECIAL_POSTER);
    media.srcPosterLicense = compressPosters(media.srcPosterLicense, SelectionType.LICENSE_POSTER);

    media.srcLogo = this.compressedPosterService.getLogoForMedia(media);
    media.srcBackgroundImage = this.compressedPosterService.getBackgroundForMediaPresentationTopHead(media);
    
    const series: SeriesModel = media as SeriesModel;

    if (series.seasons && Array.isArray(series.seasons)) {
      series.seasons.forEach((season: SeasonModel) => {
        season.srcPoster = this.compressedPosterService.getSeasonPoster(season);
      });
    }

    return series;
  }

  private compressedAllPosterFromEpisode(episode: EpisodeModel): EpisodeModel {
    episode.srcPoster = this.compressedPosterService.getEpisodePoster(episode);
    return episode;
  }

  public downloadMovie(movieId: number): Observable<void> {
    this.getOrCreateProgressSubject(`${MediaTypeModel.MOVIE}-${movieId}`).next(0);
    
    return forkJoin({
      media: this.mediaService.fetchMediaById(movieId),
      info: this.mediaService.fetchGetMediaInfoById(movieId)
    }).pipe(
      take(1),
      switchMap((data: { media: MediaModel | null, info: MediaInfoModel | null }) => {
        if (!data.media || !data.info) {
          return throwError(() => new Error('Hollow data'));
        }
        
        return from(window.electron.downloadMedia({
          media: this.compressedAllPosterFromMedia(data.media),
          info: data.info,
          mediaType: MediaTypeModel.MOVIE
        }) as Promise<void>);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  public downloadEpisode(seriesId: number, seasonId: number, episodeId: number): Observable<void> {
    this.getOrCreateProgressSubject(`${MediaTypeModel.EPISODE}-${episodeId}`).next(0);

    return this.isMediaDownloaded(seriesId).pipe(
      take(1),
      switchMap((seriesAlreadyDownloaded: boolean) => {
        if (seriesAlreadyDownloaded) {
          return this.seriesService.fetchEpisodeById(episodeId).pipe(
            take(1),
            switchMap((episode: EpisodeModel | null) => {
              if (!episode) {
                return throwError(() => new Error('Hollow data'));
              }
              return from(window.electron.downloadMedia({
                media: { id: seriesId },
                info: { id: seriesId },
                seasonId: seasonId,
                episode: this.compressedAllPosterFromEpisode(episode),
                mediaType: MediaTypeModel.EPISODE
              }) as Promise<void>);
            })
          );
        }

        return forkJoin({
          media: this.mediaService.fetchMediaById(seriesId),
          info: this.mediaService.fetchGetMediaInfoById(seriesId),
          episode: this.seriesService.fetchEpisodeById(episodeId)
        }).pipe(
          take(1),
          switchMap((data: {
            media: MediaModel | null,
            info: MediaInfoModel | null,
            episode: EpisodeModel | null
          }) => {
            if (!data.media || !data.info || !data.episode) {
              return throwError(() => new Error('Hollow data'));
            }
            return from(window.electron.downloadMedia({
              media: this.compressedAllPosterFromMedia(data.media),
              info: data.info,
              seasonId: seasonId,
              episode: this.compressedAllPosterFromEpisode(data.episode),
              mediaType: MediaTypeModel.EPISODE
            }) as Promise<void>);
          })
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  public listDownloads(): Observable<MediaModel[]> {
    return from(window.electron.listDownloads() as Promise<any[]>).pipe(
      map((records: any[]) => {
        return records;
      })
    );
  }

  public isMediaDownloaded(movieId: number): Observable<boolean> {
    return from(window.electron.isMediaDownloaded(movieId) as Promise<boolean>).pipe(
      map((records: boolean) => {
        return records;
      })
    );
  }

  public isEpisodeDownloaded(seriesId: number, seasonId: number, episodeId: number): Observable<boolean> {
    return from(window.electron.isEpisodeDownloaded({seriesId, seasonId, episodeId}) as Promise<boolean>).pipe(
      map((records: boolean) => {
        return records;
      })
    );
  }

  public deleteDownloadsForMedia(media: MediaModel): Observable<void> {
    return of();
  }

  public getStorageInfo(): Observable<StorageInfoModel> {
    return from(window.electron.getStorageInfo() as Promise<StorageInfoModel>);
  }

}
