import { Component, HostBinding, HostListener, Input } from '@angular/core';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { finalize, Subject, Subscription, take, takeUntil } from 'rxjs';
import { ProgressDownload } from '../../../models/progress-download.interface';
import { NgClass } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DisplayOrderService } from '../../../services/display-order/display-order.service';

@Component({
  selector: 'app-delete-download-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './delete-download-button.component.html',
  styleUrl: './delete-download-button.component.css'
})
export class DeleteDownloadButtonComponent {

  @Input({ required: true }) mediaId!: number;
  @Input({ required: true }) mediaType!: MediaTypeModel
  @Input() @HostBinding('class.poster-zoomed') posterZoomed: boolean = false;

  public readonly srcDeletion: string = "icon/delete_dl.svg";
  public readonly srcUnavailable: string = "icon/unavailable.svg";

  private readonly destroy$ = new Subject<void>();
  public isHover: boolean = false;
  public key!: string;
  public state!: 'NOT_DELETED' | 'DELETION';

  constructor(private readonly downloadService: DownloadService,
    private readonly translateService: TranslateService,
    private readonly displayOrderService: DisplayOrderService
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.displayOrderService.stopTimerZoom();
  }

  private progressSubscription: Subscription = new Subscription();
  private operationSubscription?: Subscription;
  
  private operationWorking: boolean = false;
  public episodeInProgress: boolean = false;

  ngOnInit(): void {
    this.key = `${this.mediaType}-${this.mediaId}`;
    this.observeProgressTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.progressSubscription.unsubscribe();
    this.operationSubscription?.unsubscribe();
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
            this.state = 'DELETION';
          } else {
            this.state = 'NOT_DELETED';
          }
        })
    )

    if (this.mediaType === MediaTypeModel.SERIES) {
      this.progressSubscription.add(
        this.downloadService
          .getProgressEpisodes(this.mediaId).subscribe((data: number[]) => {
            if (data.length === 0) {
              this.episodeInProgress = false;
            } else {
              this.episodeInProgress = true;
            }
          })
      )
    } else {
      this.episodeInProgress = false;
    }
  }

  public titleKey(): string {
    if (this.episodeInProgress) {
      return this.translateService.instant('DOWNLOAD.UNAVAILABLE_IN_PROGRESS')
    } else if (this.state === 'DELETION') {
      return this.translateService.instant('DOWNLOAD.DELETION');
    } else if (this.state === 'NOT_DELETED') {
      return this.translateService.instant('DOWNLOAD.DELETE_DOWNLOAD');
    } else {  
      return '';
    }
  }

  onClick(): void {
    if (this.state === 'DELETION' || this.operationWorking || this.episodeInProgress) return;
    
    this.operationWorking = true;

    this.operationSubscription?.unsubscribe();
    this.operationSubscription = this.downloadService.deleteDownloadsForMedia(this.mediaId, this.mediaType)
      .pipe(take(1), finalize(() => this.operationWorking = false), takeUntil(this.destroy$))
      .subscribe();
  }

}
