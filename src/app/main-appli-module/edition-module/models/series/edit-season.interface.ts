import { EditEpisodeModel } from "./edit-episode.interface";

export interface EditSeasonModel {
    id: number,
    seriesId: number,
    jellyfinId: string | undefined,
    name: string | undefined,
    seasonNumber: number,
    srcPoster: string | ArrayBuffer | undefined | null,
    episodes: EditEpisodeModel[]
}