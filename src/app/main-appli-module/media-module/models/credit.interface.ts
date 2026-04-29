import { JobModel } from "./job.eum";

export interface CreditModel {
    id: number,
    tmdbId: number,
    fullName: string,
    originalFullName: string,
    character: string | null,
    srcPoster: string | null,
    job: JobModel,
    episodeCount?: number,
    order: number
}