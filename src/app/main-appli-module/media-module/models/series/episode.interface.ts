import { ProgressStateMedia } from "../progress-state-media.enum"

export interface EpisodeModel {
    id: number,
    seriesId: number,
    seasonId: number,
    mediaLibraryId: string
    name: string,
    episodeNumber: number
    description: string,
    date: Date,
    duration: number,
    watchProgress: number,
    stateProgress: ProgressStateMedia,
    resolution: string,
    srcPoster: string | undefined,
    isRecent: boolean,

    path?: string,
    frames?: number,
    bytes?: number,
    width?: number,
    height?:number
}