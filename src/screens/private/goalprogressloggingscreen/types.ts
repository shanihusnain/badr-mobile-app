import { GoalId } from "../home/components/goalsData";
import type {
  QuranRecitationGoalId,
  QuranRecitationTargetConfig,
  RecitationFrequency,
  SurahRecitationGoalId,
} from "./quranRecitationTarget";

export type LoggingFlowTemplate =
  | "prayer-session"
  | "quran-hours"
  | "quran-recitation"
  | "quran-recitationBySurah"
  | "quran-recitationByCompletion"
  | "quran-recitationByJuz"
  | "tahiyat-ul-wudhu"
  | "missed-prayers"
  | "tahiyat-al-masjid";

export type {
  QuranRecitationGoalId,
  RecitationFrequency,
  SurahRecitationGoalId,
};

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

export type QuranRecitationLogEntry = {
  type: "quran-recitation";
  goalId: QuranRecitationGoalId;
  date: string;
  startTime: string;
  recitationCount: number;
  hours: number;
  minutes: number;
  durationLabel: string;
  recitationDurations: Array<{ hours: number; minutes: number }>;
  frequency: RecitationFrequency;
  targetQuantity: number;
  surahName: string;
};

export type ProgressLogEntry =
  | QuranHoursLogEntry
  | QuranRecitationLogEntry
  | Record<string, unknown>;

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

export const isQuranHoursGoalId = (
  goalId: GoalId,
): goalId is QuranHoursGoalId =>
  goalId === "quran-listening" || goalId === "quran-Tajweed";

export type QuranRecitationFlowConfig = QuranRecitationTargetConfig & {
  cycleTotal: number;
};

export type QuranRecitationFlowDefinition = {
  template: "quran-recitation";
  goalId: SurahRecitationGoalId;
  config: QuranRecitationFlowConfig;
};
