import { MediaTypeModel } from "./media-type.enum";

export interface SeasonHistoryModel {
    id: number,
    seriesId: number,
    name: string,
    seasonNumber: number,
    srcPoster: string | undefined,
    isRecent: boolean
}

export interface MediaHistoryModel {
    id: number,
    title: string,
    description: string | undefined,
    date?: Date | undefined,
    srcPosterNormal?: string[] | undefined,
    srcPosterSpecial?: string[] | undefined,
    srcPosterLicense?: string[] | undefined,
    srcLogo?: string | undefined,
    srcBackgroundImage?: string | undefined,
    mediaType: MediaTypeModel,
    seasons?: SeasonHistoryModel[],
    duration?: number,
    resolution?: string
}
