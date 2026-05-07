import { ProgressStateMedia } from "../progress-state-media.enum"

export interface EpisodeModel {
    id: number,
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
}