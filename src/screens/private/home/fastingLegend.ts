import { Colors } from "@/constants/theme";
import type { HomeFastingCalendarDay } from "@/src/api/queries/useGetHomeFastingCalendar";

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
  {
    id: "dawood",
    label: "PROPHET DAWOOD (AS)",
    color: Colors.light.ringDawood,
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
  {
    id: "dawood",
    plannedLabel: "PLANNED DAWOOD FAST",
    completedLabel: "COMPLETED DAWOOD FAST",
    color: Colors.light.ringDawood,
  },
];

export const FASTING_LEGEND_BY_TYPE: Record<string, FastingLegendEntry> = {
  MISSED_RAMADAN: FASTING_LEGEND_ENTRIES[0],
  RAMADAN: FASTING_LEGEND_ENTRIES[0],
  MONDAY_THURSDAY: FASTING_LEGEND_ENTRIES[1],
  MON_THU: FASTING_LEGEND_ENTRIES[1],
  WHITE_DAYS: FASTING_LEGEND_ENTRIES[2],
  WHITE_DAY: FASTING_LEGEND_ENTRIES[2],
  PROPHET_DAWOOD: FASTING_LEGEND_ENTRIES[3],
  DAWOOD: FASTING_LEGEND_ENTRIES[3],
};

export function normalizeFastingTypeKey(
  type: string | null | undefined,
): string {
  const upper = String(type ?? "")
    .trim()
    .toUpperCase();
  if (upper.includes("DAWOOD")) return "DAWOOD";
  if (upper.includes("RAMADAN")) return "MISSED_RAMADAN";
  if (upper.includes("MON") || upper.includes("THU")) return "MONDAY_THURSDAY";
  if (upper.includes("WHITE")) return "WHITE_DAYS";
  return upper;
}

/**
 * Derives the active legend entries based on the markers present in the days array.
 * If marks exist in days, only the fasting types appearing in the days array are returned.
 */
export function resolveFastingLegendEntries(
  days: HomeFastingCalendarDay[] | null | undefined,
  selectedTabKey?: string,
): FastingLegendEntry[] {
  const seenTypes = new Set<string>();

  if (Array.isArray(days)) {
    for (const day of days) {
      if (day?.mark) {
        const type =
          typeof day.mark === "object"
            ? day.mark.fastingType
            : String(day.mark);
        if (type) {
          const normalized = normalizeFastingTypeKey(type);
          if (FASTING_LEGEND_BY_TYPE[normalized]) {
            seenTypes.add(normalized);
          }
        }
      }
    }
  }

  // If markers exist in days, display only those present in days
  if (seenTypes.size > 0) {
    const entries: FastingLegendEntry[] = [];
    for (const type of seenTypes) {
      const entry = FASTING_LEGEND_BY_TYPE[type];
      if (entry && !entries.some((e) => e.id === entry.id)) {
        entries.push(entry);
      }
    }
    if (entries.length > 0) {
      return entries;
    }
  }

  // Fallback: if a specific filter tab is selected and has no marks in days
  const tab = normalizeFastingTypeKey(selectedTabKey ?? "ALL");
  if (tab !== "ALL" && FASTING_LEGEND_BY_TYPE[tab]) {
    return [FASTING_LEGEND_BY_TYPE[tab]];
  }

  // Default fallback when tab is "ALL" and days has no marks yet
  return FASTING_LEGEND_ENTRIES.slice(0, 3);
}
