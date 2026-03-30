import { CategorySimpleModel } from "../../edition-module/models/category/categorySimple.model";
import { StaffModel } from "./staff.interface";

export interface MediaInfoModel {
    id: number,
    actors: StaffModel[],
    directors: StaffModel[],
    categories: CategorySimpleModel[],
    keyWords: string[]
}