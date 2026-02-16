import { PeriodType } from "./period.type";
import { ContentType } from "./content.type";

export interface FilterOption {
  value: PeriodType | ContentType;
  label: string;
  icon: string;
}