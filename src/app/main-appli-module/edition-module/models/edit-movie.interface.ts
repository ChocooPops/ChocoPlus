import { EditionMediaModel } from "./edition-media.interface";

export interface EditMovieModel extends EditionMediaModel {
    frames?: number,
    bytes?: number,
    width?: number,
    height?:number
}