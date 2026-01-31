import { MediaModel } from "../../media-module/models/media.interface";

export interface StreamInfoModel {
    url: string,
    title: string,
    media: MediaModel,
    idx: number,
    audios: { name: string, index: number }[],
    subtitles: { name: string, index: number }[]
}