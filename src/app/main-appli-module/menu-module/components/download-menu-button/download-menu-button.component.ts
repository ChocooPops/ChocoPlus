import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HistoricProgressView, ProgressDownload, ProgressTypeOperation } from '../../../media-module/models/progress-download.interface';
import { DownloadService } from '../../../media-module/services/download/download.service';
import { GlobalFormattingService } from '../../../common-module/services/verif-timer/global-formatting.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';

interface Samples {
  time: number,
  bytes: number,
  speed: number
}

@Component({
  selector: 'app-download-menu-button',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './download-menu-button.component.html',
  styleUrl: './download-menu-button.component.css'
})
export class DownloadMenuButtonComponent {

  public srcDownload: string = 'icon/dl.svg';
  public srcMkvFile: string = 'icon/mkv_file.svg';
  public displayPulseDot: boolean = false;
  public ProgressTypeOperation = ProgressTypeOperation;

  public srcDlMovie: string = 'icon/dl_movie.svg';
  public srcDlSeries: string = 'icon/dl_series.svg';
  public srcDlDelete: string = 'icon/dl_delete.svg';
  public srcDlCancel: string = 'icon/dl_cancel.svg';

  public historicInProgress: HistoricProgressView[] = [];

  private readonly SPEED_REFRESH_INTERVAL_MS: number = 500;
  private readonly STALL_THRESHOLD_MS: number = 3000;
  private readonly SPEED_SMOOTHING_FACTOR: number = 0.3;

  private readonly lastSamples: Map<string, Samples> = new Map();
  private subscription!: Subscription;
  private stallInterval?: ReturnType<typeof setInterval>;

  constructor(private readonly router: Router,
    private readonly downloadService: DownloadService,
    private readonly globalFormattingService: GlobalFormattingService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.subscription = this.downloadService.getProgressChanged().subscribe(() => {
      const now: number = Date.now();
      const history: ProgressDownload[] = this.downloadService.getDownloadsHistory();
      const previousByKey: Map<string, HistoricProgressView> = new Map(
        this.historicInProgress.map((view: HistoricProgressView) => [view.key, view])
      );

      const historyKeys: Set<string> = new Set(history.map((historic: ProgressDownload) => historic.key));
      for (const key of this.lastSamples.keys()) {
        if (!historyKeys.has(key)) {
          this.lastSamples.delete(key);
        }
      }

      this.historicInProgress = history.map((historic: ProgressDownload) => {
        const isDeletion: boolean = historic.type === ProgressTypeOperation.DELETION;
        const isFinished: boolean = !isDeletion && historic.percent >= 100;

        if (isDeletion || isFinished) {
          this.lastSamples.delete(historic.key);
          return { ...historic, speedLabel: '', remainingLabel: '' };
        }

        const previousSample = this.lastSamples.get(historic.key);

        const hasNewBytes: boolean = !previousSample || historic.receivedBytes > previousSample.bytes;
        const elapsedSinceSample: number = previousSample ? now - previousSample.time : Infinity;

        if (!hasNewBytes || elapsedSinceSample < this.SPEED_REFRESH_INTERVAL_MS) {
          const previousView = previousByKey.get(historic.key);
          return {
            ...historic,
            speedLabel: previousView?.speedLabel ?? '',
            remainingLabel: previousView?.remainingLabel ?? ''
          };
        }

        const instantSpeed: number = this.computeSpeed(historic, previousSample, now);
        const bytesPerSecond: number = previousSample?.speed
          ? previousSample.speed * (1 - this.SPEED_SMOOTHING_FACTOR) + instantSpeed * this.SPEED_SMOOTHING_FACTOR
          : instantSpeed;
        this.lastSamples.set(historic.key, { time: now, bytes: historic.receivedBytes, speed: bytesPerSecond });

        return {
          ...historic,
          speedLabel: bytesPerSecond > 0 ? `${this.globalFormattingService.convertBytesToKiloMegaOrGiga(bytesPerSecond)}/s` : '',
          remainingLabel: bytesPerSecond > 0 ? this.formatRemaining((historic.totalBytes - historic.receivedBytes) / bytesPerSecond) : ''
        };
      });

      this.displayPulseDot = this.historicInProgress.some((item: HistoricProgressView) =>
        item && item.percent >= 0 && item.percent < 100
      );

      this.cdr.detectChanges();
    });

    this.ngZone.runOutsideAngular(() => {
      this.stallInterval = setInterval(() => this.clearStaleSpeeds(), 1000);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    clearInterval(this.stallInterval);
  }

  private clearStaleSpeeds(): void {
    const now: number = Date.now();
    let changed: boolean = false;

    this.historicInProgress = this.historicInProgress.map((view: HistoricProgressView) => {
      if (view.type !== ProgressTypeOperation.DOWNLOAD || view.percent >= 100) return view;
      if (!view.speedLabel && !view.remainingLabel) return view;

      const sample = this.lastSamples.get(view.key);
      const isStale: boolean = !sample || now - sample.time > this.STALL_THRESHOLD_MS;
      if (!isStale) return view;

      this.lastSamples.delete(view.key);
      changed = true;
      return { ...view, speedLabel: '', remainingLabel: '' };
    });

    if (changed) {
      this.cdr.detectChanges();
    }
  }

  onClick(): void {
    this.router.navigateByUrl('main-app/downloads');
  }

  public convertReceivedBytes(receivedBytes: number, totalBytes: number): string {
    if (this.globalFormattingService.isGiga(totalBytes)) {
      return this.globalFormattingService.convertBytesToGiga(receivedBytes);
    } else {
      return this.globalFormattingService.convertBytesToMega(receivedBytes);
    }
  }

  public convertTotalBytes(totalBytes: number): string {
    return this.globalFormattingService.convertBytesToMegaOrGiga(totalBytes);
  }

  private computeSpeed(historic: ProgressDownload, previous: Samples | undefined, now: number): number {
    if (!previous) return 0;

    const deltaBytes: number = historic.receivedBytes - previous.bytes;
    const deltaSeconds: number = (now - previous.time) / 1000;
    return deltaBytes > 0 && deltaSeconds > 0 ? deltaBytes / deltaSeconds : 0;
  }
  
  private formatRemaining(seconds: number): string {
    if (!isFinite(seconds) || seconds <= 0) return '';

    const remainingLabel: string = this.translateService.instant('DOWNLOAD.REMAINING');

    if (seconds < 60) {
      const secondUnit: string = this.translateService.instant('DOWNLOAD.TIME_SECOND_SHORT');
      return `${Math.max(1, Math.ceil(seconds))} ${secondUnit} ${remainingLabel}`;
    }

    const minuteUnit: string = this.translateService.instant('DOWNLOAD.TIME_MINUTE_SHORT');
    const totalMinutes: number = Math.ceil(seconds / 60);

    if (totalMinutes < 60) {
      return `${totalMinutes} ${minuteUnit} ${remainingLabel}`;
    }

    const hourUnit: string = this.translateService.instant('DOWNLOAD.TIME_HOUR_SHORT');
    const hours: number = Math.floor(totalMinutes / 60);
    const minutes: number = totalMinutes % 60;
    return `${hours} ${hourUnit} ${String(minutes).padStart(2, '0')} ${minuteUnit} ${remainingLabel}`;
  }

  public getSrcIcon(key: string): string {
    if (key.startsWith(`${MediaTypeModel.MOVIE}-`)) {
      return this.srcDlMovie;
    } else {
      return this.srcDlSeries;
    }
  }

}
