import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { MediaTypeModel } from '../../../models/media-type.enum';
import { DownloadService } from '../../../services/download/download.service';
import { Observable, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-download-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './download-button.component.html',
  styleUrl: './download-button.component.css'
})
export class DownloadButtonComponent implements OnInit, OnDestroy {

  @Input() mediaId!: number;
  @Input() seasonId!: number;
  @Input() episodeId!: number;
  @Input() mediaType!: MediaTypeModel;

  heightCircle: number = 40;
  heightIcon: number = 20;
  widthBorder: number = 2;

  srcDownload: string = 'icon/dl.svg';

  downloaded: boolean = false;
  downloading: boolean = false;
  progress: number = 0;
  key: string = '';

  private progressSubscription?: Subscription;

  constructor(private readonly downloadService: DownloadService) { }

  ngOnInit(): void {
    if (this.mediaType === MediaTypeModel.EPISODE) {
      this.heightCircle = 30;
      this.heightIcon = 14;
      this.widthBorder = 1.5;
    }
    this.checkAlreadyDownloaded();
    if (this.mediaType === MediaTypeModel.MOVIE) {
      this.key = `${MediaTypeModel.MOVIE}-${this.mediaId}`;
    } else if (this.mediaType === MediaTypeModel.EPISODE) {
      this.key = `${MediaTypeModel.EPISODE}-${this.episodeId}`;
    }
  }

  ngOnDestroy(): void {
    this.progressSubscription?.unsubscribe();
  }

  private checkAlreadyDownloaded(): void {
    const isDownloaded$: Observable<boolean> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.isEpisodeDownloaded(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.isMovieDownloaded(this.mediaId);

    isDownloaded$.pipe(take(1)).subscribe((downloaded: boolean) => {
      this.downloaded = downloaded;
    });
  }

  onClick(): void {
    if (this.downloaded || this.downloading) return;

    this.downloading = true;
    this.progress = 0;
    
    this.progressSubscription?.unsubscribe();
    
    this.progressSubscription = this.downloadService.getDownloadProgress(this.key).subscribe((percent: number) => {
      this.progress = percent;
    });
    
    const download$: Observable<void> = this.mediaType === MediaTypeModel.EPISODE
      ? this.downloadService.downloadEpisode(this.mediaId, this.seasonId, this.episodeId)
      : this.downloadService.downloadMovie(this.mediaId);

    download$.pipe(take(1)).subscribe({
      next: () => {
        this.downloading = false;
        this.downloaded = true;
      },
      error: () => {
        this.downloading = false;
      }
    });
  }

}
