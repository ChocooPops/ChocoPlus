import { MediaModel } from "../media.interface";

export interface ResultCatalog {
    medias: MediaModel[],
    total: number
}