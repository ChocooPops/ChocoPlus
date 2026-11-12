import { PlayerMediaInfo, PlayerStreamErrorEvent, PlayerVideoMode, PlayerVideoStream } from '../../models/player.interface';

// Plays a media prepared by the main process (media-player.js) in a <video>, through Media Source Extensions.
//
// The main process streams the media as fragmented MP4 on chocostream://media/<sourceId>?start=<s>...
// Its timestamps are the media's own ones (a stream started at 47.3 s begins with the keyframe before it,
// e.g. 45.0 s, at 45.0 s): the MediaSource timeline is the media timeline, so seeking inside the buffered
// data is exact and handled by the browser, and only a seek outside of it starts a new stream.
// The stream is read only as fast as the buffer needs it (ffmpeg, then the server, wait in the meantime).

export interface PlayerStreamBridge {
  onStreamError(callback: (event: PlayerStreamErrorEvent) => void): () => void;
}

export interface MsePlayerEngineOptions {
  info: PlayerMediaInfo,
  videoMode: PlayerVideoMode,
  audioStreamIndex: number | null,
  // Text subtitle tracks extracted while the media is read (their cues come by IPC, see StreamService)
  subtitleStreamIndexes: number[],
  // PGS track extracted while the media is read (its images come by IPC), only the one displayed
  pgsStreamIndex: number | null
}

const STREAM_URL_ROOT = 'chocostream://media/';
const H264_CODEC = 'avc1.640029';
const AAC_CODEC = 'mp4a.40.2';

// Chromium keeps at most ~150 MB of video per SourceBuffer: the buffer is sized in bytes as well as seconds
const MAX_FORWARD_SECONDS = 120;
const MIN_FORWARD_SECONDS = 15;
const MAX_FORWARD_BYTES = 80 * 1024 * 1024;
const MAX_BACK_SECONDS = 30;
const MIN_BACK_SECONDS = 3;
const MAX_BACK_BYTES = 30 * 1024 * 1024;

const SEEK_DEBOUNCE_MS = 200;
// A seek this close after the buffered data waits for the current stream instead of starting a new one
const SEEK_AHEAD_WAIT_SECONDS = 15;
const BUFFER_GAP_TOLERANCE = 0.3;
const END_TOLERANCE_SECONDS = 1.5;
// A stream that fails (network cut, server restarted, ffmpeg crashed) is started again at the current
// position; after this many failures without getting further, the error is shown.
const MAX_FAILURES_WITHOUT_PROGRESS = 2;
// The error of a failed stream comes by IPC, possibly just after the end of its data
const STREAM_ERROR_GRACE_MS = 300;

// ── Codecs ──────────────────────────────────────────────────────────────────

const hex = (value: number): string => value.toString(16).padStart(2, '0').toUpperCase();

// RFC 6381 codec string of the original video, null if it can't be put in MP4 for Chromium
export function getVideoCodecString(video: PlayerVideoStream): string | null {
  const level = video.level && video.level > 0 ? video.level : null;
  const isTenBit = /10/.test(video.pixelFormat ?? '') || /10/.test(video.profile ?? '');
  switch (video.codec) {
    case 'hevc':
      return isTenBit ? `hvc1.2.4.L${level ?? 153}.B0` : `hvc1.1.6.L${level ?? 120}.B0`;
    case 'h264': {
      const profile = video.profile ?? '';
      const profileIdc = /4:4:4/.test(profile) ? 0xF4
        : /4:2:2/.test(profile) ? 0x7A
          : /High 10/.test(profile) ? 0x6E
            : /High/.test(profile) ? 0x64
              : /Main/.test(profile) ? 0x4D
                : 0x42;
      return `avc1.${hex(profileIdc)}00${hex(level ?? 41)}`;
    }
    case 'av1':
      return `av01.0.08M.${isTenBit ? '10' : '08'}`;
    case 'vp9':
      return isTenBit ? 'vp09.02.40.10' : 'vp09.00.40.08';
    default:
      return null;
  }
}

export function getMimeType(info: PlayerMediaInfo, videoMode: PlayerVideoMode): string {
  const videoCodec = videoMode === 'h264' ? H264_CODEC : getVideoCodecString(info.video);
  const codecs = info.audios.length > 0 ? `${videoCodec}, ${AAC_CODEC}` : `${videoCodec}`;
  return `video/mp4; codecs="${codecs}"`;
}

