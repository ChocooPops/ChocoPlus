import { CategorySimpleModel } from "./category/categorySimple.model";
import { InputPosterModel } from "./input-poster.interface";
import { TranslationTitle } from "./translation-title.interface";

export interface EditionMediaModel {
    id: number,
    title: string | undefined,
    jellyfinId: string | undefined,
    otherTitles: TranslationTitle[],
    directors: string[] | [],
    actors: string[],
    categories: CategorySimpleModel[],
    keyWords: string[],
    description: string | undefined,
    date: Date,
    startShow: string,
    endShow: string,
    posters: InputPosterModel[],
    horizontalPoster: InputPosterModel[],
    horizontalPosterSameAsBackground: boolean,
    logo: string | ArrayBuffer | undefined | null,
    backgroundImage: string | ArrayBuffer | undefined | null,
}