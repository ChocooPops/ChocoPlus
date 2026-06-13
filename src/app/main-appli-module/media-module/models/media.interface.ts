import { TranslationTitle } from "../../edition-module/models/translation-title.interface"
import { CategorySimpleModel } from "../../edition-module/models/category/categorySimple.model";
import { MediaTypeModel } from "./media-type.enum";
import { MediaCreditModel } from "./media-credit.interface";

export interface MediaModel {
    id: number,
    title: string,
    mediaLibraryId: string,
    otherTitles?: TranslationTitle[],
    credits?: MediaCreditModel[],
    keyWords?: string[] | undefined,
    categories?: CategorySimpleModel[],
    description?: string | undefined,
    date?: Date | undefined,
    startShow?: string | undefined,
    endShow?: string | undefined,
    srcPosterNormal?: string[] | undefined,
    srcPosterSpecial?: string[] | undefined,
    srcPosterLicense?: string[] | undefined,
    srcPosterHorizontal?: string[] | undefined,
    srcLogo?: string | undefined,
    srcBackgroundImage?: string | undefined,
    typeZoomX: boolean | undefined;
    typeZoomY: boolean,
    mediaType: MediaTypeModel,
    isRecent: boolean,

    path?: string
}