// 'copy' when Chromium can decode the original video (HEVC needs a hardware decoder), 'h264' otherwise:
// ffmpeg then converts it, which costs CPU.
export async function chooseVideoMode(info: PlayerMediaInfo): Promise<PlayerVideoMode> {
  const codec = getVideoCodecString(info.video);
  if (!codec || !window.MediaSource || !MediaSource.isTypeSupported(getMimeType(info, 'copy'))) {
    return 'h264';
  }
  try {
    const result = await navigator.mediaCapabilities.decodingInfo({
      type: 'media-source',
      video: {
        contentType: `video/mp4; codecs="${codec}"`,
        width: info.video.width || 1920,
        height: info.video.height || 1080,
        bitrate: 20_000_000,
        framerate: 24
      }
    });
    return result.supported ? 'copy' : 'h264';
  } catch {
    return 'copy';
  }
}

// ── Engine ──────────────────────────────────────────────────────────────────

interface StreamSession {
  id: number,
  start: number,
  controller: AbortController,
  bytes: number,
  // all its data has been received
  finished: boolean
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export class MsePlayerEngine {

  private readonly mediaSource = new MediaSource();
  private readonly objectUrl = URL.createObjectURL(this.mediaSource);
  private readonly removeStreamErrorListener: () => void;
  private sourceBuffer: SourceBuffer | null = null;

  private session: StreamSession | null = null;
  private sessionCounter = 0;
  private restartCounter = 0;
  private seekTimer: ReturnType<typeof setTimeout> | null = null;
  private audioStreamIndex: number | null;
  private pgsStreamIndex: number | null;

  // Bytes per second of media, measured on the stream: sizes the buffer
  private bytesPerSecond = 0;
  private failuresWithoutProgress = 0;
  private lastFailureEnd = -1;
  private readonly streamErrors = new Map<number, string>();
  private destroyed = false;
  private failed = false;

  constructor(private readonly video: HTMLVideoElement,
    private readonly options: MsePlayerEngineOptions,
    bridge: PlayerStreamBridge,
    private readonly onError: (message: string) => void
  ) {
    this.audioStreamIndex = options.audioStreamIndex;
    this.pgsStreamIndex = options.pgsStreamIndex;
    this.removeStreamErrorListener = bridge.onStreamError((event) => {
      if (event.sourceId === this.options.info.sourceId) {
        this.streamErrors.set(event.session, event.message);
      }
    });
  }

  public async open(startAt: number): Promise<void> {
    this.video.src = this.objectUrl;
    await new Promise((resolve) => this.mediaSource.addEventListener('sourceopen', resolve, { once: true }));
    if (this.destroyed) return;

    this.mediaSource.duration = this.options.info.duration;
    this.sourceBuffer = this.mediaSource.addSourceBuffer(getMimeType(this.options.info, this.options.videoMode));
    this.sourceBuffer.addEventListener('error', () => this.fail('The media data could not be decoded'));

    const start = clamp(startAt, 0, Math.max(0, this.options.info.duration - 1));
    // Before any data, this sets the position playback starts from
    this.video.currentTime = start;
    this.startSession(start);
  }

  public seek(time: number): void {
    if (this.destroyed || !this.sourceBuffer) return;
    const target = clamp(time, 0, Math.max(0, this.options.info.duration - 0.5));
    this.cancelPendingSeek();
    const fillingRange = this.getFillingRange();
    this.video.currentTime = target;

    if (this.isBuffered(target)) return;
    // Just after the data the current stream is adding: it will be there in a moment
    if (fillingRange && target >= fillingRange.start && target <= fillingRange.end + SEEK_AHEAD_WAIT_SECONDS) return;

    // Debounced: dragging the progress bar seeks many times per second
    this.seekTimer = setTimeout(() => {
      this.seekTimer = null;
      this.restart(target);
    }, SEEK_DEBOUNCE_MS);
  }

  public setAudio(streamIndex: number): void {
    if (this.destroyed || streamIndex === this.audioStreamIndex) return;
    this.audioStreamIndex = streamIndex;
    this.cancelPendingSeek();
    // The audio of the whole buffer changes: it is emptied and read again from the current position
    this.restart(this.video.currentTime);
  }

  public get extractedPgsStreamIndex(): number | null {
    return this.pgsStreamIndex;
  }

  // The PGS track is read with the media: another one needs the media to be read again from the current position
  public setPgsTrack(streamIndex: number): void {
    if (this.destroyed || streamIndex === this.pgsStreamIndex) return;
    this.pgsStreamIndex = streamIndex;
    this.cancelPendingSeek();
    this.restart(this.video.currentTime);
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cancelPendingSeek();
    this.abortSession();
    this.removeStreamErrorListener();
    this.video.removeAttribute('src');
    this.video.load();
    URL.revokeObjectURL(this.objectUrl);
  }

  // ── Sessions (one ffmpeg stream each) ──

  private startSession(start: number): void {
    this.abortSession();
    const session: StreamSession = { id: ++this.sessionCounter, start, controller: new AbortController(), bytes: 0, finished: false };
    this.session = session;
    this.pump(session).catch((error) => {
      if (this.isCurrent(session) && error?.name !== 'AbortError') {
        this.fail(error?.message ?? String(error));
      }
    });
  }

  private abortSession(): void {
    if (this.session) {
      this.session.controller.abort();
      this.session = null;
    }
  }

  private isCurrent(session: StreamSession): boolean {
    return !this.destroyed && this.session === session;
  }

  private buildStreamUrl(session: StreamSession): string {
    const params = new URLSearchParams({
      start: session.start.toFixed(3),
      video: this.options.videoMode,
      subs: this.options.subtitleStreamIndexes.join(','),
      session: String(session.id)
    });
    if (this.audioStreamIndex !== null) {
      params.set('audio', String(this.audioStreamIndex));
    }
    if (this.pgsStreamIndex !== null) {
      params.set('pgs', String(this.pgsStreamIndex));
    }
    return `${STREAM_URL_ROOT}${this.options.info.sourceId}?${params.toString()}`;
  }

  private async pump(session: StreamSession): Promise<void> {
    const response = await fetch(this.buildStreamUrl(session), { signal: session.controller.signal, cache: 'no-store' });
    if (!response.ok || !response.body) {
      throw new Error(`Stream request failed (${response.status})`);
    }
    const reader = response.body.getReader();
    for (;;) {
      await this.waitForBufferRoom(session);
      if (!this.isCurrent(session)) return;
      const { done, value } = await reader.read();
      if (!this.isCurrent(session)) return;
      if (done) {
        session.finished = true;
        await this.onSessionEnd(session);
        return;
      }
      await this.append(value, session);
    }
  }

  // Empties the buffer and starts a new stream at this position
  private async restart(at: number): Promise<void> {
    const token = ++this.restartCounter;
    this.abortSession();
    await this.whenIdle();
    const sourceBuffer = this.sourceBuffer;
    if (token !== this.restartCounter || this.destroyed || !sourceBuffer) return;

    try {
      // Drops the part of a fragment the aborted stream may have left in the parser
      if (this.mediaSource.readyState === 'open') sourceBuffer.abort();
      sourceBuffer.remove(0, Infinity);
      await this.whenIdle();
      if (token !== this.restartCounter || this.destroyed) return;
    } catch (error: any) {
      this.fail(error?.message ?? String(error));
      return;
    }
    this.startSession(at);
  }

  private async onSessionEnd(session: StreamSession): Promise<void> {
    const end = this.bufferedEndFrom(session.start);
    if (end >= this.options.info.duration - END_TOLERANCE_SECONDS) {
      await this.endOfStream(session);
      return;
    }
    let error = this.streamErrors.get(session.id);
    if (!error) {
      await delay(STREAM_ERROR_GRACE_MS);
      if (!this.isCurrent(session)) return;
      error = this.streamErrors.get(session.id);
    }
    // ffmpeg reached the end of the file without error: its streams are a bit shorter than the announced duration
    if (!error) {
      await this.endOfStream(session);
      return;
    }

    if (end <= this.lastFailureEnd + 0.5) {
      this.failuresWithoutProgress++;
    } else {
      this.failuresWithoutProgress = 0;
    }
    this.lastFailureEnd = end;
    if (this.failuresWithoutProgress >= MAX_FAILURES_WITHOUT_PROGRESS) {
      this.fail(error);
      return;
    }
    // Started again like a seek to the current position: appending the new stream over the data already
    // received would replace part of a GOP the browser may be decoding, which freezes the video.
    this.restart(this.video.currentTime);
  }

  private async endOfStream(session: StreamSession): Promise<void> {
    await this.whenIdle();
    if (this.isCurrent(session) && this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream();
    }
  }

  // ── SourceBuffer ──

  private whenIdle(): Promise<void> {
    const sourceBuffer = this.sourceBuffer;
    if (!sourceBuffer || !sourceBuffer.updating) return Promise.resolve();
    return new Promise((resolve) => sourceBuffer.addEventListener('updateend', () => resolve(), { once: true }));
  }

  private async append(chunk: Uint8Array, session: StreamSession): Promise<void> {
    for (;;) {
      await this.whenIdle();
      const sourceBuffer = this.sourceBuffer;
      if (!this.isCurrent(session) || !sourceBuffer) return;
      if (sourceBuffer.updating) continue;
      try {
        sourceBuffer.appendBuffer(chunk);
      } catch (error: any) {
        if (error?.name !== 'QuotaExceededError') throw error;
        // Buffer full: frees what has already been watched, or waits for playback to consume some
        const freed = await this.evictBackBuffer(true);
        if (!freed) await delay(1000);
        continue;
      }
      await this.whenIdle();
      session.bytes += chunk.byteLength;
      this.measureBitrate(session);
      return;
    }
  }

  private async waitForBufferRoom(session: StreamSession): Promise<void> {
    while (this.isCurrent(session) && this.bufferedAhead() >= this.maxForwardSeconds()) {
      await this.evictBackBuffer(false);
      await delay(500);
    }
  }

  private async evictBackBuffer(urgent: boolean): Promise<boolean> {
    await this.whenIdle();
    const sourceBuffer = this.sourceBuffer;
    if (this.destroyed || !sourceBuffer || sourceBuffer.updating) return false;

    const backSeconds = this.bytesPerSecond > 0
      ? clamp(MAX_BACK_BYTES / this.bytesPerSecond, MIN_BACK_SECONDS, MAX_BACK_SECONDS)
      : MAX_BACK_SECONDS;
    const keepFrom = this.video.currentTime - (urgent ? MIN_BACK_SECONDS : backSeconds);
    const ranges = sourceBuffer.buffered;
    if (ranges.length === 0 || ranges.start(0) >= keepFrom - 1) return false;

    sourceBuffer.remove(0, keepFrom);
    await this.whenIdle();
    return true;
  }

  private measureBitrate(session: StreamSession): void {
    const range = this.rangeAround(session.start);
    if (!range) return;
    const seconds = range.end - range.start;
    if (seconds >= 3) {
      this.bytesPerSecond = session.bytes / seconds;
    }
  }

  private maxForwardSeconds(): number {
    if (this.bytesPerSecond <= 0) return MAX_FORWARD_SECONDS;
    return clamp(MAX_FORWARD_BYTES / this.bytesPerSecond, MIN_FORWARD_SECONDS, MAX_FORWARD_SECONDS);
  }

  // ── Buffered ranges ──

  private rangeAround(time: number): { start: number, end: number } | null {
    const sourceBuffer = this.sourceBuffer;
    if (!sourceBuffer || this.destroyed) return null;
    try {
      const ranges = sourceBuffer.buffered;
      for (let i = 0; i < ranges.length; i++) {
        if (ranges.start(i) - BUFFER_GAP_TOLERANCE <= time && time <= ranges.end(i) + BUFFER_GAP_TOLERANCE) {
          return { start: ranges.start(i), end: ranges.end(i) };
        }
      }
    } catch {
      // SourceBuffer removed from the MediaSource
    }
    return null;
  }

  private bufferedAhead(): number {
    const time = this.video.currentTime;
    const range = this.rangeAround(time);
    return range ? Math.max(0, range.end - time) : 0;
  }

  // End of the data received since a stream started at this position
  private bufferedEndFrom(start: number): number {
    const sourceBuffer = this.sourceBuffer;
    if (!sourceBuffer || this.destroyed) return start;
    try {
      const ranges = sourceBuffer.buffered;
      let end = start;
      for (let i = 0; i < ranges.length; i++) {
        if (ranges.end(i) >= start - BUFFER_GAP_TOLERANCE) end = Math.max(end, ranges.end(i));
      }
      return end;
    } catch {
      return start;
    }
  }

  private isBuffered(time: number): boolean {
    const range = this.rangeAround(time);
    if (!range || time < range.start - BUFFER_GAP_TOLERANCE) return false;
    return range.end - time > 0.5 || range.end >= this.options.info.duration - END_TOLERANCE_SECONDS;
  }

  // Range the stream being read is still adding data to (null once that stream has ended)
  private getFillingRange(): { start: number, end: number } | null {
    if (!this.session || this.session.finished) return null;
    return this.rangeAround(this.session.start) ?? this.rangeAround(this.video.currentTime);
  }

  private cancelPendingSeek(): void {
    if (this.seekTimer) {
      clearTimeout(this.seekTimer);
      this.seekTimer = null;
    }
  }

  private fail(message: string): void {
    if (this.destroyed || this.failed) return;
    this.failed = true;
    this.abortSession();
    this.onError(message);
  }
}
