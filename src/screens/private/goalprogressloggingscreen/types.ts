import { GoalId } from "../home/components/goalsData";
import type {
  QuranMemorisationTargetConfig,
  SurahMemorisationGoalId,
} from "./quranMemorisationTarget";
import type {
  HizbMemorisationGoalId,
  QuranMemorisationHizbTargetConfig,
} from "./quranMemorisationHizbTarget";
import type {
  JuzMemorisationGoalId,
  QuranMemorisationJuzTargetConfig,
} from "./quranMemorisationJuzTarget";
import type {
  QuranRecitationGoalId,
  QuranRecitationTargetConfig,
  RecitationFrequency,
  SurahRecitationGoalId,
} from "./quranRecitationTarget";

export type LoggingFlowTemplate =
  | "prayer-session"
  | "quran-hours"
  | "sadaqah"
  | "fidya"
  | "lillah"
  | "sadaqah-jariyah"
  | "sadaqah-volunteering"
  | "quran-recitation"
  | "quran-memorisation"
  | "quran-completion"
  | "quran-juz"
  | "tahiyat-ul-wudhu"
  | "five-daily-prayers"
  | "missed-prayers"
  | "tahiyat-al-masjid"
  | "duha-prayer"
  | "tawbah-prayer"
  | "istikhara-prayer"
  | "shukr-prayer"
  | "qiyam-al-layl"
  | "sunnah-rawatib"
  | "missed-zakat"
  | "missed-ramadan-fasts"
  | "kaffarah-fasts-oaths"
  | "fidya"
  | "monday-thursday-fasts"
  | "white-days-fasts"
  | "prophet-dawood-fasts";

export type {
  QuranRecitationGoalId,
  RecitationFrequency,
  SurahRecitationGoalId,
};

export type { SurahMemorisationGoalId } from "./quranMemorisationTarget";

export type { HizbMemorisationGoalId } from "./quranMemorisationHizbTarget";

export type { JuzMemorisationGoalId } from "./quranMemorisationJuzTarget";

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

export type QuranMemorisationSurahLogEntry = {
  type: "quran-memorisation";
  goalType: "memorization";
  trackingType: "surah";
  goalId: SurahMemorisationGoalId;
  surahId: string;
  surahName: string;
  totalAyahs: number;
  date: string;
  startTime: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  hours: number;
  minutes: number;
  durationLabel: string;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
};

export type QuranMemorisationHizbLogEntry = {
  type: "quran-memorisation";
  goalType: "memorization";
  trackingType: "hizb";
  goalId: HizbMemorisationGoalId;
  hizbId: string;
  hizbName: string;
  totalAyahs: number;
  date: string;
  startTime: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  hours: number;
  minutes: number;
  durationLabel: string;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
};

export type QuranMemorisationJuzLogEntry = {
  type: "quran-memorisation";
  goalType: "memorization";
  trackingType: "juz";
  goalId: JuzMemorisationGoalId;
  juzId: string;
  juzName: string;
  juzNumber: number;
  totalAyahs: number;
  date: string;
  startTime: string;
  startAyah: number;
  endAyah: number;
  ayahsMemorizedToday: number;
  timeSpentMinutes: number;
  hours: number;
  minutes: number;
  durationLabel: string;
  memorizedAyahs: number;
  progressPercentage: number;
  completed: boolean;
};

export type QuranMemorisationLogEntry =
  | QuranMemorisationSurahLogEntry
  | QuranMemorisationHizbLogEntry
  | QuranMemorisationJuzLogEntry;

export type CompletionGoalId = "quran-recitationByCompletion";

export type QuranCompletionLogEntry = {
  type: "quran-completion";
  goalId: CompletionGoalId;
  date: string;
  startTime: string;
  completionNumber: number;
  completionType: "full" | "partial" | "both";
  fullJuzRange: { startJuz: number; endJuz: number } | null;
  partialJuz: number | null;
  ayatRange: { startAyat: number; endAyat: number } | null;
  fullTimeSpentMinutes: number | null;
  partialTimeSpentMinutes: number | null;
  targetCompletions: number;
};

export type JuzRecitationGoalId = "quran-recitationByJuz";

