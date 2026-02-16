import { TopMedia } from "./top-media.interface";
import { MediaTypeFilter } from "./media-type-filter.type";

export interface TopMediaResponse {
  userId: number;
  mediaType: MediaTypeFilter;
  topMedia: TopMedia[];
}