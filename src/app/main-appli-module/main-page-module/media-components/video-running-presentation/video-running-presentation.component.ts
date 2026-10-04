import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../../media-module/components/button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../../media-module/components/button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../../media-module/components/button/mylist-button/mylist-button.component';
import { VolumeButtonComponent } from '../../../media-module/components/button/volume-button/volume-button.component';
import { RestreamButtonComponent } from '../../../media-module/components/button/restream-button/restream-button.component';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { AutoPlayVideoService } from '../../../common-module/services/auto-play-video/auto-play-video.service';
import { MediaLogoDisplayService } from '../../../common-module/services/media-logo-display/media-logo-display.service';
import { CutoffButtonComponent } from '../../../media-module/components/button/cutoff-button/cutoff-button.component';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { StreamService } from '../../../video-playing-module/services/stream/stream.service';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { DetailButtonComponent } from '../../../media-module/components/button/detail-button/detail-button.component';

@Component({
  selector: 'app-video-running-presentation',
  standalone: true,
  imports: [DetailButtonComponent, ModifyButtonComponent, VolumeButtonComponent, RestreamButtonComponent, MylistButtonComponent, StartButtonComponent, NgClass, CutoffButtonComponent],
  templateUrl: './video-running-presentation.component.html',
  styleUrls: ['./video-running-presentation.component.css', '../../../common-module/styles/animation.css']
})
export class VideoRunningPresentationComponent {

  @Input({ required: true }) newsMedia!: NewsVideoRunningModel;
  @ViewChild('videoElement') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('mediaPresentationContainer') mediaContainer?: ElementRef<HTMLElement>;

  isVideoLoaded: boolean = false;
  currentVolume: number = 0;
  activateReStream: boolean = false;
  activateTransition: boolean = true;

  srcLogo: string | undefined;
  showLogo: boolean = true;
  srcBackground: string | undefined;
  description: string | undefined = undefined;
  readonly countMax: number = 300;
  seasons: SeasonModel[] | undefined = undefined;

  private observer?: IntersectionObserver;
  private isVisible: boolean = true;

  constructor(private readonly compressedPosterService: CompressedPosterService,
    private readonly streamService: StreamService,
    private readonly autoPlayVideoService: AutoPlayVideoService,
    private readonly mediaLogoDisplayService: MediaLogoDisplayService
  ) { }

  ngOnInit(): void {
    this.showLogo = this.mediaLogoDisplayService.getShowLogo();
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentationTopHead(this.newsMedia.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForNewsVideoRunning(this.newsMedia);
    this.seasons = (this.newsMedia.media as SeriesModel).seasons;

    if (this.newsMedia.media.description) {
      this.description = this.couperParagraphe(this.newsMedia.media.description, this.countMax);
    }

    this.activateReStream = !this.autoPlayVideoService.getAutoPlayVideo();
  }

  ngAfterViewInit(): void {
    if (this.newsMedia.mediaLibraryId && this.mediaContainer) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
          this.applyVisibility();
        });
      }, { threshold: 0 });
      this.observer.observe(this.mediaContainer.nativeElement);
    }

    if (!this.activateReStream) {
      this.startStreamingVideo();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.stopStreamingVideo();
  }

  private applyVisibility(): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.isVideoLoaded) return;
    if (this.isVisible) {
      video.play().catch(() => { /* autoplay disabled or playback paused */ });
    } else {
      video.pause();
    }
  }

  onLoadedMetadata = (): void => {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    video.addEventListener('canplay', this.onCanPlay);
    if (!this.isVisible) video.pause();
  };

  onCanPlay = (): void => {
    this.videoRef?.nativeElement.removeEventListener('canplay', this.onCanPlay);
    this.isVideoLoaded = true;
    this.applyVisibility();
  };

  volumeUpdate = (): void => {
    const video = this.videoRef?.nativeElement;
    if (video) this.currentVolume = video.volume;
  };

  onVideoEnded = (): void => {
    this.stopStreamingVideo();
  };

  startStreamingVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.volume = this.currentVolume;
    video.addEventListener('loadedmetadata', this.onLoadedMetadata);
    video.addEventListener('volumechange', this.volumeUpdate);
    video.addEventListener('ended', this.onVideoEnded);
    video.src = this.streamService.getUrlStreamNews(this.newsMedia.id);
  }

  stopStreamingVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      video.removeEventListener('canplay', this.onCanPlay);
      video.removeEventListener('volumechange', this.volumeUpdate);
      video.removeEventListener('ended', this.onVideoEnded);
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    this.isVideoLoaded = false;
    this.activateTransition = true;
    this.activateReStream = true;
  }

  setNewStream(): void {
    if (!this.activateReStream) return;
    this.activateTransition = true;
    this.activateReStream = false;
    this.startStreamingVideo();
  }

  setCurrentVolume(volume: number): void {
    const video = this.videoRef?.nativeElement;
    if (video) video.volume = volume;
  }

  onErrorBackground(): void {
    this.srcBackground = undefined;
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.activateTransition = false;
  }

  couperParagraphe(texte: string, limite: number): string {
    if (texte.length <= limite) return texte;

    const indexAvant: number = texte.lastIndexOf('.', limite);
    const indexApres: number = texte.indexOf('.', limite);

    let indexCoupe: number;
    if (indexAvant !== -1) {
      indexCoupe = indexAvant + 1;
    } else if (indexApres !== -1) {
      indexCoupe = indexApres + 1;
    } else {
      indexCoupe = limite;
    }

    return texte.substring(0, indexCoupe).trim();
  }

}