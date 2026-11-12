import { Component, ElementRef, HostBinding, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HiddenComponentService } from '../../../menu-module/service/hidden-component/hidden-component.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { NgClass } from '@angular/common';
import { BtFullscreenComponent } from '../bt-fullscreen/bt-fullscreen.component';
import { BtVolumeComponent } from '../bt-volume/bt-volume.component';
import { BtSubtitleComponent } from '../bt-subtitle/bt-subtitle.component';
import { BtClassicComponent } from '../bt-classic/bt-classic.component';
import { BtBackComponent } from '../bt-back/bt-back.component';
import { ActionKeyComponent } from '../action-key/action-key.component';
import { ImagePreloaderService } from '../../../../common-module/services/image-preloader/image-preloader.service';
import { ScrollEventService } from '../../../common-module/services/scroll-event/scroll-event.service';
import { ErrorVideoComponent } from '../error-video/error-video.component';
import { MediaTypeModel } from '../../../media-module/models/media-type.enum';
import { MediaModel } from '../../../media-module/models/media.interface';
import { SeriesModel } from '../../../media-module/models/series/series.interface';
import { BtSeriesComponent } from '../bt-series/bt-series.component';
import { StreamService } from '../../services/stream/stream.service';
import { TranslationLanguageService } from '../../../../common-module/services/translation-language/translation-language.service';
import { PlayerLaunchRequest, PlayerMediaInfo, PlayerSubtitleTrack, PlayerTrackOption } from '../../models/player.interface';
import { MsePlayerEngine, chooseVideoMode } from '../../services/player-engine/mse-player-engine';
import { SubtitleCueStore, SubtitleLine, parseCueText } from '../../services/player-engine/subtitle-cues';
import { PgsCanvasRenderer, PgsFrame, PgsTrackStore } from '../../services/player-engine/pgs-subtitles';
import { NextEpisodeResult, NextEpisodeService } from '../../services/next-episode/next-episode.service';
import { NextEpisodeCardComponent } from '../next-episode-card/next-episode-card.component';
import { PlayerMode, PlayerSessionService } from '../../services/player-session/player-session.service';
import { FullscreenService } from '../../../../common-module/services/fullscreen/fullscreen.service';
import {
  TrackLabels, describeAudioTrack, describeSubtitleTrack, loadTrackPreferences, pickAudioTrack, pickSubtitleTrack,
  saveTrackPreferences, toAudioPreference, toSubtitlePreference
} from '../../services/player-engine/player-tracks';
import { EpisodeSelection } from '../bt-series/bt-series.component';
import { MediaFocusService } from '../../../../common-module/services/media-focus/media-focus.service';
import {
  MINI_RESIZE_HANDLES, MiniPlayerGeometry, MiniPlayerRect, MiniPlayerViewport, MiniResizeHandle, fromMiniRect, loadMiniGeometry,
  moveMiniRect, resizeMiniRect, saveMiniGeometry, toMiniRect
} from '../../services/player-session/mini-player-geometry';

// The internal player. Not a page: the app shells (main and offline) show it over the pages while
// PlayerSessionService has a media open, in full screen or as a mini player in a corner. The same instance
// (video, stream, subtitles, next episode...) goes from one mode to the other, so playback never stops.
// The mini player can be moved and resized. While the player is open, the media of the pages (trailers,
// game music) stay paused (MediaFocusService).
@Component({
  selector: 'app-video-playing',
  standalone: true,
  imports: [ProgressBarComponent, NgClass, BtSeriesComponent, BtBackComponent, ActionKeyComponent, BtClassicComponent, BtSubtitleComponent, BtFullscreenComponent, BtVolumeComponent, ErrorVideoComponent, NextEpisodeCardComponent, TranslatePipe],
  templateUrl: './video-playing.component.html',
  styleUrls: ['./video-playing.component.css']
})

export class VideoPlayingComponent implements OnInit, OnDestroy {

