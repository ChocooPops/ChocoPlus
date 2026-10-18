import { Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { EpisodeModel } from '../../../models/series/episode.interface';
import { combineLatest, finalize, Subject, Subscription, take, takeUntil } from 'rxjs';
import { DownloadService } from '../../../services/download/download.service';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadStatus, ProgressDownload, ProgressTypeOperation } from '../../../models/progress-download.interface';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-download-season',
  standalone: true,
  imports: [NgClass, TranslatePipe],
  templateUrl: './download-season.component.html',
  styleUrls: ['./download-season.component.css']
})
export class DownloadSeasonComponent {

  private seasonKey!: string;
  private seriesKey!: string;

  @Input({ required: true }) seriesId!: number;
  @Input({ required: true }) seasonId!: number;
  @Input({ required: true }) seasonNumber!: number;
  @Input({ required: true }) episodes!: EpisodeModel[];

  public readonly srcDownload: string = 'icon/dl.svg';
  public readonly srcDeleteDl: string = 'icon/delete_dl.svg';
  public readonly srcCancelDl: string = 'icon/cancel.svg';
  public readonly srcUnavailable: string = 'icon/unavailable.svg';

  DownloadStatus = DownloadStatus;
  downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED;

  seriesOperationInProgress: boolean = false;
  private operationWorking: boolean = false;

