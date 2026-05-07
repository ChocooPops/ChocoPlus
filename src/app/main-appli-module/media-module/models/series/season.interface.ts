import { EpisodeModel } from "./episode.interface";

export interface SeasonModel {
    id: number,
    seriesId: number,
    mediaLibraryId: string,
    name: string,
    seasonNumber: number,
    srcPoster: string | undefined,
    isClicked: boolean,
    episodes: EpisodeModel[]
}