  @ViewChild('videoRef', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('pgsCanvas', { static: true }) pgsCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild(ProgressBarComponent) progressBarVideo ?: ProgressBarComponent;
  @ViewChild(BtVolumeComponent) progressBarVolume ?: BtVolumeComponent;

  mode: PlayerMode = 'closed';

  @HostBinding('class')
  get hostClass(): string {
    return `player-${this.mode}`;
  }

  srcImagePlay: string = 'icon/controls/play.svg';
  srcImagePause: string = 'icon/controls/stop.svg';
  readonly srcImageMiniPlayer: string = 'icon/controls/mini-player.svg';
  readonly srcImageExpand: string = 'icon/controls/fullscreen.svg';
  readonly srcImageClose: string = 'icon/close.svg';
  isReading: boolean = false;

  srcImageBacktracking: string = 'icon/controls/fast-backtracking.svg';
  srcImageForward: string = 'icon/controls/fast-forward.svg';
  isBacktracking: boolean = false;
  isForward: boolean = false;

  media: MediaModel | undefined;
  beginIdx: number = 0;
  MediaType = MediaTypeModel;
  isVideoLoaded: boolean = false;
  isBuffering: boolean = true;

  currentTimeTravelled: number = 0;
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

  audios: PlayerTrackOption[] = [];
  subtitles: PlayerTrackOption[] = [];
  currentAudioIndex: number = -1;
  currentSubtitleIndex: number = -1;
  subtitleLines: SubtitleLine[] = [];
  srcPoster: string = '';

  private request: PlayerLaunchRequest | null = null;
  private info: PlayerMediaInfo | null = null;
  private engine: MsePlayerEngine | null = null;
  private readonly cueStore = new SubtitleCueStore();
  private trackPreferences = loadTrackPreferences();
  private loadCounter: number = 0;
  // loadId of PlayerSessionService already loaded
  private loadedId: number = -1;
  private hasPlayed: boolean = false;
  private isDestroyed: boolean = false;
  private lastProgressSave: number = 0;
  private readonly progressSaveInterval: number = 60000;
  private removeCueListener: (() => void) | null = null;
  private subtitleFrame: number | null = null;
  private activeCueKey: string = '';

  // PGS (image) subtitles: one store per track received, drawn on the canvas over the video
  private readonly pgsStores = new Map<number, PgsTrackStore>();
  private readonly pgsRenderer = new PgsCanvasRenderer();
  private removePgsListener: (() => void) | null = null;
  private removeClosedListener: (() => void) | null = null;
  private lastPgsFrame: PgsFrame | null = null;
  private pgsCanvasDirty: boolean = true;

  // Next episode: proposed during the last seconds, played when the countdown started at the end runs out
  nextEpisode: NextEpisodeResult | null = null;
  nextEpisodeLabel: string = '';
  displayNextEpisode: boolean = false;
  nextEpisodeCountdown: number | null = null;
  private nextEpisodeDismissed: boolean = false;
  private nextEpisodeTimer: ReturnType<typeof setInterval> | null = null;
  private readonly nextEpisodePromptSeconds: number = 30;
  private readonly nextEpisodeCountdownSeconds: number = 10;

  // Only one media heard at a time: the player takes the focus when it opens and when its video plays
  private readonly focusOwner: symbol = Symbol('internal-player');

  // Mini player: moved by dragging it, resized from its edges and corners
  readonly miniResizeHandles: MiniResizeHandle[] = MINI_RESIZE_HANDLES;
  private miniGeometry: MiniPlayerGeometry = loadMiniGeometry();
  private endMiniGesture: (() => void) | null = null;
  // The click ending a drag must not bring the player back to full screen
  private suppressMiniClick: boolean = false;
  // Full screen: the click ending a drag of the progress / volume bar must not pause the video
  private suppressDragEndClick: boolean = false;
  // Pixels the mouse must move before a press becomes a drag (below: a click)
  private readonly miniDragThreshold: number = 4;

  constructor(private streamService: StreamService,
    private playerSessionService: PlayerSessionService,
    private router: Router,
    private hiddenComponentService: HiddenComponentService,
    private imagePreloaderService: ImagePreloaderService,
    private scrollEventService: ScrollEventService,
    private fullscreenService: FullscreenService,
    private translationLanguageService: TranslationLanguageService,
    private translateService: TranslateService,
    private nextEpisodeService: NextEpisodeService,
    private mediaFocusService: MediaFocusService,
    private hostRef: ElementRef<HTMLElement>,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.imagePreloaderService.preloadControllersStreamVideo();
    this.attachVideoListeners();
    this.removeCueListener = this.streamService.onPlayerSubtitleCues((event) => {
      if (this.info && event.sourceId === this.info.sourceId) {
        this.cueStore.add(event.streamIndex, event.cues);
      }
    });
    this.removePgsListener = this.streamService.onPlayerPgsDisplaySets((event) => {
      if (this.info && event.sourceId === this.info.sourceId) {
        this.getPgsStore(event.streamIndex).add(event.displaySets);
      }
    });
    // ChocoPlayer was launched: only one video plays at a time. The main process already saved the progress
    // and stopped the stream: the engine goes first (no error for the cut stream), then the player.
    this.removeClosedListener = this.streamService.onPlayerClosedByChocoPlayer(() => {
      this.zone.run(() => {
        this.engine?.destroy();
        this.engine = null;
        this.playerSessionService.close();
      });
    });

    this.subscription.add(this.playerSessionService.state$.subscribe((state) => {
      this.setMode(state.mode);
      if (state.request && state.loadId !== this.loadedId) {
        this.loadedId = state.loadId;
        this.load(state.request);
      }
    }));
    // Going to another page while the video covers the window: it goes on in the mini player
    this.subscription.add(this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
      if (this.mode === 'full') this.playerSessionService.minimize();
    }));
    // A trailer started by the user while the player is open: the video pauses (play takes the focus back)
    this.subscription.add(this.mediaFocusService.owner$.subscribe(() => {
      const video = this.videoRef.nativeElement;
      if (!this.mediaFocusService.isFreeFor(this.focusOwner) && !video.paused) {
        video.pause();
      }
    }));
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.endMiniGesture?.();
    this.mediaFocusService.release(this.focusOwner);
    this.subscription.unsubscribe();
    this.hiddenComponentService.displayComponent();
    this.scrollEventService.enableScrollEvent();
    this.stopTimer();
    this.stopPlayback();
    this.detachVideoListeners();
    this.removeCueListener?.();
    this.removePgsListener?.();
    this.removeClosedListener?.();
    // Destroyed with its app shell (logout, offline...): nothing plays anymore
    this.playerSessionService.close();
  }

  // ── Modes ──

  // full: covers the window (menu hidden, page scroll and keyboard shortcuts for the player).
  // mini: small player in a corner, the page under it is usable again.
  private setMode(mode: PlayerMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.endMiniGesture?.();
    if (mode === 'full') {
      this.hiddenComponentService.hiddenComponent();
      this.scrollEventService.disableScrollEvent();
      this.displayControls = true;
      this.startTimerMouse();
    } else {
      this.hiddenComponentService.displayComponent();
      this.scrollEventService.enableScrollEvent();
      this.stopTimer();
      this.displayControlsWhenActivated = false;
      if (mode === 'mini') this.fullscreenService.disableFullScreen();
    }
    if (mode === 'closed') {
      this.mediaFocusService.release(this.focusOwner);
    }
    if (mode === 'mini') {
      this.applyMiniGeometry();
    } else {
      this.clearMiniGeometry();
    }
    this.pgsCanvasDirty = true;
  }

  // ── Mini player: place and size ──

  private getViewport(): MiniPlayerViewport {
    return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
  }

  private applyMiniGeometry(): void {
    this.applyMiniRect(toMiniRect(this.miniGeometry, this.getViewport()));
  }

  // Set on the host element directly: also used at each mouse move, outside Angular
  private applyMiniRect(rect: MiniPlayerRect): void {
    const style = this.hostRef.nativeElement.style;
    style.left = `${rect.left}px`;
    style.top = `${rect.top}px`;
    style.width = `${rect.width}px`;
    style.right = 'auto';
    style.bottom = 'auto';
    this.pgsCanvasDirty = true;
  }

  private clearMiniGeometry(): void {
    const style = this.hostRef.nativeElement.style;
    ['left', 'top', 'width', 'right', 'bottom'].forEach((property) => style.removeProperty(property));
  }

  private getHostRect(): MiniPlayerRect {
    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  // Press on the mini player (not on its buttons): a drag moves it, a simple click brings it back to full screen
  onMiniPointerDown(event: PointerEvent): void {
    if (this.mode !== 'mini' || event.button !== 0) return;
    if ((event.target as Element).closest('button, .mini-progress, .mini-next-episode, .mini-resize')) return;
    this.startMiniGesture(event, null);
  }

  onMiniResizeStart(event: PointerEvent, handle: MiniResizeHandle): void {
    if (this.mode !== 'mini' || event.button !== 0) return;
    event.stopPropagation();
    this.startMiniGesture(event, handle);
  }

  private startMiniGesture(event: PointerEvent, handle: MiniResizeHandle | null): void {
    // No text selection or image drag during the gesture
    event.preventDefault();
    this.endMiniGesture?.();
    this.suppressMiniClick = false;

    const host = this.hostRef.nativeElement;
    // The element pressed receives all the moves, even when the mouse goes over the page or out of the window
    const target = event.currentTarget as HTMLElement;
    const start = this.getHostRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const gestureClass = handle ? 'mini-resizing' : 'mini-moving';
    let moved = false;
    target.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!moved) {
        if (Math.hypot(dx, dy) < this.miniDragThreshold) return;
        moved = true;
        host.classList.add(gestureClass);
      }
      const viewport = this.getViewport();
      this.applyMiniRect(handle ? resizeMiniRect(start, handle, dx, dy, viewport) : moveMiniRect(start, dx, dy, viewport));
    };
    const end = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      target.removeEventListener('lostpointercapture', end);
      if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
      host.classList.remove(gestureClass);
      this.endMiniGesture = null;
      if (!moved) return;
      this.suppressMiniClick = true;
      // Kept for the next times the mini player opens (this session and the next ones)
      if (this.mode === 'mini') {
        this.miniGeometry = fromMiniRect(this.getHostRect(), this.getViewport());
        saveMiniGeometry(this.miniGeometry);
      }
    };
    this.endMiniGesture = end;
    // Moves don't need Angular: no change detection at each mouse move
    this.zone.runOutsideAngular(() => {
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', end);
      target.addEventListener('pointercancel', end);
      target.addEventListener('lostpointercapture', end);
    });
  }

  onMinimize(): void {
    this.playerSessionService.minimize();
  }

  onExpand(event: Event): void {
    event.stopPropagation();
    this.playerSessionService.expand();
  }

  onClosePlayer(event: Event): void {
    event.stopPropagation();
    this.playerSessionService.close();
  }

  onMiniPlayPause(event: Event): void {
    event.stopPropagation();
    this.setPauseOrPlayVideo();
  }

  // Click on the mini player's progress bar
  onMiniSeek(event: MouseEvent): void {
    event.stopPropagation();
    const bar = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (bar.width > 0 && this.totalDurationMedia > 0) {
      this.engine?.seek(((event.clientX - bar.left) / bar.width) * this.totalDurationMedia);
    }
  }

  get progressPercent(): number {
    return this.totalDurationMedia > 0 ? Math.min(100, (this.currentTimeTravelled / this.totalDurationMedia) * 100) : 0;
  }

  // ── Loading ──

  private async load(request: PlayerLaunchRequest): Promise<void> {
    const loadId = ++this.loadCounter;
    this.stopPlayback();
    // From the launch: the trailers and the game music pause, nothing starts behind the player
    this.mediaFocusService.claim(this.focusOwner);
    this.request = request;
    this.title = request.title;
    this.media = request.media;
    this.beginIdx = request.seasonIndex;
    this.srcPoster = request.media?.srcBackgroundImage || '';
    this.displayError = false;
    this.isBuffering = true;
    this.currentTimeTravelled = 0;
    this.totalDurationMedia = 0;
    this.audios = [];
    this.subtitles = [];
    this.findNextEpisode(request, loadId);

    let info: PlayerMediaInfo;
    try {
      info = await this.streamService.preparePlayback(request);
    } catch (error) {
      if (loadId === this.loadCounter && !this.isDestroyed) this.onError(error);
      return;
    }
    if (loadId !== this.loadCounter || this.isDestroyed) {
      this.streamService.releasePlayback(info.sourceId);
      return;
    }
    this.info = info;
    this.totalDurationMedia = info.duration;
    this.setupTracks(info);

    const videoMode = await chooseVideoMode(info);
    if (loadId !== this.loadCounter || this.isDestroyed) return;

    const video = this.videoRef.nativeElement;
    video.volume = this.currentVolume;
    const subtitle = this.currentSubtitleTrack;
    this.engine = new MsePlayerEngine(video, {
      info,
      videoMode,
      audioStreamIndex: this.currentAudioIndex >= 0 ? this.currentAudioIndex : null,
      subtitleStreamIndexes: info.subtitles.filter((track) => track.format === 'text').map((track) => track.streamIndex),
      pgsStreamIndex: subtitle?.format === 'pgs' ? subtitle.streamIndex : null
    }, {
      onStreamError: (callback) => this.streamService.onPlayerStreamError(callback)
    }, (message) => this.zone.run(() => this.onError(message)));
    // Lets StreamService save where the video is if the app closes while it plays
    this.streamService.setActivePlayback(request, () => this.getCurrentProgress());

    try {
      await this.engine.open(this.getStartPosition(request.watchProgress, info.duration));
      video.play().catch(() => { });
    } catch (error) {
      if (loadId === this.loadCounter) this.onError(error);
    }
  }

  // Same rule as ChocoPlayer: resumes where the media was left, unless less than 10 s were left
  private getStartPosition(watchProgress: number, duration: number): number {
    if (!(watchProgress > 0) || watchProgress >= 100 || duration <= 0) return 0;
    const position = (watchProgress / 100) * duration;
    return duration - position < 10 ? 0 : position;
  }

  private stopPlayback(): void {
    this.saveProgress();
    if (this.request) {
      this.streamService.clearActivePlayback(this.request);
    }
    this.engine?.destroy();
    this.engine = null;
    if (this.info) {
      this.streamService.releasePlayback(this.info.sourceId);
    }
    this.info = null;
    this.hasPlayed = false;
    this.isVideoLoaded = false;
    this.cueStore.clear();
    this.pgsStores.clear();
    this.setSubtitleLoop(false);
    this.resetNextEpisode();
  }

  // 0 - 100, null while nothing has been played (the progress already known must not be overwritten)
  private getCurrentProgress(): number | null {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.info || !this.hasPlayed || this.info.duration <= 0) return null;
    return video.ended ? 100 : (video.currentTime / this.info.duration) * 100;
  }

  private saveProgress(): void {
    const progress = this.getCurrentProgress();
    if (!this.request || progress === null) return;
    this.lastProgressSave = Date.now();
    this.streamService.saveInternalPlayerProgress(this.request, progress);
  }

  // ── Tracks ──

  private setupTracks(info: PlayerMediaInfo): void {
    const language: string = this.translationLanguageService.getCurrentLangValue();
    const labels: TrackLabels = {
      track: this.translateService.instant('PLAYER.TRACK'),
      forced: this.translateService.instant('PLAYER.FORCED'),
      hearingImpaired: this.translateService.instant('PLAYER.HEARING_IMPAIRED'),
      unsupported: this.translateService.instant('PLAYER.UNSUPPORTED_SUBTITLE')
    };
    this.audios = info.audios.map((track, position) => ({
      ...describeAudioTrack(track, position, language, labels),
      index: track.streamIndex
    }));
    this.subtitles = info.subtitles.map((track, position) => ({
      ...describeSubtitleTrack(track, position, language, labels),
      index: track.streamIndex,
      disabled: !track.format
    }));

    const audio = pickAudioTrack(info.audios, this.trackPreferences.audio);
    this.currentAudioIndex = audio ? audio.streamIndex : -1;
    const subtitle = pickSubtitleTrack(info.subtitles, this.trackPreferences.subtitle);
    this.currentSubtitleIndex = subtitle ? subtitle.streamIndex : -1;
    this.setSubtitleLoop(this.currentSubtitleIndex >= 0);
  }

  onChangeAudio(streamIndex: number): void {
    const track = this.info?.audios.find((audio) => audio.streamIndex === streamIndex);
    if (!track || !this.engine) return;
    this.currentAudioIndex = streamIndex;
    this.trackPreferences = { ...this.trackPreferences, audio: toAudioPreference(track) };
    saveTrackPreferences(this.trackPreferences);
    this.engine.setAudio(streamIndex);
  }

  onChangeSubtitles(streamIndex: number): void {
    const track = streamIndex >= 0 ? this.info?.subtitles.find((subtitle) => subtitle.streamIndex === streamIndex) : null;
    if (track === undefined || (track && !track.format)) return;
    this.currentSubtitleIndex = track ? track.streamIndex : -1;
    this.trackPreferences = { ...this.trackPreferences, subtitle: toSubtitlePreference(track) };
    saveTrackPreferences(this.trackPreferences);

    // Only the PGS track displayed is extracted: another one means reading the media again from here
    if (track?.format === 'pgs' && this.engine && this.engine.extractedPgsStreamIndex !== track.streamIndex) {
      const previous = this.engine.extractedPgsStreamIndex;
      if (previous !== null) this.pgsStores.delete(previous);
      this.engine.setPgsTrack(track.streamIndex);
    }
    this.setSubtitleLoop(!!track);
  }

  private get currentSubtitleTrack(): PlayerSubtitleTrack | null {
    if (this.currentSubtitleIndex < 0) return null;
    return this.info?.subtitles.find((track) => track.streamIndex === this.currentSubtitleIndex) ?? null;
  }

  private getPgsStore(streamIndex: number): PgsTrackStore {
    let store = this.pgsStores.get(streamIndex);
    if (!store) {
      store = new PgsTrackStore();
      this.pgsStores.set(streamIndex, store);
    }
    return store;
  }

  // The displayed subtitles are looked up at every frame (outside Angular), the view only updates when they change
  private setSubtitleLoop(enabled: boolean): void {
    this.activeCueKey = '';
    this.subtitleLines = [];
    this.drawPgsFrame(null);
    if (!enabled) {
      if (this.subtitleFrame !== null) cancelAnimationFrame(this.subtitleFrame);
      this.subtitleFrame = null;
      return;
    }
    if (this.subtitleFrame !== null) return;
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        this.renderSubtitles();
        this.subtitleFrame = requestAnimationFrame(tick);
      };
      this.subtitleFrame = requestAnimationFrame(tick);
    });
  }

  private renderSubtitles(): void {
    const video = this.videoRef?.nativeElement;
    const track = this.currentSubtitleTrack;
    if (!video || !track) return;

    if (track.format === 'pgs') {
      const frame = this.pgsStores.get(track.streamIndex)?.getFrame(video.currentTime) ?? null;
      if (frame !== this.lastPgsFrame || this.pgsCanvasDirty) {
        this.drawPgsFrame(frame);
      }
      return;
    }

    const cues = this.cueStore.getActiveCues(this.currentSubtitleIndex, video.currentTime);
    const key = cues.map((cue) => `${cue.start}|${cue.text}`).join('\n');
    if (key === this.activeCueKey) return;
    this.activeCueKey = key;
    const lines = cues.flatMap((cue) => parseCueText(cue.text));
    this.zone.run(() => {
      this.subtitleLines = lines;
    });
  }

  // PGS images are positioned for the video picture: drawn over the part of the <video> the picture fills
  private drawPgsFrame(frame: PgsFrame | null): void {
    const canvas = this.pgsCanvasRef?.nativeElement;
    const video = this.videoRef?.nativeElement;
    if (!canvas || !video) return;
    this.lastPgsFrame = frame;
    this.pgsCanvasDirty = false;

    const videoRect = video.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const pictureWidth = video.videoWidth || videoRect.width;
    const pictureHeight = video.videoHeight || videoRect.height;
    const scale = Math.min(videoRect.width / pictureWidth, videoRect.height / pictureHeight) || 0;
    const width = pictureWidth * scale;
    const height = pictureHeight * scale;
    this.pgsRenderer.draw(canvas, frame, {
      x: videoRect.left - canvasRect.left + (videoRect.width - width) / 2,
      y: videoRect.top - canvasRect.top + (videoRect.height - height) / 2,
      width,
      height
    });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.pgsCanvasDirty = true;
    // The mini player stays in its corner and in the window
    if (this.mode === 'mini') this.applyMiniGeometry();
  }

  // ── Next episode ──

  private findNextEpisode(request: PlayerLaunchRequest, loadId: number): void {
    this.nextEpisodeService.find(request).then((next) => {
      if (loadId !== this.loadCounter || this.isDestroyed || !next) return;
      this.nextEpisode = next;
      this.nextEpisodeLabel = next.seasonNumber !== null
        ? this.translateService.instant('PLAYER.SEASON_EPISODE', { season: next.seasonNumber, episode: next.episode.episodeNumber })
        : this.translateService.instant('PLAYER.EPISODE_NUMBER', { episode: next.episode.episodeNumber });
      this.updateNextEpisodePrompt();
    });
  }

  // The card shows during the last seconds and at the end; seeking back before them hides it again
  private updateNextEpisodePrompt(): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.nextEpisode || this.nextEpisodeDismissed || this.totalDurationMedia <= 0) {
      this.displayNextEpisode = false;
      return;
    }
    const remaining = this.totalDurationMedia - video.currentTime;
    this.displayNextEpisode = video.ended || remaining <= this.nextEpisodePromptSeconds;
    if (!this.displayNextEpisode || (!video.ended && this.nextEpisodeCountdown !== null)) {
      this.stopNextEpisodeCountdown();
    }
  }

  private startNextEpisodeCountdown(): void {
    this.stopNextEpisodeCountdown();
    this.nextEpisodeCountdown = this.nextEpisodeCountdownSeconds;
    this.nextEpisodeTimer = setInterval(() => {
      if (this.nextEpisodeCountdown === null) return;
      this.nextEpisodeCountdown--;
      if (this.nextEpisodeCountdown <= 0) {
        this.playNextEpisode();
      }
    }, 1000);
  }

  private stopNextEpisodeCountdown(): void {
    if (this.nextEpisodeTimer) {
      clearInterval(this.nextEpisodeTimer);
      this.nextEpisodeTimer = null;
    }
    this.nextEpisodeCountdown = null;
  }

  private resetNextEpisode(): void {
    this.stopNextEpisodeCountdown();
    this.nextEpisode = null;
    this.nextEpisodeLabel = '';
    this.displayNextEpisode = false;
    this.nextEpisodeDismissed = false;
  }

  playNextEpisode(): void {
    const next = this.nextEpisode;
    const request = this.request;
    this.stopNextEpisodeCountdown();
    if (!next || !request) return;
    this.displayNextEpisode = false;
    // In the mini player, the next episode plays in the mini player too
    this.streamService.launchEpisode(request.mediaId, next.series, next.episode, next.seasonIndex, request.isConnected, true);
  }

  cancelNextEpisode(): void {
    this.nextEpisodeDismissed = true;
    this.displayNextEpisode = false;
    this.stopNextEpisodeCountdown();
  }

  // ── Video element ──

  // Events after which the loading indicator may have to appear or disappear
  private readonly bufferingEvents: string[] = [
    'waiting', 'playing', 'canplay', 'canplaythrough', 'loadeddata', 'seeking', 'seeked', 'play', 'pause', 'ended', 'emptied'
  ];

  private attachVideoListeners(): void {
    const video = this.videoRef.nativeElement;
    video.addEventListener('error', this.onVideoError);
    video.addEventListener('loadedmetadata', this.onLoadMetadata);
    video.addEventListener('timeupdate', this.timeUpdate);
    video.addEventListener('play', this.onPlay);
    video.addEventListener('pause', this.onPause);
    video.addEventListener('playing', this.onPlaying);
    video.addEventListener('ended', this.onEnded);
    video.addEventListener('volumechange', this.volumeUpdate);
    this.bufferingEvents.forEach((event) => video.addEventListener(event, this.updateBuffering));
  }

  private detachVideoListeners(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    video.removeEventListener('error', this.onVideoError);
    video.removeEventListener('loadedmetadata', this.onLoadMetadata);
    video.removeEventListener('timeupdate', this.timeUpdate);
    video.removeEventListener('play', this.onPlay);
    video.removeEventListener('pause', this.onPause);
    video.removeEventListener('playing', this.onPlaying);
    video.removeEventListener('ended', this.onEnded);
    video.removeEventListener('volumechange', this.volumeUpdate);
    this.bufferingEvents.forEach((event) => video.removeEventListener(event, this.updateBuffering));
  }

  // The indicator follows the video's actual state instead of being set by hand: a track change
  // is often so quick that playback never stops, so no "playing" event would come to hide it.
  // Shown while the video lacks data to go on: when it plays, seeks, or hasn't started yet.
  private updateBuffering = () => {
    const video = this.videoRef?.nativeElement;
    if (!video || !this.engine || this.displayError) return;
    const lacksData = video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
    this.isBuffering = lacksData && !video.ended && (!video.paused || video.seeking || !this.hasPlayed);
  }

  private onVideoError = () => {
    // A <video> without source (between two media) is not an error
    if (this.engine) {
      this.onError(this.videoRef.nativeElement.error?.message);
    }
  }

  private onLoadMetadata = () => {
    const video = this.videoRef.nativeElement;
    this.whatDimension = video.videoHeight > video.videoWidth;
    this.isVideoLoaded = true;
    this.pgsCanvasDirty = true;
  }

  private timeUpdate = () => {
    const video = this.videoRef.nativeElement;
    this.currentTimeTravelled = video.currentTime;
    // Playback moving on means data is there: also catches a state no other event reported
    this.updateBuffering();
    this.updateNextEpisodePrompt();
    if (this.hasPlayed && !video.paused && Date.now() - this.lastProgressSave >= this.progressSaveInterval) {
      this.saveProgress();
    }
  }

  private onPlay = () => {
    // Played again after a trailer started by the user: the trailer pauses
    this.mediaFocusService.claim(this.focusOwner);
    this.isReading = false;
    this.keyPlay = this.srcImagePlay;
  }

  private onPause = () => {
    this.isReading = true;
    this.keyPlay = this.srcImagePause;
    if (!this.videoRef.nativeElement.ended) {
      this.saveProgress();
    }
  }

  private onPlaying = () => {
    if (!this.hasPlayed) {
      this.hasPlayed = true;
      this.lastProgressSave = Date.now();
    }
    this.updateBuffering();
  }

  private onEnded = () => {
    this.isReading = true;
    this.displayControls = true;
    this.saveProgress();
    this.updateNextEpisodePrompt();
    if (this.displayNextEpisode) {
      this.startNextEpisodeCountdown();
    }
  }

  private volumeUpdate = () => {
    const video = this.videoRef.nativeElement;
    this.currentVolume = video.volume;
  }

  // ── Controls ──

  // Online the server's episodes are listed, offline the downloaded ones
  get canDisplayEpisodes(): boolean {
    const series = this.media as SeriesModel | undefined;
    return series?.mediaType === MediaTypeModel.SERIES && Array.isArray(series.seasons) && series.seasons.length > 0;
  }

  get currentEpisodeId(): number {
    return this.request?.episodeId ?? -1;
  }

  get isConnected(): boolean {
    return this.request?.isConnected ?? true;
  }

  onSelectEpisode(selection: EpisodeSelection): void {
    const request = this.request;
    if (!request) return;
    this.streamService.launchEpisode(request.mediaId, this.media as SeriesModel, selection.episode, selection.seasonIndex, request.isConnected);
  }

  onMouseMovieIntoAllInterface(event: MouseEvent): void {
    if (this.mode !== 'full') return;
    this.progressBarVideo?.onDragProgressBar(event);
    this.progressBarVolume?.onDragSound(event);
    this.displayControls = true;
    this.startTimerMouse();
  }

  onMouseUpIntoInterface(event: MouseEvent): void {
    if (this.mode !== 'full') return;
    const wasDragging = !!this.progressBarVideo?.isDraggingProgressBar || !!this.progressBarVolume?.volumeIsDragging;
    this.progressBarVideo?.endDragProgressBar(event);
    this.progressBarVolume?.endDragSound(event);
    // Released away from the bar (over the video): the browser sends a click to the player right after,
    // it must not pause the video. Reset after that click, so a later real click still works.
    if (wasDragging) {
      this.suppressDragEndClick = true;
      setTimeout(() => this.suppressDragEndClick = false);
    }
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

  public onClickVolume(intensity: number) {
    const video = this.videoRef.nativeElement;
    video.volume = intensity;
  }

  public changeCurrentTime(time: number): void {
    this.engine?.seek(time);
  }

  public setPauseOrPlayVideo(): void {
    const video = this.videoRef.nativeElement;
    if (!this.engine) return;
    if (video.paused || video.ended) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }

  public changedVolumeIntensityByKey(state: boolean): void {
    const video = this.videoRef.nativeElement;
    if (state) {
      video.volume = Math.min(1, video.volume + this.volumeIntensityChanged);
    } else {
      video.volume = Math.max(0, video.volume - this.volumeIntensityChanged);
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
    this.engine?.seek(video.currentTime + (typeOp ? this.speed : -this.speed));
  }

  onClickVideo(): void {
    // A click on the mini player brings the video back to full screen (not the end of a drag)
    if (this.mode === 'mini') {
      if (this.suppressMiniClick) {
        this.suppressMiniClick = false;
        return;
      }
      this.playerSessionService.expand();
      return;
    }
    if (this.suppressDragEndClick) {
      this.suppressDragEndClick = false;
      return;
    }
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
    // Alt + ← / → is reserved for navigation (AppComponent). In the mini player, the keys belong to the page.
    if (event.altKey || this.mode !== 'full') {
      return;
    }
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
    console.error('[player]', error);
    this.isBuffering = false;
    this.displayError = true;
    // The error message needs the whole window
    if (this.mode === 'mini') this.playerSessionService.expand();
  }

  setDisplayControlsWhenActivated(op: boolean): void {
    this.displayControlsWhenActivated = op;
  }

}
