export interface EditEpisodeModel {
    id: number,
    seasonId: number,
    mediaLibraryId: string | undefined
    name: string | undefined,
    episodeNumber: number,
    description: string | undefined,
    date: Date,
    srcPoster: string | ArrayBuffer | undefined | null,

    path?: string,
    frames?: number,
    bytes?: number,
    width?: number,
    height?:number
}