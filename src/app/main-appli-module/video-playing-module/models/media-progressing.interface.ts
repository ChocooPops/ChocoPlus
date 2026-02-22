import { ProgressStateMedia } from "../../media-module/models/progress-state-media.enum";

export interface MediaProgressingModel {
    mediaId: number,
    watchProgress: number,
    stateProgress: ProgressStateMedia
}