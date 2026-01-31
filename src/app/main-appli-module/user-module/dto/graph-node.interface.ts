import { MediaTypeModel } from "../../media-module/models/media-type.enum";

export interface GraphNode {
    id: number;
    name: string;
    color: string;
    rayon: number;
    mediaType: MediaTypeModel;
}