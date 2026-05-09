import { MediaTypeModel } from "../../../media-module/models/media-type.enum"
import { ISO_3166_1 } from "../iso-3166-1.enum"
import { StateLibrary } from "./state-library.enum"

export interface Library {
    id: string,
    path: string,
    mediaType: MediaTypeModel,
    lang: ISO_3166_1,
    state: StateLibrary,
    log?: LibraryLog | null;
    selected?: boolean,
}

export interface LibraryLog {
  lastRefresh?: string;
  status?: 'success' | 'error' | 'warning' | 'in_progress';
  entries?: LibraryLogEntry[];
  stats?: LibraryLogStats;
}
 
export interface LibraryLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: Record<string, any>;
}
 
export interface LibraryLogStats {
  totalFiles: number;
  errors: number;
  warnings: number;
  newFiles?: number;
  removedFiles?: number;
}