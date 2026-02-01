import { Component, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { StartButtonComponent } from '../../../media-module/components/button/start-button/start-button.component';
import { ModifyButtonComponent } from '../../../media-module/components/button/modify-button/modify-button.component';
import { MylistButtonComponent } from '../../../media-module/components/button/mylist-button/mylist-button.component';
import { VolumeButtonComponent } from '../../../media-module/components/button/volume-button/volume-button.component';
import { RestreamButtonComponent } from '../../../media-module/components/button/restream-button/restream-button.component';
import { CompressedPosterService } from '../../../common-module/services/compressed-poster/compressed-poster.service';
import { VerifTimerShowService } from '../../../common-module/services/verif-timer/verif-timer-show.service';
import { CutoffButtonComponent } from '../../../media-module/components/button/cutoff-button/cutoff-button.component';
import { NewsVideoRunningModel } from '../../../news-module/models/news-video-running.interface';
import { StreamService } from '../../../video-playing-module/services/stream/stream.service';

@Component({
  selector: 'app-video-running-presentation',
  standalone: true,
  imports: [ModifyButtonComponent, VolumeButtonComponent, RestreamButtonComponent, MylistButtonComponent, StartButtonComponent, NgClass, CutoffButtonComponent],
  templateUrl: './video-running-presentation.component.html',
  styleUrls: ['./video-running-presentation.component.css', '../../../common-module/styles/animation.css']
})
export class VideoRunningPresentationComponent {

  @Input() newsMedia !: NewsVideoRunningModel;
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('mediaPresentationContainer', { static: false }) mediaContainer!: ElementRef;

  isVideoLoaded: boolean = false;
  currentVolume: number = 0;
  activateReStream: boolean = false;
  activateTransition: boolean = true;

  srcLogo !: string | undefined;
  srcBackground !: string | undefined;
  description: string | undefined = undefined;
  countMax: number = 300;

  observer !: IntersectionObserver;
  private isVisible = false;

  constructor(private readonly compressedPosterService: CompressedPosterService,
    private readonly streamService: StreamService
  ) { }

  ngOnInit(): void {
    this.srcLogo = this.compressedPosterService.getLogoForMediaPresentationTopHead(this.newsMedia.media);
    this.srcBackground = this.compressedPosterService.getBackgroundForNewsVideoRunning(this.newsMedia);

    if (this.newsMedia.media.description) {
      this.description = this.couperParagraphe(this.newsMedia.media.description, this.countMax);
    }
  }

  ngAfterViewInit(): void {
    this.startStreamingVideo();
    if (this.newsMedia.jellyfinId) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
          if (this.isVideoLoaded) {
            const video = this.videoRef.nativeElement;
            if (entry.isIntersecting) {
              video.play();
            } else {
              video.pause();
            }
          }
        });
      }, { threshold: 0 });

      if (this.mediaContainer) {
        this.observer.observe(this.mediaContainer.nativeElement);
      }
    }
  }

  onLoadedMetadata = () => {
    const video = this.videoRef.nativeElement;
    video.addEventListener('canplay', this.onCanPlay);
    video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
    if (!this.isVisible) {
      video.pause();
    }
  };

  onCanPlay = () => {
    const video = this.videoRef.nativeElement;
    video.removeEventListener('canplay', this.onCanPlay);
    this.isVideoLoaded = true;
  };

  volumeUpdate = () => {
    const video = this.videoRef.nativeElement;
    this.currentVolume = video.volume;
  }

  onVideoEnded = (): void => {
    this.stopStreamingVideo();
  };

  ngOnDestroy(): void {
    this.stopStreamingVideo();
  }

  startStreamingVideo(): void {
    const video = this.videoRef.nativeElement;
    if (video) {
      video.volume = this.currentVolume;
      video.addEventListener('loadedmetadata', this.onLoadedMetadata);
      video.addEventListener('volumechange', this.volumeUpdate);
      video.addEventListener('ended', this.onVideoEnded);
      video.src = this.streamService.getUrlStreamNews(this.newsMedia.id);
    }
  }

  stopStreamingVideo(): void {
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      video.removeEventListener('canplay', this.onCanPlay);
      video.removeEventListener('volumechange', this.volumeUpdate);
      video.removeEventListener('ended', this.onVideoEnded);
      video.src = '';
    }
    this.isVideoLoaded = false;
    this.activateTransition = true;
    this.activateReStream = true;
  }

  setNewStream(): void {
    if (this.activateReStream) {
      this.activateTransition = true;
      this.activateReStream = false;
      this.startStreamingVideo();
    }
  }

  onErrorImageBackgroud(): void {
    this.srcBackground = undefined;
  }

  onErrorImageLogo(): void {
    this.srcLogo = undefined;
  }

  setCurrentVolume(volume: number): void {
    const video = this.videoRef.nativeElement;
    video.volume = volume;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.activateTransition = false;
  }

  couperParagraphe(texte: string, limite: number): string {
    if (texte.length <= limite) return texte;

    const indexAvant = texte.lastIndexOf('.', limite);
    const indexApres = texte.indexOf('.', limite);

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
