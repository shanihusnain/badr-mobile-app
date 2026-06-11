import { GoalId } from "../home/components/goalsData";

export type LogStepId = "date" | "prayerSelect" | "timing" | "congregation" | "startTime" | "duration";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type TimingOption = "onTime" | "qadha";

export type CongregationOption = "yes" | "no";

export interface ProgressLogConfig {
  summaryTitleKey: string;
  totalCount: number;
  totalUnitKey: string;
  steps: LogStepId[];
}

const DEFAULT_STEPS: LogStepId[] = ["date", "prayerSelect", "timing", "congregation", "startTime", "duration"];

const FIVE_DAILY_STEPS: LogStepId[] = ["date", "prayerSelect", "timing", "congregation", "startTime", "duration"];

export const PROGRESS_LOG_CONFIG: Partial<Record<GoalId, ProgressLogConfig>> = {
  "prayer-fiveDailyPrayers": {
    summaryTitleKey: "progressLogging.onTimeObligatoryPrayers",
    totalCount: 140,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: FIVE_DAILY_STEPS,
  },
  "prayer-tawbah": {
    summaryTitleKey: "progressLogging.tawbahPrayer",
    totalCount: 10,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-tahiyyat": {
    summaryTitleKey: "progressLogging.tahiyyatWudhu",
    totalCount: 25,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-tahiyyatMasjid": {
    summaryTitleKey: "progressLogging.tahiyyatMasjid",
    totalCount: 47,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-istikhara": {
    summaryTitleKey: "progressLogging.istikharaPrayer",
    totalCount: 9,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-shukr": {
    summaryTitleKey: "progressLogging.shukrPrayer",
    totalCount: 8,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-sunnah": {
    summaryTitleKey: "progressLogging.sunnahRawatib",
    totalCount: 12,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-duha": {
    summaryTitleKey: "progressLogging.duhaPrayer",
    totalCount: 22,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-qiyam": {
    summaryTitleKey: "progressLogging.qiyamPrayer",
    totalCount: 10,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
  "prayer-missed": {
    summaryTitleKey: "progressLogging.missedPastPrayers",
    totalCount: 17,
    totalUnitKey: "progressLogging.unitPrayers",
    steps: DEFAULT_STEPS,
  },
};

export const getProgressLogConfig = (goalId: GoalId): ProgressLogConfig => {
  return (
    PROGRESS_LOG_CONFIG[goalId] ?? {
      summaryTitleKey: "progressLogging.defaultGoal",
      totalCount: 0,
      totalUnitKey: "progressLogging.unitPrayers",
      steps: DEFAULT_STEPS,
    }
  );
};

export const PRAYER_OPTIONS: PrayerName[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];
