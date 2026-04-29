import { CategorySimpleModel } from "../../edition-module/models/category/categorySimple.model";
import { MediaCreditModel } from "./media-credit.interface";

export interface MediaInfoModel {
    id: number,
    casts: MediaCreditModel[],
    crews: MediaCreditModel[],
    categories: CategorySimpleModel[],
    keyWords: string[]
}