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
import { SoundVideoService } from '../../../common-module/services/sound-video/sound-video.service';
import { CutoffButtonComponent } from '../../../media-module/components/button/cutoff-button/cutoff-button.component';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { StreamService } from '../../../video-playing-module/services/stream/stream.service';
import { SeasonModel } from '../../../media-module/models/series/season.interface';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { DetailButtonComponent } from '../../../media-module/components/button/detail-button/detail-button.component';
import { MediaFocusService } from '../../../../common-module/services/media-focus/media-focus.service';
import { Subscription } from 'rxjs';

// Trailer of the movie / series pages. It doesn't disturb a video being watched (MediaFocusService):
// paused while a player is open, it goes on when the player closes; its autoplay waits for the player to close.
// Started by the user with the button, it takes the focus: the video of the player pauses. When that video
// plays again (or another one starts), the trailer is cut (stopStreamingVideo), not just paused.
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

  private readonly focusOwner: symbol = Symbol('trailer');
  private focusSubscription?: Subscription;
  // Stream started (loading or loaded) and not stopped
  private isStreaming: boolean = false;
  // Paused because another media has the focus: goes on when it comes back
  private pausedByFocus: boolean = false;
  // Autoplay held back by a player: starts when the player closes
  private autoStartPending: boolean = false;
  // Started with the restream button (holds the focus): cut when a video takes the focus back
  private startedByUser: boolean = false;

  constructor(private readonly compressedPosterService: CompressedPosterService,
    private readonly streamService: StreamService,
    private readonly autoPlayVideoService: AutoPlayVideoService,
    private readonly mediaLogoDisplayService: MediaLogoDisplayService,
    private readonly soundVideoService: SoundVideoService,
    private readonly mediaFocusService: MediaFocusService
  ) { }

  ngOnInit(): void {
    this.showLogo = this.mediaLogoDisplayService.getShowLogo();
    this.currentVolume = this.soundVideoService.getInitialVolume();
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentationTopHead(this.newsMedia.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForNewsVideoRunning(this.newsMedia);
    this.seasons = (this.newsMedia.media as SeriesModel).seasons;

    if (this.newsMedia.media.description) {
      this.description = this.couperParagraphe(this.newsMedia.media.description, this.countMax);
    }

    this.activateReStream = !this.autoPlayVideoService.getAutoPlayVideo();
    // A video is being watched: no autoplay behind it (the button can still start the trailer)
    if (!this.activateReStream && !this.mediaFocusService.isFreeFor(this.focusOwner)) {
      this.autoStartPending = true;
      this.activateReStream = true;
    }
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
    this.focusSubscription = this.mediaFocusService.owner$.subscribe(() => this.onFocusChange());
  }

  ngOnDestroy(): void {
    this.focusSubscription?.unsubscribe();
    this.observer?.disconnect();
    this.stopStreamingVideo();
  }

  private get hasFocus(): boolean {
    return this.mediaFocusService.isFreeFor(this.focusOwner);
  }

  private onFocusChange(): void {
    const video = this.videoRef?.nativeElement;
    if (!this.hasFocus) {
      // The user went back to the video: the trailer they had started is cut
      if (this.startedByUser && this.isStreaming) {
        this.stopStreamingVideo();
        return;
      }
      // Also cancels the autoplay of a trailer still loading
      if (video && this.isStreaming) {
        video.pause();
        this.pausedByFocus = true;
      }
      return;
    }
    if (this.autoStartPending) {
      this.autoStartPending = false;
      this.restartStream();
    } else if (this.pausedByFocus) {
      this.pausedByFocus = false;
      this.applyVisibility();
    }
  }

  private applyVisibility(): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.isVideoLoaded) return;
    if (this.isVisible && this.hasFocus) {
      video.play().catch((error: DOMException) => {
        if (error.name === 'NotAllowedError' && video.volume > 0) {
          video.volume = 0;
          video.play().catch(() => { /* autoplay disabled or playback paused */ });
        }
      });
    } else {
      video.pause();
    }
  }

  onLoadedMetadata = (): void => {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    video.addEventListener('canplay', this.onCanPlay);
    if (!this.isVisible || !this.hasFocus) video.pause();
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
    this.isStreaming = true;
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
    this.isStreaming = false;
    this.pausedByFocus = false;
    this.startedByUser = false;
    this.mediaFocusService.release(this.focusOwner);
  }

  // Restream button: the user wants to watch the trailer, the video of the player pauses
  setNewStream(): void {
    if (!this.activateReStream) return;
    this.autoStartPending = false;
    this.mediaFocusService.claim(this.focusOwner);
    this.startedByUser = true;
    this.restartStream();
  }

  private restartStream(): void {
    this.activateTransition = true;
    this.activateReStream = false;
    this.startStreamingVideo();
  }

  setCurrentVolume(volume: number): void {
    this.soundVideoService.setSessionVolume(volume);
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