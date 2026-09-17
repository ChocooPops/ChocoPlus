import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { StorageInfoModel } from '../../../media-module/models/storage-info.interface';

type StorageSegment = 'other' | 'downloads' | 'cache' | 'free';

@Component({
  selector: 'app-storage-repartition',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './storage-repartition.component.html',
  styleUrl: './storage-repartition.component.css'
})
export class StorageRepartitionComponent {

  private readonly GIGABYTE: number = 1024 ** 3;

  loaded: boolean = false;
  animated: boolean = false;
  hoveredSegment: StorageSegment | null = null;

  totalBytes: number = 0;
  otherBytes: number = 0;
  downloadsBytes: number = 0;
  cacheBytes: number = 0;
  freeBytes: number = 0;

  percentOther: number = 0;
  percentDownloads: number = 0;
  percentCache: number = 0;
  percentFree: number = 0;

  usedFormatted: string = '';
  totalFormatted: string = '';

  constructor(private readonly downloadService: DownloadService) { }

  ngOnInit(): void {
    this.downloadService.getStorageInfo().pipe(take(1)).subscribe((info: StorageInfoModel) => {
      this.applyStorageInfo(info);
    });
  }

  private applyStorageInfo(info: StorageInfoModel): void {
    const total: number = info.totalBytes || 0;
    const free: number = Math.max(0, Math.min(info.freeBytes || 0, total));
    const downloads: number = Math.max(0, info.downloadsBytes || 0);
    const cache: number = Math.max(0, info.cacheBytes || 0);
    const other: number = Math.max(0, total - free - downloads - cache);

    this.totalBytes = total;
    this.freeBytes = free;
    this.downloadsBytes = downloads;
    this.cacheBytes = cache;
    this.otherBytes = other;

    if (total > 0) {
      this.percentOther = (other / total) * 100;
      this.percentDownloads = (downloads / total) * 100;
      this.percentCache = (cache / total) * 100;
      this.percentFree = (free / total) * 100;
    }

    this.usedFormatted = this.formatGo(total - free);
    this.totalFormatted = this.formatGo(total);

    this.loaded = total > 0;

    if (this.loaded) {
      // Laisse les segments s'afficher à 0% avant d'appliquer leur largeur pour déclencher la transition
      setTimeout(() => this.animated = true, 50);
    }
  }

  formatGo(bytes: number): string {
    return (bytes / this.GIGABYTE).toFixed(1).replace('.', ',');
  }

  onSegmentEnter(segment: StorageSegment): void {
    this.hoveredSegment = segment;
  }

  onSegmentLeave(): void {
    this.hoveredSegment = null;
  }

}
