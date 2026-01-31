export interface EditEpisodeModel {
    id: number,
    seasonId: number,
    jellyfinId: string | undefined
    name: string | undefined,
    episodeNumber: number,
    description: string | undefined,
    date: Date,
    srcPoster: string | ArrayBuffer | undefined | null,
}