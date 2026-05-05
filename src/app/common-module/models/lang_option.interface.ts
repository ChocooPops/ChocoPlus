import { SupportedLang } from "./supported-lang.enum";

export interface LangOption {
  code: SupportedLang;
  label: string;
  flag: string;
}