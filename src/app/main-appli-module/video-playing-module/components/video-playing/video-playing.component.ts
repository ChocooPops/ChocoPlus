import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription, map, switchMap, distinctUntilChanged, filter, EMPTY } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HiddenComponentService } from '../../../menu-module/service/hidden-component/hidden-component.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { NgClass } from '@angular/common';
import { BtFullscreenComponent } from '../bt-fullscreen/bt-fullscreen.component';
import { BtVolumeComponent } from '../bt-volume/bt-volume.component';
import { BtSubtitleComponent } from '../bt-subtitle/bt-subtitle.component';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { BtBackComponent } from '../bt-back/bt-back.component';
import { ActionKeyComponent } from '../action-key/action-key.component';
import { BtQualityComponent } from '../bt-quality/bt-quality.component';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { ErrorVideoComponent } from '../error-video/error-video.component';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { BtSeriesComponent } from '../bt-series/bt-series.component';
import { StreamService } from '../../services/stream/stream.service';
import { StreamInfoModel } from '../../models/stream.interface';

@Component({
  selector: 'app-video-playing',
  standalone: true,
  imports: [ProgressBarComponent, NgClass, BtSeriesComponent, BtBackComponent, ActionKeyComponent, BtClassicComponent, BtSubtitleComponent, BtFullscreenComponent, BtVolumeComponent, BtQualityComponent, ErrorVideoComponent],
  templateUrl: './video-playing.component.html',
  styleUrls: ['./video-playing.component.css']
})

export class VideoPlayingComponent {

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('trackRef') trackRef !: ElementRef<HTMLVideoElement>;
  @ViewChild(ProgressBarComponent) progressBarVideo !: ProgressBarComponent;
  @ViewChild(BtVolumeComponent) progressBarVolume !: BtVolumeComponent;

  srcImagePlay: string = 'icon/controls/play.svg';
  srcImagePause: string = 'icon/controls/stop.svg';
  isReading: boolean = false;

  srcImageBacktracking: string = 'icon/controls/fast-backtracking.svg';
  srcImageForward: string = 'icon/controls/fast-forward.svg';
  isBacktracking: boolean = false;
  isForward: boolean = false;

  isFullScreen !: boolean;
  srcVideo !: string;
  media !: any;
  beginIdx !: number;
  MediaType = MediaTypeModel;
  isVideoLoaded: boolean = false;

  currentTimeTravelled: number = 0;
  currentTimeAfterChangedAudio: number = 0;
  totalDurationMedia: number = 0;
  speed: number = 15;

  title: string = "Chargement ...";

  currentVolume: number = 0.5;
  volumeIntensityChanged: number = 0.1;

  whatDimension!: boolean;
  keyForward: string = "icon/controls/forwardSpeed.svg";
  keyBacktracking: string = "icon/controls/backtrackingSpeed.svg";
  keySoundMute: string = "icon/controls/keySound0.svg";
  keySoundLow: string = "icon/controls/keySound1.svg";
  keySoundMedium: string = "icon/controls/keySound2.svg";
  keySoundHigh: string = "icon/controls/keySound3.svg";
  keySound !: string;
  keyPlay !: string;

  keySpacePressed: boolean = true;
  keyRightPressed: boolean = true;
  keyLeftPressed: boolean = true;
  keyUpDownPressed: boolean = true;

  timerMouse: any;
  refreshmentTimer: number = 2000;

  private subscription: Subscription = new Subscription();

  displayControls: boolean = true;
  displayControlsWhenActivated: boolean = false;
  displayError: boolean = false;

  audios: { name: string, index: number }[] = [];
  subtitles: { name: string, index: number }[] = [];
  currentAudioIndex !: number;
  currentSubtitleIndex: number = -1;
  srcPoster: string = '';

  constructor(private streamService: StreamService,
    private route: ActivatedRoute,
    private hiddenComponentService: HiddenComponentService,
    private imagePreloaderService: ImagePreloaderService,
    private scrollEventService: ScrollEventService
  ) {
    this.hiddenComponentService.hiddenComponent();
  }

  ngOnInit(): void {
    this.imagePreloaderService.preloadControllersStreamVideo();
    this.scrollEventService.disableScrollEvent();
  }

