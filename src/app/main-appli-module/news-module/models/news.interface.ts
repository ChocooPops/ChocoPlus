import { MediaModel } from "../../media-module/models/media.interface"

export interface NewsModel {
    id: number,
    srcBackground: string | undefined,
    orientation: number,
    media: MediaModel
}