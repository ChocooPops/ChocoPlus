import { CalculationMode } from "./calculate-mode.type";

export interface ModeOption {
  value: CalculationMode;
  label: string;
  description: string;
  icon: string;
}