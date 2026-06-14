import { ProcessStatus } from "./process-status.enum";

export interface ChocoPlayerModel {
    MediaId: number,
    Title: string,
    Url: string,
    Height: number,
    Width: number,
    WatchProgress: number,
    EpisodeId: number;
    SeasonIndex: number;
    SeasonMenu: any[],
    status?: ProcessStatus,
}