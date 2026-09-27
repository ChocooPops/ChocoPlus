import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
import { DownloadStatus, ProgressDownload } from '../../../models/progress-download.interface';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-download-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.css'
})
export class DownloadButtonComponent {

  private static nextUid: number = 0;
  readonly uid: number = DownloadButtonComponent.nextUid++;

  @Input() mediaId!: number;
  @Input() seasonId!: number;
  @Input() episodeId!: number;
  @Input() mediaType!: MediaTypeModel;

  heightCircle!: number;
  heightIcon!: number;
  widthBorder!: number;
  iconUnits!: number;
  iconOffset!: number;

  srcDownload: string = 'icon/dl.svg';
  srcDeleteDl: string = 'icon/delete_dl.svg'

  DownloadStatus = DownloadStatus;

  downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED;
  alreadyDownloaded!: boolean;
  key!: string;
  progressTranslate!: string;
  progress!: number;

  private destroy$ = new Subject<void>();
  private progressSubscription?: Subscription;

  constructor(private readonly downloadService: DownloadService, 
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaId']) {
      this.cleanup();
      this.setDimension();
      this.key = this.mediaType === MediaTypeModel.EPISODE
        ? `${MediaTypeModel.EPISODE}-${this.episodeId}`
        : `${MediaTypeModel.MOVIE}-${this.mediaId}`;

      this.observeProgressTracking();
      this.checkAlreadyDownloaded();
    }
  }

  private setDimension(): void {
    if (this.mediaType === MediaTypeModel.EPISODE) {
        this.heightCircle = 30;
        this.heightIcon = 14;
        this.widthBorder = 1.5;
    } else {
        this.heightCircle = 40;
        this.heightIcon = 20;
        this.widthBorder = 2;
    }
    this.iconUnits = (this.heightIcon / (this.heightCircle - 2 * this.widthBorder)) * 100;
    this.iconOffset = (100 - this.iconUnits) / 2;
  }

  private observeProgressTracking(): void {
    this.progressSubscription?.unsubscribe();
    this.progressSubscription = this.downloadService
      .getDownloadProgressById(this.key)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: ProgressDownload | undefined) => {
        if (data) {
          this.setPercentTranslate(data.percent);
          if (data.percent <= 0) {
            this.downloadStatus = DownloadStatus.WAITING;
          } else if (data.percent < 100) {
            this.downloadStatus = DownloadStatus.IN_PROGRESS;
          } else {
            this.downloadStatus = DownloadStatus.FINISHED;
          }
        } else {
          this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
        }
        this.cdr.detectChanges();
      });
  }

  private checkAlreadyDownloaded(): void {
    const isDownloaded$: Observable<boolean> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.isEpisodeDownloaded(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.isMediaDownloaded(this.mediaId);

    isDownloaded$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((downloaded: boolean) => {
        this.alreadyDownloaded = downloaded;
      });
  }

  onClick(): void {
    if (this.alreadyDownloaded || this.downloadStatus !== DownloadStatus.NOT_DOWNLOADED) return;

    this.resetPercentTranslate();
    
    const download$: Observable<void> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.downloadEpisode(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.downloadMovie(this.mediaId);

    download$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        error: () => {
          
        }
      });
  }

  setPercentTranslate(percent: number): any {
    this.progress = percent;
    percent = Math.min(100, Math.max(0, percent));
    const offset = 104 - (112 * percent) / 100;
    this.progressTranslate = `translateY(${offset}px)`;
  }

  private cleanup(): void {
    this.heightCircle = 0;
    this.heightIcon = 0;
    this.widthBorder = 0;
    this.iconOffset = 0;
    this.iconUnits = 0;
    this.progressSubscription?.unsubscribe();
    this.alreadyDownloaded = false;
    this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
    this.resetPercentTranslate();
  }

  private resetPercentTranslate(): void {
    this.setPercentTranslate(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.progressSubscription?.unsubscribe();
    this.downloadService.deleteUselessSubjectByKey(this.key);
  }

  public titleKey(): string {
    if (this.alreadyDownloaded || this.downloadStatus === DownloadStatus.FINISHED) return this.translateService.instant('DOWNLOAD.DELETE_DOWNLOAD');
    switch (this.downloadStatus) {
      case DownloadStatus.NOT_DOWNLOADED: return this.translateService.instant('DOWNLOAD.DOWNLOAD');
      case DownloadStatus.WAITING: return this.translateService.instant('DOWNLOAD.WAITING');
      case DownloadStatus.IN_PROGRESS: return `${this.translateService.instant('DOWNLOAD.DOWNLOADING')}: ${this.progress}%`;
      default: return '';
    }
  }

}