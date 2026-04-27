import { CategorySimpleModel } from "../../edition-module/models/category/categorySimple.model";
import { CreditModel } from "./credit.interface";

export interface MediaInfoModel {
    id: number,
    casts: CreditModel[],
    crews: CreditModel[],
    categories: CategorySimpleModel[],
    keyWords: string[]
}