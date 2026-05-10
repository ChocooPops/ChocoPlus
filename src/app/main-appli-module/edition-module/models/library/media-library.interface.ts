import { MediaTypeModel } from "../../../media-module/models/media-type.enum"

export interface MediaLibrary {
    id: string,
    libraryId: string,
    parentId: string,
    seasonNumber: number,
    episodeNumber: number,
    titleFormated: string,
    year: string,
    path: string,
    type: MediaTypeModel,
    tmdbId: number,
    duration: number,
    frames: number,
    bytes: number,
    width: number,
    height: number,
    resolution: number
}