import { Injectable } from '@angular/core';
import { forkJoin, from, map, Observable, take, BehaviorSubject, switchMap, throwError, catchError, Subject, of, shareReplay } from 'rxjs';
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
import { ProgressDownload, ProgressTypeOperation } from '../../models/progress-download.interface';
import { SeriesPageAbstraction } from '../../components/media-page/series-page-abstraction.directive';
import { MovieModel } from '../../models/movie-model';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private progressSubjects: Map<string, BehaviorSubject<ProgressDownload | undefined>> = new Map();

  private progressChangedSubject: Subject<void> = new Subject<void>();
  private progressChanged$: Observable<void> = this.progressChangedSubject.asObservable();

  private readonly mediaDownloadedSubject = new BehaviorSubject<Map<number, MediaModel> | undefined>(undefined);
  private readonly mediaDownloaded$: Observable<MediaModel[] | undefined> = this.mediaDownloadedSubject.pipe(
    map((medias: Map<number, MediaModel> | undefined) => medias ? Array.from(medias.values()) : undefined)
  );
  private storageInfoSubject: BehaviorSubject<StorageInfoModel | undefined> = new BehaviorSubject<StorageInfoModel | undefined>(undefined);
  private storageInfo$: Observable<StorageInfoModel | undefined> = this.storageInfoSubject.asObservable();

  private seriesPage: SeriesPageAbstraction | undefined = undefined;

  public setSeriesPage(page: SeriesPageAbstraction | undefined) {
    this.seriesPage = page;
  }

  constructor(private readonly mediaService: MediaService,
    private readonly compressedPosterService: CompressedPosterService,
    private readonly seriesService: SeriesService
  ) { 
    this.setStorageInfo().pipe(take(1)).subscribe();
    
    window.electron.onDownloadProgress((progress: ProgressDownload) => {
      this.setOrCreateProgressDonwload(progress.key, progress);
      if (progress.percent >= 100) {
        this.replaceProgressKey(progress.key);
      }
    });
  }

  private initProgressDownload(key: string, type: ProgressTypeOperation, percent: number = 0): ProgressDownload {
    return {
      key: key, 
      percent: percent,
      receivedBytes: -1,
      totalBytes: -1,
      fileName: '',
      type: type
    }
  }

  private formatKey(id: number, mediaType: MediaTypeModel): string {
    return `${mediaType}-${id}`;
  }

  private setOrCreateProgressDonwload(key: string, data: ProgressDownload | undefined): void {
    const progress: BehaviorSubject<ProgressDownload | undefined> | undefined = this.progressSubjects.get(key);
    if (progress) {
      progress.next(data);
      this.progressSubjects.set(key, progress);
    } else {
      const newProgress: BehaviorSubject<ProgressDownload | undefined> = new BehaviorSubject<ProgressDownload | undefined>(data);
      this.progressSubjects.set(key, newProgress);
    }
    this.progressChangedSubject.next();
  }

  private getOrCreateProgressSubject(key: string): BehaviorSubject<ProgressDownload | undefined> {
    let subject: BehaviorSubject<ProgressDownload | undefined> | undefined = this.progressSubjects.get(key);
    if (!subject) {
      subject = new BehaviorSubject<ProgressDownload | undefined>(undefined);
      this.progressSubjects.set(key, subject);
    }
    return subject;
  }

  public getProgressChanged(): Observable<void> {
    return this.progressChanged$;
  }

  public getMediaList(): Observable<MediaModel[] | undefined> {
    return this.mediaDownloaded$;
  }

  public getStorageInfo(): Observable<StorageInfoModel | undefined> {
    return this.storageInfo$;
  }

  private updateDonwloadBytesStorage(bytes: number): void {
    const storage: StorageInfoModel | undefined = this.storageInfoSubject.value;
    if (storage) {
      if (this.mediaDownloadedSubject.value?.size === 0) {
        storage.downloadsBytes = 0;
        this.storageInfoSubject.next(storage);
      } else {
        storage.downloadsBytes = storage.downloadsBytes + bytes;
        this.storageInfoSubject.next(storage);
      }
    }
  }

  private addMediaIntoList(media: MediaModel): void {
    const current: Map<number, MediaModel> | undefined = this.mediaDownloadedSubject.value;
    if (!current) return;

    const existing: MediaModel | undefined = current.get(media.id);
    if (existing) {
      const updated = new Map(current);
      updated.set(media.id, { ...media, ...existing });
      this.mediaDownloadedSubject.next(updated);
    } else {
      this.mediaDownloadedSubject.next(new Map([[media.id, media], ...current]));
    }
  }
  
  private deleteMediaIntoList(id: number): void {
    const current: Map<number, MediaModel> | undefined = this.mediaDownloadedSubject.value;
    if (!current?.has(id)) return;

    const updated = new Map(current);
    updated.delete(id);
    this.mediaDownloadedSubject.next(updated);
  }

  public getDownloadsHistory(): ProgressDownload[] {
    return Array.from(this.progressSubjects.values())
      .map((subject: BehaviorSubject<ProgressDownload | undefined>) => subject.value)
      .filter((value): value is ProgressDownload => !!value)
      .reverse();
  }
  
  public getDownloadProgressById(key: string): Observable<ProgressDownload | undefined> {
    return this.getOrCreateProgressSubject(key).asObservable(); 
  }

  public replaceProgressKey(oldKey: string, overrides?: Partial<ProgressDownload>): void {
    const oldSubject = this.progressSubjects.get(oldKey);

    if (!oldSubject) {
      return;
    }

    const newKey = `${oldKey}-${Date.now()}`;
    const oldValue = oldSubject.value;

    const newSubject = new BehaviorSubject<ProgressDownload | undefined>(
      oldValue
        ? {
            ...oldValue,
            ...overrides,
            key: newKey,
          }
        : undefined
    );

    const entries = Array.from(this.progressSubjects.entries());

    this.progressSubjects.clear();

    for (const [key, subject] of entries) {
      if (key === oldKey) {
        this.progressSubjects.set(newKey, newSubject);
      } else {
        this.progressSubjects.set(key, subject);
      }
    }

    this.progressChangedSubject.next();
  }

  public deleteUselessSubjectByKey(key: string): void {
    const progress = this.progressSubjects.get(key);
    if (progress) {
      const value: ProgressDownload | undefined = progress.value;
      if (!value || value.percent >= 100) {
        this.progressSubjects.delete(key);
      }
    }
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
    const key: string = this.formatKey(movieId, MediaTypeModel.MOVIE);
    this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DOWNLOAD));

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
        }) as Promise<void>).pipe(
          map((data: any) => {
            if (data.media) {
              this.addMediaIntoList(data.media);
              this.updateDonwloadBytesStorage(data.media.bytes ?? 0);
            }
          })
        );
      }),
      catchError((error) => {
        this.setOrCreateProgressDonwload(key, undefined);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  public downloadEpisode(seriesId: number, seasonId: number, episodeId: number): Observable<void> {
    const key: string = this.formatKey(episodeId, MediaTypeModel.EPISODE);
    this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DOWNLOAD));

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
              }) as Promise<void>).pipe(
                map((data: any) => {
                  if (data.episode) {
                    if (this.seriesPage) {
                      this.seriesPage.addEpisodeBySeasonId(seasonId, data.episode);
                    }
                    this.updateDonwloadBytesStorage(data.episode.bytes ?? 0);
                  }
                })
              );
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
            }) as Promise<void>).pipe(
              map((data: any) => {
                if (data.media) {
                  this.addMediaIntoList(data.media);
                  if (data.episode) {
                    if (this.seriesPage) {
                      this.seriesPage.addEpisodeBySeasonId(seasonId, data.episode);
                    }
                    this.updateDonwloadBytesStorage(data.episode.bytes ?? 0);
                  }
                }
              })
            );
          })
        );
      }),
      catchError((error) => {
        this.setOrCreateProgressDonwload(key, undefined);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  public listDownloads(): Observable<void> {
    if (!this.mediaDownloadedSubject.value) {
      return from(window.electron.listDownloads() as Promise<MediaModel[]>).pipe(
        map((records: MediaModel[]) => {
          this.mediaDownloadedSubject.next(new Map(records.map((media: MediaModel) => [media.id, media])));
        })
      );
    }
    return of();
  }
  
  public mediaDownloadedIsEmpty(): Observable<boolean> {
    return from(window.electron.mediaDownloadedIsEmpty() as Promise<boolean>).pipe(
      map((isEmpty: boolean) => {
        return isEmpty
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

  public readMediaInfoById(mediaId: number): Observable<MediaInfoModel> {
    return from(window.electron.getMediaInfo(mediaId) as Promise<MediaInfoModel>).pipe(
      map((records: MediaInfoModel) => {
        return records;
      })
    );
  }

  public readAllEpisodesFromSeriesAndSeasonId(seriesId: number, seasonId: number): Observable<EpisodeModel[]> {
    return from(window.electron.getAllEpisodes({seriesId, seasonId}) as Promise<EpisodeModel[]>).pipe(
      map((records: EpisodeModel[]) => {
        return records;
      })
    );
  }

  public deleteDownloadsForMedia(mediaId: number): Observable<void> {
    const key: string = this.formatKey(mediaId, MediaTypeModel.MOVIE);
    this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DELETION))
    return from(window.electron.deleteDownload(
        {
          mediaId,
          mediaType: MediaTypeModel.MOVIE
        }
      ) as Promise<{ entries: { key: string, fileName: string | null, episode: EpisodeModel | null }[], media: MovieModel | null }>).pipe(
      map((result) => {
        result.entries.forEach(({ key, fileName }) => {
          this.replaceProgressKey(key, { fileName: fileName ?? '', percent: 100 });
        });
        if (result.media) {
          this.deleteMediaIntoList(result.media.id);
          this.updateDonwloadBytesStorage(-(result.media.bytes ?? 0));
        }
      }),
      catchError((error) => {
        this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DOWNLOAD, 100));
        return throwError(() => error)
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  public deleteDownloadsForEpisode(mediaId: number, seasonId: number, episodeId: number): Observable<void> {
    const key: string = this.formatKey(episodeId, MediaTypeModel.EPISODE);
    this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DELETION));
    return from(window.electron.deleteDownload(
        {
          mediaId,
          seasonId,
          episodeId,
          mediaType: MediaTypeModel.EPISODE
        }
      ) as Promise<{ entries: { key: string, fileName: string | null, episode: EpisodeModel | null }[], media: MediaModel | null }>).pipe(
      map((result) => {
        result.entries.forEach(({ key, fileName, episode }) => {
          this.replaceProgressKey(key, { fileName: fileName ?? '', percent: 100 });
          if (episode && this.seriesPage) {
            if (this.seriesPage) {
              this.seriesPage.deleteEpisodeBySeasonId(episode.seasonId, episode.id);              
            }
            this.updateDonwloadBytesStorage(-(episode.bytes ?? 0));
          }
        });
        if (result.media) {
          this.deleteMediaIntoList(result.media.id);
        }
      }),
      catchError((error) => {
        this.setOrCreateProgressDonwload(key, this.initProgressDownload(key, ProgressTypeOperation.DOWNLOAD, 100));
        return throwError(() => error)
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  public setStorageInfo(): Observable<void> {
    if (!this.storageInfoSubject.value) {
      return from(window.electron.getStorageInfo() as Promise<StorageInfoModel>).pipe(
        map((data: StorageInfoModel) => {
          this.storageInfoSubject.next(data);
        })
      );
    }
    return of()
  }

}
