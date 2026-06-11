import { Colors } from "@/constants/theme";

export type FastingCategoryLegendEntry = {
  id: string;
  label: string;
  color: string;
};

export const FASTING_CATEGORY_LEGEND_ENTRIES: FastingCategoryLegendEntry[] = [
  {
    id: "missed-ramadan",
    label: "MISSED RAMADAN",
    color: Colors.light.ringRamadan,
  },
  {
    id: "mon-thu",
    label: "MONDAYS & THURSDAYS",
    color: Colors.light.ringMonThu,
  },
  {
    id: "white-days",
    label: "WHITE DAYS",
    color: Colors.light.white,
  },
];

export type FastingLegendEntry = {
  id: string;
  plannedLabel: string;
  completedLabel: string;
  color: string;
};

export const FASTING_LEGEND_ENTRIES: FastingLegendEntry[] = [
  {
    id: "missed-ramadan",
    plannedLabel: "PLANNED MISSED RAMADAN FAST",
    completedLabel: "COMPLETED MISSED RAMADAN FAST",
    color: Colors.light.ringRamadan,
  },
  {
    id: "mon-thu",
    plannedLabel: "PLANNED MON & THU FAST",
    completedLabel: "COMPLETED MON & THU FAST",
    color: Colors.light.ringMonThu,
  },
  {
    id: "white-days",
    plannedLabel: "PLANNED WHITE DAYS",
    completedLabel: "COMPLETED WHITE DAYS",
    color: Colors.light.white,
  },
];
