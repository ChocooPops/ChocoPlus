export interface CategoryModel {
    id: number,
    tmdbId: number | undefined,
    translationKey: string,
    nameSelection: string,
    movies: number[],
    series: number[]
}