import { GoalId } from "../home/components/goalsData";

export type LoggingFlowTemplate = "prayer-session" | "quran-hours" | "tahiyat-ul-wudhu" | "missed-prayers" | "tahiyat-al-masjid";

export type QuranHoursGoalId = "quran-listening" | "quran-Tajweed";

export type QuranHoursLogEntry = {
  type: "quran-hours";
  goalId: QuranHoursGoalId;
  date: string;
  startTime: string;
  hours: number;
  minutes: number;
  durationLabel: string;
};

export type ProgressLogEntry = QuranHoursLogEntry | Record<string, unknown>;

export type QuranHoursFlowConfig = {
  summaryTitleKey: string;
  totalHours: number;
  icon: "headphones" | "book-open-page-variant";
};

export type QuranHoursFlowDefinition = {
  template: "quran-hours";
  goalId: QuranHoursGoalId;
  config: QuranHoursFlowConfig;
};

export const isQuranHoursGoalId = (goalId: GoalId): goalId is QuranHoursGoalId =>
  goalId === "quran-listening" || goalId === "quran-Tajweed";