  ngAfterViewInit(): void {
    this.subscription = this.route.paramMap.pipe(
      map(pm => ({
        mediaType: pm.get('mediaType') as MediaTypeModel | null,
        id: pm.get('id'),
        idSeries: pm.get('idSeries'),
        idSeason: pm.get('idSeason'),
        idEpisode: pm.get('idEpisode')
      })),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      filter(params => {
        return (params.mediaType === MediaTypeModel.MOVIE && !!params.id)
          || (params.mediaType === MediaTypeModel.SERIES && !!params.idSeries && !!params.idSeason && !!params.idEpisode);
      }),
      switchMap(params => {
        if (params.mediaType === MediaTypeModel.MOVIE && params.id) {
          //return this.streamService.fetchGetStreamInfoMovie(Number(params.id));
        }
        if (params.mediaType === MediaTypeModel.SERIES &&
          params.idSeries && params.idSeason && params.idEpisode) {
          return EMPTY;
        }
        return EMPTY;
      })
    ).subscribe({
      next: (stream: StreamInfoModel) => {
        this.currentTimeAfterChangedAudio = 0;
        this.currentTimeTravelled = 0;
        this.srcVideo = stream.url;
        this.title = stream.title;
        this.media = stream.media;
        this.beginIdx = stream.idx;
        this.audios = stream.audios;
        this.subtitles = stream.subtitles;
        this.srcPoster = stream.media.srcBackgroundImage || '';
        this.currentAudioIndex = this.getAudioStreamIndex(this.srcVideo);
        this.startStreamingVideo();
      },
      error: (error) => {
        this.onError(error);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.hiddenComponentService.displayComponent();
    this.scrollEventService.enableScrollEvent();
    this.stopStreamingVideo();
  }

  private startStreamingVideo(): void {
    this.stopStreamingVideo();
    const video = this.videoRef.nativeElement;
    if (video) {
      video.volume = this.currentVolume;
      video.addEventListener('error', this.onError);
      video.addEventListener('loadedmetadata', this.onLoadMetadata);
      video.addEventListener('timeupdate', this.timeUpdate);
      video.addEventListener('play', this.onPlay);
      video.addEventListener('pause', this.onPause);
      video.addEventListener('volumechange', this.volumeUpdate);
      video.src = this.srcVideo;
    }
  }

  private stopStreamingVideo(): void {
    const video = this.videoRef.nativeElement;
    if (video) {
      const currentTimer = this.currentTimeTravelled
      video.removeEventListener('error', this.onError);
      video.removeEventListener('loadedmetadata', this.onLoadMetadata);
      video.removeEventListener('timeupdate', this.timeUpdate);
      video.removeEventListener('play', this.onPlay);
      video.removeEventListener('pause', this.onPause);
      video.removeEventListener('volumechange', this.volumeUpdate);
      video.src = '';
      this.currentTimeAfterChangedAudio = currentTimer;
    }
    this.isVideoLoaded = false;
  }

  private getAudioStreamIndex(url: string): number {
    const match = url.match(/AudioStreamIndex=(\d+)/);
    const id: number = match ? parseInt(match[1], 10) : 0;
    if (id > 0) {
      return id;
    } else {
      return this.audios[0].index;
    }
  }

  onChangeAudio(audio: number): void {
    this.srcVideo = this.streamService.getUrlStreamMovie(this.media.id);
    this.currentAudioIndex = audio;
    this.startStreamingVideo();
  }
  onChangeSubtitles(subId: number): void {
    const track = this.trackRef.nativeElement;
    if (subId >= 0) {
      track.src = ""
    } else {
      track.src = "";
    }
    this.currentSubtitleIndex = subId;
  }

  onMouseMovieIntoAllInterface(event: MouseEvent): void {
    this.progressBarVideo.onDragProgressBar(event);
    this.progressBarVolume.onDragSound(event);
    this.displayControls = true;
    this.startTimerMouse();
  }

  onMouseUpIntoInterface(event: MouseEvent): void {
    this.progressBarVideo.endDragProgressBar(event);
    this.progressBarVolume.endDragSound(event);
  }

  onMouseLeaveFromWindow(): void {
    this.displayControls = false;
    this.stopTimer();
  }

  startTimerMouse(): void {
    this.stopTimer();
    this.timerMouse = setTimeout(() => {
      if (!this.displayControlsWhenActivated) {
        this.displayControls = false;
      }
      this.stopTimer();
    }, this.refreshmentTimer);
  }

  stopTimer(): void {
    if (this.timerMouse) {
      clearTimeout(this.timerMouse);
      this.timerMouse = null;
    }
  }

  private onLoadMetadata = () => {
    const video = this.videoRef.nativeElement;
    video.currentTime = this.currentTimeAfterChangedAudio;
    const height: number = video.videoHeight;
    const width: number = video.videoWidth;
    if (height > width) {
      this.whatDimension = true;
    } else {
      this.whatDimension = false;
    }
    this.isVideoLoaded = true;
    this.totalDurationMedia = video.duration;
  }

  private timeUpdate = () => {
    const video = this.videoRef.nativeElement;
    this.currentTimeTravelled = video.currentTime;
  }

  private onPlay = () => {
    this.isReading = false;
    this.keyPlay = this.srcImagePlay;
  }

  private onPause = () => {
    this.isReading = true;
    this.keyPlay = this.srcImagePause;
  }

  private volumeUpdate = () => {
    const video = this.videoRef.nativeElement;
    this.currentVolume = video.volume;
  }

  public onClickVolume(intensity: number) {
    const video = this.videoRef.nativeElement;
    video.volume = intensity;
  }

  public changeCurrentTime(time: number): void {
    const video = this.videoRef.nativeElement;
    if (video && this.isVideoLoaded) {
      video.currentTime = time;
    }
  }

  public setPauseOrPlayVideo(): void {
    this.isReading = !this.isReading;
    const video = this.videoRef.nativeElement;
    if (this.isReading) {
      video.pause();
    } else {
      video.play();
    }
  }

  public changedVolumeIntensityByKey(state: boolean): void {
    const video = this.videoRef.nativeElement;
    if (state) {
      const newVolume: number = video.volume + this.volumeIntensityChanged;
      if (newVolume > 1) {
        video.volume = 1;
      } else if (newVolume <= 1) {
        video.volume = newVolume;
      }
    } else {
      const newVolume: number = video.volume - this.volumeIntensityChanged;
      if (newVolume < 0) {
        video.volume = 0;
      } else if (newVolume >= 0) {
        video.volume = newVolume;
      }
    }
  }

  public onClickBacktracking(): void {
    this.isBacktracking = !this.isBacktracking;
    this.makeBacktrackingOrForward(false);
  }

  public onClickForward(): void {
    this.isForward = !this.isForward;
    this.makeBacktrackingOrForward(true);
  }

  private makeBacktrackingOrForward(typeOp: boolean): void {
    const video = this.videoRef.nativeElement;
    if (typeOp) {
      video.currentTime = this.currentTimeTravelled + this.speed;
    } else {
      video.currentTime = this.currentTimeTravelled - this.speed;
    }
  }

  onClickVideo(): void {
    this.setPauseOrPlayVideo();
    this.startTimerMouse();
    this.displayControls = true;
  }

  setSoundImageAccordingToIntensity(): void {
    const video = this.videoRef.nativeElement;
    if (video.volume <= 0) {
      this.keySound = this.keySoundMute;
    } else if (video.volume < 0.3) {
      this.keySound = this.keySoundLow;
    } else if (video.volume < 0.7) {
      this.keySound = this.keySoundMedium;
    } else {
      this.keySound = this.keySoundHigh;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === " ") {
      event.preventDefault();
      this.setPauseOrPlayVideo();
      this.keySpacePressed = !this.keySpacePressed;
    }
    if (event.key === "ArrowRight") {
      this.onClickForward();
      this.keyRightPressed = !this.keyRightPressed;
    }
    if (event.key === "ArrowLeft") {
      this.onClickBacktracking();
      this.keyLeftPressed = !this.keyLeftPressed;
    }
    if (event.key === "ArrowUp") {
      this.changedVolumeIntensityByKey(true);
      this.setSoundImageAccordingToIntensity();
      this.keyUpDownPressed = !this.keyUpDownPressed;
    }
    if (event.key === "ArrowDown") {
      this.changedVolumeIntensityByKey(false);
      this.setSoundImageAccordingToIntensity();
      this.keyUpDownPressed = !this.keyUpDownPressed;
    }
  }

  onClickControllers(event: Event) {
    event.stopPropagation();
    this.startTimerMouse();
    this.displayControls = true;
  }

  onError(error: any): void {
    console.log(error)
    this.displayError = true;
  }

  setDisplayControlsWhenActivated(op: boolean): void {
    this.displayControlsWhenActivated = op;
  }

}