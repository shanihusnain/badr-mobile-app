import { Colors } from "@/constants/theme";
import type {
  HomeFastingCalendarData,
  HomeFastingCalendarDay,
  HomeFastingCalendarMark,
  HomeFastingCalendarTab,
  HomeFastingCalendarView,
} from "@/src/api/queries/useGetHomeFastingCalendar";
import type {
  FastingCategory,
  PlannedFastMarker,
  PlannedFastState,
} from "./plannedFasts";

export const HOME_FASTING_FALLBACK_TABS: HomeFastingCalendarTab[] = [
  { key: "ALL", label: "All" },
  { key: "MISSED_RAMADAN", label: "Missed Ramadan Fasts" },
  { key: "MONDAY_THURSDAY", label: "Monday & Thursday Fasts" },
  { key: "PROPHET_DAWOOD", label: "Dawood Fasts" },
  { key: "WHITE_DAYS", label: "White Days Fasts" },
];

export const HOME_FASTING_FALLBACK_VIEWS: HomeFastingCalendarView[] = [
  { key: "PLANNED", label: "Planned" },
  { key: "PROGRESS", label: "Planned vs. Progress" },
];

const TAB_MARKER_META: Record<
  string,
  { category: FastingCategory; color: string }
> = {
  WHITE_DAYS: {
    category: "white_days",
    color: Colors.light.white,
  },
  WHITE_DAY: {
    category: "white_days",
    color: Colors.light.white,
  },
  MONDAY_THURSDAY: {
    category: "mon_thu",
    color: Colors.light.ringMonThu,
  },
  MON_THU: {
    category: "mon_thu",
    color: Colors.light.ringMonThu,
  },
  MISSED_RAMADAN: {
    category: "ramadan",
    color: Colors.light.ringRamadan,
  },
  RAMADAN: {
    category: "ramadan",
    color: Colors.light.ringRamadan,
  },
  PROPHET_DAWOOD: {
    category: "dawood",
    color: Colors.light.ringDawood,
  },
  DAWOOD: {
    category: "dawood",
    color: Colors.light.ringDawood,
  },
  ALL: {
    category: "white_days",
    color: Colors.light.white,
  },
};

function markToState(
  mark: HomeFastingCalendarMark | string | null | undefined,
): PlannedFastState | null {
  if (!mark) return null;
  const statusStr = typeof mark === "object" ? mark.status : mark;
  const key = String(statusStr ?? "")
    .trim()
    .toUpperCase();
  if (!key) return null;
  if (key === "COMPLETED") return "completed";
  if (key === "SKIPPED" || key === "MISSED") return "missed";
  if (key === "PLANNED") return "planned";
  return null;
}

export function normalizeFastingTabKey(tab: string | null | undefined): string {
  const key = String(tab ?? "ALL")
    .trim()
    .toUpperCase();
  if (key.includes("DAWOOD")) return "PROPHET_DAWOOD";
  if (key.includes("RAMADAN")) return "MISSED_RAMADAN";
  if (key.includes("MON") || key.includes("THU")) return "MONDAY_THURSDAY";
  if (key.includes("WHITE")) return "WHITE_DAYS";
  return key || "ALL";
}

export function normalizeFastingViewKey(
  view: string | null | undefined,
): "PLANNED" | "PROGRESS" {
  const key = String(view ?? "PROGRESS")
    .trim()
    .toUpperCase();
  return key === "PLANNED" ? "PLANNED" : "PROGRESS";
}

export function viewKeyToTrackVariant(
  view: string | null | undefined,
): "planned" | "progress" {
  return normalizeFastingViewKey(view) === "PLANNED" ? "planned" : "progress";
}

export function resolveHomeFastingTabs(
  tabs: HomeFastingCalendarTab[] | null | undefined,
): HomeFastingCalendarTab[] {
  if (Array.isArray(tabs) && tabs.length > 0) {
    return tabs.map((tab) => ({
      key: normalizeFastingTabKey(tab.key),
      label: String(tab.label ?? tab.key ?? "").trim() || String(tab.key),
    }));
  }
  return HOME_FASTING_FALLBACK_TABS;
}

export function resolveHomeFastingViews(
  views: HomeFastingCalendarView[] | null | undefined,
): HomeFastingCalendarView[] {
  if (Array.isArray(views) && views.length > 0) {
    return views.map((view) => ({
      key: normalizeFastingViewKey(view.key),
      label: String(view.label ?? view.key ?? "").trim() || String(view.key),
    }));
  }
  return HOME_FASTING_FALLBACK_VIEWS;
}

export function mapHomeFastingDaysToMarkers(
  days: HomeFastingCalendarDay[] | null | undefined,
  tabKey: string,
): PlannedFastMarker[] {
  if (!Array.isArray(days) || days.length === 0) return [];
  const defaultMeta =
    TAB_MARKER_META[normalizeFastingTabKey(tabKey)] ?? TAB_MARKER_META.ALL;

  return days
    .map((day) => {
      const state = markToState(day?.mark);
      if (!state) return null;
      const date = String(day?.date ?? "").trim();
      if (!date) return null;

      let meta = defaultMeta;
      if (day?.mark && typeof day.mark === "object" && day.mark.fastingType) {
        const markTypeKey = normalizeFastingTabKey(day.mark.fastingType);
        meta = TAB_MARKER_META[markTypeKey] ?? defaultMeta;
      }

      return {
        date,
        category: meta.category,
        color: meta.color,
        state,
      } satisfies PlannedFastMarker;
    })
    .filter((marker): marker is PlannedFastMarker => marker != null);
}

export function resolveHomeFastingWindow(
  days: HomeFastingCalendarDay[] | null | undefined,
): { startDate: string; endDate: string } | null {
  if (!Array.isArray(days) || days.length === 0) return null;
  const dates = days
    .map((day) => String(day?.date ?? "").trim())
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return null;
  return { startDate: dates[0], endDate: dates[dates.length - 1] };
}

export function resolveHomeFastingCalendarLabels(
  data: HomeFastingCalendarData | null | undefined,
): {
  title: string;
  description: string;
  rangeLabel: string;
  hijriRangeLabel: string;
  footnote: string;
  goalLabel: string;
  goalValue: number;
  goalUnit: string;
  completedLabel: string;
  completedValue: number;
  completedUnit: string;
} {
  return {
    title: data?.title?.trim() || "YOUR FASTING CALENDAR",
    description:
      data?.description?.trim() ||
      "Stay on top of your monthly fasting goals — view your planned fasts, track completed days, and see what's skipped or remaining.",
    rangeLabel: data?.rangeLabel?.trim() || "",
    hijriRangeLabel: data?.hijriRangeLabel?.trim() || "",
    footnote: data?.footnote?.trim() || "",
    goalLabel: data?.goal?.label?.trim() || "GOAL",
    goalValue:
      typeof data?.goal?.value === "number" && Number.isFinite(data.goal.value)
        ? data.goal.value
        : 0,
    goalUnit: data?.goal?.unit?.trim() || "fasts",
    completedLabel: data?.completed?.label?.trim() || "COMPLETED",
    completedValue:
      typeof data?.completed?.value === "number" &&
      Number.isFinite(data.completed.value)
        ? data.completed.value
        : 0,
    completedUnit: data?.completed?.unit?.trim() || "fasts",
  };
}

export { resolveHomeFastingWindow as getHomeFastingWindowDates };
