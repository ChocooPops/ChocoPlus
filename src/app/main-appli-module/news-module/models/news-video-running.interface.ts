import { MediaModel } from "../../media-module/models/media.interface";

export interface NewsVideoRunningModel {
    id: number,
    jellyfinId: string | undefined,
    srcBackground: string | undefined,
    startShow: string,
    endShow: string,
    media: MediaModel,
}