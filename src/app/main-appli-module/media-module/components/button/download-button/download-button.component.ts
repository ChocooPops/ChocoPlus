import { Component, Input, SimpleChanges, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { Observable, Subject, Subscription, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-download-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.css'
})
export class DownloadButtonComponent {

  @Input() mediaId!: number;
  @Input() seasonId!: number;
  @Input() episodeId!: number;
  @Input() mediaType!: MediaTypeModel;

  heightCircle!: number;
  heightIcon!: number;
  widthBorder!: number;

  srcDownload: string = 'icon/dl.svg';

  downloaded: boolean = false;
  downloading: boolean = false;
  progress: number = 0;
  key: string = '';

  private destroy$ = new Subject<void>();
  private progressSubscription?: Subscription;

  constructor(private readonly downloadService: DownloadService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaId']) {
      this.cleanup();

      if (this.mediaType === MediaTypeModel.EPISODE) {
        this.heightCircle = 30;
        this.heightIcon = 14;
        this.widthBorder = 1.5;
      } else {
        this.heightCircle = 40;
        this.heightIcon = 20;
        this.widthBorder = 2;
      }

      this.key = this.mediaType === MediaTypeModel.EPISODE
        ? `${MediaTypeModel.EPISODE}-${this.episodeId}`
        : `${MediaTypeModel.MOVIE}-${this.mediaId}`;

      if (this.downloadService.isDownloadInProgress(this.key)) {
        this.resumeProgressTracking();
      } else {
        this.checkAlreadyDownloaded();
      }
    }
  }

  private resumeProgressTracking(): void {
    this.downloading = true;

    this.progressSubscription?.unsubscribe();
    this.progressSubscription = this.downloadService
      .getDownloadProgress(this.key)
      .pipe(takeUntil(this.destroy$))
      .subscribe((percent: number) => {
        this.progress = percent;
        if (percent >= 100) {
          this.downloading = false;
          this.downloaded = true;
        }
      });
  }

  private checkAlreadyDownloaded(): void {
    const isDownloaded$: Observable<boolean> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.isEpisodeDownloaded(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.isMediaDownloaded(this.mediaId);

    isDownloaded$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((downloaded: boolean) => {
        this.downloaded = downloaded;
      });
  }

  onClick(): void {
    if (this.downloaded || this.downloading) return;

    this.downloading = true;
    this.progress = 0;
    
    this.progressSubscription?.unsubscribe();
    
    this.progressSubscription = this.downloadService
      .getDownloadProgress(this.key)
      .pipe(takeUntil(this.destroy$))
      .subscribe((percent: number) => {
        this.progress = percent;
      });
    
    const download$: Observable<void> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.downloadEpisode(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.downloadMovie(this.mediaId);

    download$
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.downloading = false;
          this.downloaded = true;
        },
        error: () => {
          this.downloading = false;
        }
      });
  }

  private cleanup(): void {
    this.progressSubscription?.unsubscribe();
    this.downloaded = false;
    this.downloading = false;
    this.progress = 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.progressSubscription?.unsubscribe();
  }

}