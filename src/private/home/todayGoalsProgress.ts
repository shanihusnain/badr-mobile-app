import type { DashboardFilterTab } from "./dashboardSubGoals";

/** Optional time fields mirror what the user may enter when logging progress. */
export type TodayGoalProgressDuration = {
  startTime?: string;
  endTime?: string;
  /** Pre-formatted label, e.g. "(0.10)" hours — from API or computed on save. */
  label?: string;
};

export type TodayGoalProgressEntry = {
  id: string;
  category: Exclude<DashboardFilterTab, "All">;
  goalTitle: string;
  description: string;
  /** Optional single timestamp for when progress was logged. */
  loggedAt?: string;
  /** Optional session window; any field may be omitted independently. */
  duration?: TodayGoalProgressDuration;
};

/** How many progress cards to show before "Show More". */
export const TODAY_GOALS_PROGRESS_PREVIEW_COUNT = 2;

/**
 * Placeholder data covering common logging combinations.
 * Replace with API / store data once progress logging is wired.
 */
export const TODAY_GOALS_PROGRESS: TodayGoalProgressEntry[] = [
  {
    id: "sunnah-rawatib-dhuhr",
    category: "Prayer",
    goalTitle: "SUNNAH RAWATIB",
    description: "2 Sunnah prayers before Dhuhr",
    loggedAt: "10:00 AM",
    duration: {
      startTime: "8:00 AM",
      endTime: "8:10 AM",
      label: "(0.10)",
    },
  },
  {
    id: "tahiyyat-wudhu-morning",
    category: "Prayer",
    goalTitle: "TAHIYYAT AL-WUDHU",
    description: "Prayer after wudu",
    loggedAt: "7:30 AM",
  },
  {
    id: "quran-page-fajr",
    category: "Quran",
    goalTitle: "QURAN RECITATION",
    description: "1 page after Fajr",
  },
  {
    id: "monday-fast",
    category: "Fasting",
    goalTitle: "MONDAY FAST",
    description: "Voluntary fast completed",
    duration: {
      startTime: "5:20 AM",
      endTime: "7:15 PM",
      label: "(13.9)",
    },
  },
  {
    id: "sadaqah-donation",
    category: "Sadaqah",
    goalTitle: "SADAQAH JARIYAH",
    description: "$25 donation to local masjid",
    loggedAt: "2:45 PM",
  },
  {
    id: "qiyam-layl",
    category: "Prayer",
    goalTitle: "QIYAM AL-LAYL",
    description: "2 rakah + witr",
    duration: {
      endTime: "4:30 AM",
      label: "(0.25)",
    },
  },
];

export function getVisibleTodayGoalProgress(
  entries: TodayGoalProgressEntry[],
  selectedCategory: DashboardFilterTab | string,
): TodayGoalProgressEntry[] {
  if (selectedCategory === "All") {
    return entries;
  }
  return entries.filter((entry) => entry.category === selectedCategory);
}

export function getDisplayedTodayGoalProgress(
  entries: TodayGoalProgressEntry[],
  isExpanded: boolean,
  previewCount = TODAY_GOALS_PROGRESS_PREVIEW_COUNT,
): TodayGoalProgressEntry[] {
  if (isExpanded || entries.length <= previewCount) {
    return entries;
  }
  return entries.slice(0, previewCount);
}

export function canExpandTodayGoalProgress(
  entries: TodayGoalProgressEntry[],
  previewCount = TODAY_GOALS_PROGRESS_PREVIEW_COUNT,
): boolean {
  return entries.length > previewCount;
}

export function hasLoggedTime(entry: TodayGoalProgressEntry): boolean {
  return Boolean(entry.loggedAt);
}

export function hasDurationDetails(entry: TodayGoalProgressEntry): boolean {
  const { duration } = entry;
  if (!duration) {
    return false;
  }
  return Boolean(duration.startTime || duration.endTime || duration.label);
}

export function hasDurationTimeline(entry: TodayGoalProgressEntry): boolean {
  const { duration } = entry;
  return Boolean(duration?.startTime && duration?.endTime);
}