  private progressSubscription: Subscription = new Subscription();
  private operationSubscription?: Subscription;
  private episodeAlreadyDownloaded: Set<string> = new Set();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly downloadService: DownloadService,
    private readonly translateService: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seriesId'] || changes['seasonId'] || changes['episodes']) {
      this.cleanup();
      this.seasonKey = this.downloadService.formatKey(this.seasonId, MediaTypeModel.SEASON);
      this.seriesKey = this.downloadService.formatKey(this.seriesId, MediaTypeModel.SERIES);
      this.observeProgressTracking();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.progressSubscription.unsubscribe();
    this.operationSubscription?.unsubscribe();
    if (this.seasonKey) this.downloadService.deleteUselessSubjectByKey(this.seasonKey);
  }

  private verifEpisodeALreadyDownloaded(): void {
    if (this.episodeAlreadyDownloaded.size >= this.episodes.length) {
      this.downloadStatus = DownloadStatus.DOWNLOADED;
    } else {
      this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
    }
  }

  private observeProgressTracking(): void {
    this.progressSubscription.unsubscribe();
    this.progressSubscription = new Subscription();
    
    const episodeIds: number[] = this.episodes.map((episode: EpisodeModel) => episode.id);
    const episodeKeys: string[] = episodeIds.map((id: number) => `${MediaTypeModel.EPISODE}-${id}`);

    this.progressSubscription.add(
      combineLatest({
        season: this.downloadService.getDownloadProgressById(this.seasonKey),
        episodes: this.downloadService.observeProgressByIds(episodeKeys)
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({season, episodes}) => {

        episodes.forEach((data: ProgressDownload | undefined) => {
          if (data) {
            if (data.percent >= 100 && data.type === ProgressTypeOperation.DOWNLOAD) {
              this.episodeAlreadyDownloaded.add(data.key);
            } else {
              this.episodeAlreadyDownloaded.delete(data.key);
            }
          }
        });

        if (season) {
          if (season.type === ProgressTypeOperation.DOWNLOAD) {
            this.downloadStatus = DownloadStatus.IN_PROGRESS;
            return;
          } else if (season.type === ProgressTypeOperation.DELETION) {
            this.downloadStatus = DownloadStatus.DELETION;
            return;
          } else if (season.type === ProgressTypeOperation.CANCELED) {
            this.downloadStatus = DownloadStatus.CANCELED;
            return;
          }
        }

        const progress = episodes.filter((data: ProgressDownload | undefined) => data && data.percent >= 0 && data.percent < 100);
        if (progress.length > 0) {
          this.downloadStatus = DownloadStatus.WAITING;
        } else {
          this.verifEpisodeALreadyDownloaded();
        }
      })
    );

    this.progressSubscription.add(
      this.downloadService.readAllEpisodesFromSeriesAndSeasonId(this.seriesId, this.seasonId)
        .pipe(take(1))
        .subscribe((data: EpisodeModel[]) => {
          data.forEach((episode: EpisodeModel) => {
            const key: string = this.downloadService.formatKey(episode.id, MediaTypeModel.EPISODE);
            this.episodeAlreadyDownloaded.add(key);
          });
          this.verifEpisodeALreadyDownloaded();
      })
    );

    this.progressSubscription.add(
      this.downloadService
        .getDownloadProgressById(this.seriesKey)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: ProgressDownload | undefined) => {
          this.seriesOperationInProgress = !!data && data.percent < 100;
        })
    );
  }

  onClick(): void {
    if (this.seriesOperationInProgress || this.downloadStatus === DownloadStatus.WAITING) return;

    if (this.downloadStatus === DownloadStatus.IN_PROGRESS) {
      this.cancelSeasonDownload();
      return;
    }

    if (this.operationWorking 
      || this.downloadStatus === DownloadStatus.DELETION
      || this.downloadStatus === DownloadStatus.CANCELED) return;

    if (this.downloadStatus === DownloadStatus.DOWNLOADED) {
      this.deleteSeason();
    } else {
      this.downloadSeason();
    }
  }

  private cancelSeasonDownload(): void {
    this.operationSubscription?.unsubscribe();
    this.operationWorking = true;
    this.operationSubscription = this.downloadService.cancelSeasonDownload(this.seriesId, this.seasonId, this.episodes)
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe();
  }

  private downloadSeason(): void {
    const episodes: EpisodeModel[] = this.episodes;
    if (episodes.length === 0) return;

    this.operationSubscription?.unsubscribe();
    this.operationWorking = true;
    this.operationSubscription = this.downloadService.downloadSeason(this.seriesId, this.seasonId, episodes)
      .pipe(finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe();
  }

  private deleteSeason(): void {
    this.operationSubscription?.unsubscribe();
    this.operationWorking = true;
    this.operationSubscription = this.downloadService.deleteDownloadsForSeason(this.seriesId, this.seasonId, this.episodes)
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.observeProgressTracking()
        }
      });
  }

  private cleanup(): void {
    if (this.seasonKey) this.downloadService.deleteUselessSubjectByKey(this.seasonKey);
    this.progressSubscription.unsubscribe();
    this.operationSubscription?.unsubscribe();
    this.operationWorking = false;
    this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
    this.episodeAlreadyDownloaded = new Set();
    this.seriesOperationInProgress = false;
  }

  public getNormalLabel(): string {
    const prefixKey = `${this.translateService.instant('DOWNLOAD.DOWNLOAD_SEASON')} ${this.seasonNumber}`;
    return `${prefixKey} (${this.episodeAlreadyDownloaded.size}/${this.getTotalEpisodeLabel()})`
  }

  public getLabelDuringSuppression(): string {
    const prefixKey = `${this.translateService.instant('DOWNLOAD.DELETE_SEASON')} ${this.seasonNumber}`;
    return `${prefixKey} (${this.getTotalEpisodeLabel()})`
  }

  public getLabelDuringDownload(): string {
    const prefixKey = this.translateService.instant('DOWNLOAD.DOWNLOADING_SEASON', { number: this.seasonNumber });
    return `${prefixKey} (${this.episodeAlreadyDownloaded.size}/${this.getTotalEpisodeLabel()})`
  }

  public getLabelDuringDeletion(): string {
    const prefixKey = this.translateService.instant('DOWNLOAD.DELETING_SEASON', { number: this.seasonNumber });
    return `${prefixKey} (${this.getTotalEpisodeLabel()})`
  }

  public getLabelDuringCancellation(): string {
    const prefixKey = this.translateService.instant('DOWNLOAD.CANCELING_SEASON', { number: this.seasonNumber });
    return `${prefixKey} (${this.getTotalEpisodeLabel()})`
  }

  private getTotalEpisodeLabel(): string {
    if (!this.episodes) return '';
    if (this.episodes.length > 1) {
      return (`${this.episodes.length} ${this.translateService.instant('EPISODES')}`).toLowerCase();
    } else {
      return (`${this.episodes.length} ${this.translateService.instant('EPISODE')}`).toLowerCase();
    }
  }

}
