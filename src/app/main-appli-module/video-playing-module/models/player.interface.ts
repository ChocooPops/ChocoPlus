import { MediaModel } from "../../media-module/models/media.interface";
import { MediaTypeModel } from "../../media-module/models/media-type.enum";

// What the internal player needs to start a movie or an episode (built by StreamService.launchPlayer).
export interface PlayerLaunchRequest {
    mediaType: MediaTypeModel.MOVIE | MediaTypeModel.SERIES,
    // Movie id, or series id for an episode
    mediaId: number,
    seasonId: number,
    episodeId: number,
    seasonIndex: number,
    title: string,
    // Server stream URL: used when the media isn't downloaded
    url: string,
    // 0 - 100
    watchProgress: number,
    isConnected: boolean,
    media?: MediaModel
}

// Streams of the media, as listed by ffprobe in the main process (media-player.js).
// streamIndex is the stream's index in the file.
export interface PlayerVideoStream {
    streamIndex: number,
    codec: string | null,
    profile: string | null,
    level: number | null,
    width: number | null,
    height: number | null,
    pixelFormat: string | null,
    colorTransfer: string | null
}

export interface PlayerAudioTrack {
    streamIndex: number,
    codec: string | null,
    profile: string | null,
    channels: number | null,
    channelLayout: string | null,
    language: string | null,
    title: string | null,
    isDefault: boolean,
    isForced: boolean
}

export interface PlayerSubtitleTrack {
    streamIndex: number,
    codec: string | null,
    language: string | null,
    title: string | null,
    isDefault: boolean,
    isForced: boolean,
    isHearingImpaired: boolean,
    // text: converted to WebVTT, pgs: Blu-ray images drawn on a canvas, null: can't be displayed (VobSub, DVB...)
    format: PlayerSubtitleFormat | null
}

export type PlayerSubtitleFormat = 'text' | 'pgs';

export interface PlayerMediaInfo {
    sourceId: string,
    isLocal: boolean,
    // seconds
    duration: number,
    video: PlayerVideoStream,
    audios: PlayerAudioTrack[],
    subtitles: PlayerSubtitleTrack[]
}

export interface PlayerSubtitleCue {
    // seconds, on the media timeline
    start: number,
    end: number,
    text: string
}

export interface PlayerSubtitleCuesEvent {
    sourceId: string,
    streamIndex: number,
    cues: PlayerSubtitleCue[]
}

// One PGS "display set": a subtitle appearing, changing or disappearing at pts (seconds).
// data: its segments (type, size, payload), see media-player.js createSupParser
export interface PlayerPgsDisplaySet {
    pts: number,
    data: Uint8Array
}

export interface PlayerPgsDisplaySetsEvent {
    sourceId: string,
    streamIndex: number,
    displaySets: PlayerPgsDisplaySet[]
}

export interface PlayerStreamErrorEvent {
    sourceId: string,
    session: number,
    message: string
}

// Entry of the audio / subtitle menu (index = streamIndex, -1 = subtitles disabled).
// name: the language (or the title), detail: what tells tracks of the same language apart
export interface PlayerTrackOption {
    name: string,
    detail?: string,
    index: number,
    disabled?: boolean
}

export type PlayerVideoMode = 'copy' | 'h264';
