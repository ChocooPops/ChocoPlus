export interface EditCreditModel {
    id: number,
    tmdbId: number | undefined,
    fullName: string | undefined,
    originalFullName: string | undefined,
    srcPoster: string | ArrayBuffer | undefined | null
}