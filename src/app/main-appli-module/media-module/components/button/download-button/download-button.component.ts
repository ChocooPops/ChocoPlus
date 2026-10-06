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

  @Input({ required: true }) mediaId!: number;
  @Input({ required: true }) mediaType!: MediaTypeModel;
  @Input() seasonId!: number;
  @Input() episodeId!: number;

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
  secondKey!: string;
  operationInProgress: boolean = false;

  progressTranslate!: string;
  progress!: number;

  private readonly destroy$ = new Subject<void>();
  private checkSubscription?: Subscription;

  private progressSubscription = new Subscription();
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

      switch(this.mediaType) {
        case MediaTypeModel.MOVIE : this.key = `${MediaTypeModel.MOVIE}-${this.mediaId}`
          break;
        case MediaTypeModel.EPISODE : {
          this.key = `${MediaTypeModel.EPISODE}-${this.episodeId}`;
          this.secondKey = `${MediaTypeModel.SERIES}-${this.mediaId}`;
        }
          break;
        default : this.key = '';
      }
      
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
    this.progressSubscription.unsubscribe();
    this.progressSubscription = new Subscription();

    this.progressSubscription.add(
      this.downloadService
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
        })
    )

    if (this.mediaType === MediaTypeModel.EPISODE) {
      this.progressSubscription.add(
        this.downloadService
          .getDownloadProgressById(this.secondKey)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: ProgressDownload | undefined) => {
            if (!data || data.percent >= 100) {
              this.operationInProgress = false;    
            } else {
              this.operationInProgress = true;
            }
            this.cdr.detectChanges();
          })
      )
    } else {
      this.operationInProgress = false;
    }
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
    
    if (this.operationInProgress) {
      return;
    }

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
    const delete$ = this.mediaType === MediaTypeModel.EPISODE
        ? this.downloadService.deleteDownloadsForEpisode(this.mediaId, this.seasonId, this.episodeId)
        : this.downloadService.deleteDownloadsForMedia(this.mediaId, this.mediaType);
    
    this.operationSubscription?.unsubscribe();
    this.operationSubscription = delete$
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
    if (this.secondKey) this.downloadService.deleteUselessSubjectByKey(this.secondKey);
    this.key = '';
    this.secondKey = '';
    this.heightCircle = 0;
    this.heightIcon = 0;
    this.widthBorder = 0;
    this.iconOffset = 0;
    this.iconUnits = 0;
    this.progressSubscription.unsubscribe();
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
    this.progressSubscription.unsubscribe();
    this.operationSubscription?.unsubscribe();
    this.checkSubscription?.unsubscribe();
    if (this.key) this.downloadService.deleteUselessSubjectByKey(this.key);
    if (this.secondKey) this.downloadService.deleteUselessSubjectByKey(this.secondKey);
  }

  public titleKey(): string {
    if (this.operationInProgress) {
      return this.translateService.instant('DOWNLOAD.UNAVAILABLE_IN_PROGRESS');
    }
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
      : this.translateService.instant('DOWNLOAD.UNAVAILABLE_OFFLINE');
  }

}