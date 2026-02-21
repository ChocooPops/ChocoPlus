import { MediaTypeModel } from "./media-type.enum";
import { MediaModel } from "./media.interface";
import { ProgressStateMedia } from "./progress-state-media.enum";

export interface MovieModel extends MediaModel {
    time: number,
    watchProgress: number,
    stateProgress: ProgressStateMedia,
    quality: string,
    mediaType: MediaTypeModel.MOVIE
}
