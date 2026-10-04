import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { finalize, Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
import { DownloadStatus, ProgressDownload, ProgressTypeOperation } from '../../../models/progress-download.interface';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../user-module/service/user/user.service';
import { UserModel } from '../../../../user-module/dto/user.model';

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

  user: UserModel | undefined = undefined;

  heightCircle!: number;
  heightIcon!: number;
  widthBorder!: number;
  iconUnits!: number;
  iconOffset!: number;

  public readonly srcDownload: string = 'icon/dl.svg';
  public readonly srcDeleteDl: string = 'icon/delete_dl.svg';
  public readonly srcUnavailable: string = 'icon/unavailable.svg';

  DownloadStatus = DownloadStatus;

  downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED;
  alreadyDownloaded!: boolean;
  key!: string;
  progressTranslate!: string;
  progress!: number;

  private readonly destroy$ = new Subject<void>();
  private checkSubscription?: Subscription;

  private progressSubscription?: Subscription;
  private operationSubscription?: Subscription;
  private operationWorking: boolean = false;

  constructor(private readonly downloadService: DownloadService, 
    private readonly translateService: TranslateService,
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUserValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaId'] || changes['seasonId'] || changes['episodeId'] || changes['mediaType']) {
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
          if (data.type === ProgressTypeOperation.DOWNLOAD) {
            this.setPercentTranslate(data.percent);
            if (data.percent <= 0) {
              this.downloadStatus = DownloadStatus.WAITING;
            } else if (data.percent < 100) {
              this.downloadStatus = DownloadStatus.IN_PROGRESS;
            } else {
              this.downloadStatus = DownloadStatus.DOWNLOADED;
            }
          } else {
            this.downloadStatus = DownloadStatus.DELETION;
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

    this.checkSubscription?.unsubscribe();
    this.checkSubscription = isDownloaded$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((downloaded: boolean) => {
        this.alreadyDownloaded = downloaded;
      });
  }

  onClick(): void {
    if (this.operationWorking 
      || this.downloadStatus === DownloadStatus.WAITING
      || this.downloadStatus === DownloadStatus.IN_PROGRESS 
      || this.downloadStatus === DownloadStatus.DELETION
    ) return;

    const shouldDelete: boolean = this.alreadyDownloaded || this.downloadStatus !== DownloadStatus.NOT_DOWNLOADED;
    if (!shouldDelete && !this.user) return;

    this.operationWorking = true;
    this.resetPercentTranslate();

    if (this.alreadyDownloaded || this.downloadStatus !== DownloadStatus.NOT_DOWNLOADED) {
      this.delete();
    } else {
      this.download();
    }
  }

  private delete(): void {
    const download$ = this.mediaType === MediaTypeModel.EPISODE
        ? this.downloadService.deleteDownloadsForEpisode(this.mediaId, this.seasonId, this.episodeId)
        : this.downloadService.deleteDownloadsForMedia(this.mediaId);
    
    this.operationSubscription?.unsubscribe();
    this.operationSubscription = download$
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alreadyDownloaded = false;
          this.observeProgressTracking();
        },
        error: () => {
          this.alreadyDownloaded = true;
          this.downloadStatus = DownloadStatus.DOWNLOADED;
        }
      });
  }

  private download(): void {
    const download$ = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.downloadEpisode(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.downloadMovie(this.mediaId);
    
    this.operationSubscription?.unsubscribe();
    this.operationSubscription = download$
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
           this.alreadyDownloaded = true;
           this.observeProgressTracking();
        },
        error: () => {
          this.alreadyDownloaded = false;
          this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
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
    if (this.key) this.downloadService.deleteUselessSubjectByKey(this.key);
    this.heightCircle = 0;
    this.heightIcon = 0;
    this.widthBorder = 0;
    this.iconOffset = 0;
    this.iconUnits = 0;
    this.progressSubscription?.unsubscribe();
    this.operationSubscription?.unsubscribe();
    this.checkSubscription?.unsubscribe();
    this.alreadyDownloaded = false;
    this.operationWorking = false;
    this.downloadStatus = DownloadStatus.NOT_DOWNLOADED;
    this.resetPercentTranslate();
  }

  private resetPercentTranslate(): void {
    this.setPercentTranslate(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.operationSubscription?.unsubscribe();
    this.progressSubscription?.unsubscribe();
    this.checkSubscription?.unsubscribe();
    if (this.key) this.downloadService.deleteUselessSubjectByKey(this.key);
  }

  public titleKey(): string {
    switch (this.downloadStatus) {
      case DownloadStatus.WAITING:
        return this.translateService.instant('DOWNLOAD.WAITING');
      case DownloadStatus.DELETION:
        return this.translateService.instant('DOWNLOAD.DELETION');
      case DownloadStatus.IN_PROGRESS:
        return `${this.translateService.instant('DOWNLOAD.DOWNLOADING')}: ${this.progress}%`;
    }

    if (this.alreadyDownloaded || this.downloadStatus === DownloadStatus.DOWNLOADED) {
      return this.translateService.instant('DOWNLOAD.DELETE_DOWNLOAD');
    }

    return this.user
      ? this.translateService.instant('DOWNLOAD.DOWNLOAD')
      : this.translateService.instant('DOWNLOAD.UNAVAILABLE');
  }

}