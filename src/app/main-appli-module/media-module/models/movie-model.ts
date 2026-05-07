import { MediaTypeModel } from "./media-type.enum";
import { MediaModel } from "./media.interface";
import { ProgressStateMedia } from "./progress-state-media.enum";

export interface MovieModel extends MediaModel {
    duration: number,
    watchProgress: number,
    stateProgress: ProgressStateMedia,
    resolution: string,
    mediaType: MediaTypeModel.MOVIE
}
