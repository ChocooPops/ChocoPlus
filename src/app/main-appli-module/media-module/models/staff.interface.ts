import { JobModel } from "./job.eum";

export interface StaffModel {
    id: number,
    fullName: string,
    fullNameCharacter ?: string,
    job: JobModel,
    srcPoster: string | undefined
}