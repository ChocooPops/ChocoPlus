import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { finalize, map, Observable, of, Subject, Subscription, switchMap, take, takeUntil } from 'rxjs';
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
  public readonly srcCancelDl: string = 'icon/cancel.svg';
  public readonly srcUnavailable: string = 'icon/unavailable.svg';

  DownloadStatus = DownloadStatus;
  downloadStatus: DownloadStatus = DownloadStatus.NOT_DOWNLOADED;

  key!: string;
  secondKey!: string;
  thirdKey!: string;

  seriesOperationInProgress: boolean = false;
  seasonOperationInProgress: boolean = false;

  progressTranslate!: string;
  progress!: number;

  private readonly destroy$ = new Subject<void>();

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
        case MediaTypeModel.MOVIE : {
          this.key = this.downloadService.formatKey(this.mediaId, MediaTypeModel.MOVIE)
        }
          break;
        case MediaTypeModel.EPISODE : {
          this.key = this.downloadService.formatKey(this.episodeId, MediaTypeModel.EPISODE);
          this.secondKey = this.downloadService.formatKey(this.mediaId, MediaTypeModel.SERIES);
          this.thirdKey = this.downloadService.formatKey(this.seasonId, MediaTypeModel.SEASON);
        }
          break;
        default : this.key = '';
      }
      
      this.observeProgressTracking();
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

  private isAlreadyDownloaded$(): Observable<boolean> {
    return this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.isEpisodeDownloaded(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.isMediaDownloaded(this.mediaId);
  }

  private observeProgressTracking(): void {
    this.progressSubscription.unsubscribe();
    this.progressSubscription = new Subscription();

    this.progressSubscription.add(
      this.downloadService
        .getDownloadProgressById(this.key)
        .pipe(
          switchMap((data: ProgressDownload | undefined): Observable<DownloadStatus> => {
            if (!data) {
              return this.isAlreadyDownloaded$().pipe(
                map((downloaded: boolean) => {
                  return downloaded ? DownloadStatus.DOWNLOADED : DownloadStatus.NOT_DOWNLOADED;
                })
              );
            }

            if (data.type === ProgressTypeOperation.DOWNLOAD) {
              this.setPercentTranslate(data.percent);
              if (data.percent <= 0) return of(DownloadStatus.WAITING);
              if (data.percent < 100) return of(DownloadStatus.IN_PROGRESS);
              return of(DownloadStatus.DOWNLOADED);
            }

            if (data.type === ProgressTypeOperation.CANCELED) {
              return of(DownloadStatus.CANCELED);
            }

            return of(DownloadStatus.DELETION);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((status: DownloadStatus) => {
          this.downloadStatus = status;
          this.cdr.detectChanges();
        })
    );

    if (this.mediaType === MediaTypeModel.EPISODE) {
      this.progressSubscription.add(
        this.downloadService
          .getDownloadProgressById(this.secondKey)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: ProgressDownload | undefined) => {
            this.seriesOperationInProgress = !!data && data.percent < 100;
            this.cdr.detectChanges();
          })
      )

      this.progressSubscription.add(
        this.downloadService
          .getDownloadProgressById(this.thirdKey)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: ProgressDownload | undefined) => {
            this.seasonOperationInProgress = !!data && data.percent < 100;
            this.cdr.detectChanges();
          })
      )
    } else {
      this.seriesOperationInProgress = false;
      this.seasonOperationInProgress = false;
    }
  }

  onClick(): void {

    if (this.seriesOperationInProgress || this.seasonOperationInProgress) {
      return;
    }

    if (this.downloadStatus === DownloadStatus.WAITING || this.downloadStatus === DownloadStatus.IN_PROGRESS) {
      this.cancelDownload();
      return;
    }

    if (this.operationWorking || this.downloadStatus === DownloadStatus.DELETION) return;

    const shouldDelete: boolean = this.downloadStatus !== DownloadStatus.NOT_DOWNLOADED;
    if (!shouldDelete && !this.user) return;

    this.operationWorking = true;
    this.resetPercentTranslate();

    if (this.downloadStatus !== DownloadStatus.NOT_DOWNLOADED) {
      this.delete();
    } else {
      this.download();
    }
  }

  private cancelDownload(): void {
    this.operationWorking = true;
    this.operationSubscription?.unsubscribe();
    this.operationSubscription = 
      this.downloadService.cancelDownload(this.key)
        .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            //this.observeProgressTracking();
          }
        });
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
          //this.observeProgressTracking();
        },
        error: () => {
          this.downloadStatus = DownloadStatus.DOWNLOADED;
        }
      });
  }

  private download(): void {
    if (!this.user) {
      this.operationWorking = false;
      return;
    }
    const download$ = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.downloadEpisode(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.downloadMovie(this.mediaId);
    
    this.operationSubscription?.unsubscribe();
    this.operationSubscription = download$
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          //this.observeProgressTracking();
        },
        error: () => {
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
    if (this.thirdKey) this.downloadService.deleteUselessSubjectByKey(this.thirdKey);
    this.key = '';
    this.secondKey = '';
    this.thirdKey = '';
    this.heightCircle = 0;
    this.heightIcon = 0;
    this.widthBorder = 0;
    this.iconOffset = 0;
    this.iconUnits = 0;
    this.progressSubscription.unsubscribe();
    this.operationSubscription?.unsubscribe();
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
    if (this.key) this.downloadService.deleteUselessSubjectByKey(this.key);
    if (this.secondKey) this.downloadService.deleteUselessSubjectByKey(this.secondKey);
    if (this.thirdKey) this.downloadService.deleteUselessSubjectByKey(this.thirdKey);
  }

  public titleKey(): string {
    if (this.seriesOperationInProgress || this.seasonOperationInProgress) {
      return this.translateService.instant('DOWNLOAD.UNAVAILABLE_IN_PROGRESS');
    }
    switch (this.downloadStatus) {
      case DownloadStatus.WAITING:
        return this.translateService.instant('DOWNLOAD.WAITING');
      case DownloadStatus.DELETION:
        return this.translateService.instant('DOWNLOAD.DELETION');
      case DownloadStatus.CANCELED:
        return this.translateService.instant('DOWNLOAD.CANCELED_IN_PROGRESS');
      case DownloadStatus.IN_PROGRESS:
        return `${this.translateService.instant('DOWNLOAD.DOWNLOADING')}: ${this.progress}%`;
    }

    if (this.downloadStatus === DownloadStatus.DOWNLOADED) {
      return this.translateService.instant('DOWNLOAD.DELETE_DOWNLOAD');
    }

    return this.user
      ? this.translateService.instant('DOWNLOAD.DOWNLOAD')
      : this.translateService.instant('DOWNLOAD.UNAVAILABLE_OFFLINE');
  }

}