export type QuranJuzLogEntry = {
  type: "quran-juz";
  goalId: JuzRecitationGoalId;
  date: string;
  startTime: string;
  completionType: "full" | "partial" | "both";
  fullJuzRange: { startJuz: number; endJuz: number } | null;
  partialJuz: number | null;
  ayatRange: { startAyat: number; endAyat: number } | null;
  fullTimeSpentMinutes: number | null;
  partialTimeSpentMinutes: number | null;
  targetJuzCount: number;
};

export type MissedRamadanFastsLogEntry = {
  type: "missed-ramadan-fasts";
  goalId: "fasting-ramadan";
  logType: "completed_planned" | "completed_early" | "made_up_skipped";
  date: string;
  completed: boolean;
  startTime: string;
  endTime: string;
  plannedFastDate?: string;
  actualCompletedDate?: string;
  completedDate?: string;
  plannedDate?: string;
  reconciledFromPlannedDate?: string;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
  wasPlanned: boolean;
};

export type MondayThursdayFastsLogEntry = {
  type: "monday-thursday-fasts";
  goalId: "fasting-mondayThursday";
  logType: "completed_planned" | "completed_early" | "made_up_skipped";
  date: string;
  completed: boolean;
  startTime: string;
  endTime: string;
  plannedFastDate?: string;
  actualCompletedDate?: string;
  missedFastDate?: string;
  plannedDate?: string;
  reconciledFromPlannedDate?: string;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
  wasSelected: boolean;
};

export type WhiteDaysFastsLogEntry = {
  type: "white-days-fasts";
  goalId: "fasting-whiteDays";
  date: string;
  completed: boolean;
  startTime: string;
  endTime: string;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

export type ProphetDawoodFastsLogEntry = {
  type: "prophet-dawood-fasts";
  goalType: "prophet_dawood";
  goalId: "fasting-Dawwod";
  plannedDate: string;
  date: string;
  startTime: string;
  endTime: string;
  cycleDay: number;
  completed: boolean;
  goalTarget: number;
  completedCount: number;
  remainingCount: number;
  goalCompleted: boolean;
};

export type ProgressLogEntry =
  | QuranHoursLogEntry
  | QuranRecitationLogEntry
  | QuranMemorisationLogEntry
  | QuranCompletionLogEntry
  | QuranJuzLogEntry
  | MissedRamadanFastsLogEntry
  | MondayThursdayFastsLogEntry
  | WhiteDaysFastsLogEntry
  | ProphetDawoodFastsLogEntry
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

export type QuranMemorisationFlowConfig = QuranMemorisationTargetConfig;

export type QuranMemorisationFlowDefinition = {
  template: "quran-memorisation";
  goalId: SurahMemorisationGoalId;
  config: QuranMemorisationFlowConfig;
};

export type QuranMemorisationHizbFlowConfig = QuranMemorisationHizbTargetConfig;

export type QuranMemorisationHizbFlowDefinition = {
  template: "quran-memorisation";
  goalId: HizbMemorisationGoalId;
  config: QuranMemorisationHizbFlowConfig;
};

export type QuranMemorisationJuzFlowConfig = QuranMemorisationJuzTargetConfig;

export type QuranMemorisationJuzFlowDefinition = {
  template: "quran-memorisation";
  goalId: JuzMemorisationGoalId;
  config: QuranMemorisationJuzFlowConfig;
};

export type QuranCompletionFlowConfig = {
  targetCompletions: number;
  completedCompletions: number;
  currentCompletion: number | null;
};

export type QuranCompletionFlowDefinition = {
  template: "quran-completion";
  goalId: CompletionGoalId;
  config: QuranCompletionFlowConfig;
};

export type QuranJuzFlowConfig = {
  targetJuzCount: number;
  completedJuzCount: number;
  targetJuzRange: { startJuz: number; endJuz: number };
};

export type QuranJuzFlowDefinition = {
  template: "quran-juz";
  goalId: JuzRecitationGoalId;
  config: QuranJuzFlowConfig;
};

export const isCompletionGoalId = (
  goalId: GoalId,
): goalId is CompletionGoalId => goalId === "quran-recitationByCompletion";

export const isJuzRecitationGoalId = (
  goalId: GoalId,
): goalId is JuzRecitationGoalId => goalId === "quran-recitationByJuz";
