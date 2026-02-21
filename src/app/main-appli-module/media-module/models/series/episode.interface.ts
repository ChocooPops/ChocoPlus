import { ProgressStateMedia } from "../progress-state-media.enum"

export interface EpisodeModel {
    id: number,
    seasonId: number,
    jellyfinId: string
    name: string,
    episodeNumber: number
    description: string,
    date: Date,
    time: number,
    watchProgress: number,
    stateProgress: ProgressStateMedia,
    quality: string,
    srcPoster: string | undefined,
}