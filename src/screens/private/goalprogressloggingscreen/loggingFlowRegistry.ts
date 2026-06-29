import { GoalId } from "../home/components/goalsData";
import {
  getCompletionRecitationProgress,
  getCurrentCompletionNumber,
} from "./quranRecitationCompletionData";
import { getJuzRecitationProgress } from "./quranRecitationJuzData";
import {
  getQuranMemorisationTargetConfig,
  isSurahMemorisationGoalId,
} from "./quranMemorisationTarget";
import {
  getQuranMemorisationHizbTargetConfig,
  isHizbMemorisationGoalId,
} from "./quranMemorisationHizbTarget";
import {
  getQuranMemorisationJuzTargetConfig,
  isJuzMemorisationGoalId,
} from "./quranMemorisationJuzTarget";
import {
  getQuranRecitationTargetConfig,
  getRecitationCycleTotal,
  isSurahRecitationGoalId,
} from "./quranRecitationTarget";
import {
  isCompletionGoalId,
  isJuzRecitationGoalId,
  isQuranHoursGoalId,
  LoggingFlowTemplate,
  QuranCompletionFlowDefinition,
  QuranHoursFlowDefinition,
  QuranJuzFlowDefinition,
  QuranMemorisationFlowDefinition,
  QuranMemorisationHizbFlowDefinition,
  QuranMemorisationJuzFlowDefinition,
  QuranRecitationFlowDefinition,
} from "./types";

const QURAN_HOURS_FLOW_CONFIG = {
  "quran-listening": {
    summaryTitleKey: "progressLogging.hoursGoalTitleListening",
    totalHours: 60,
    icon: "headphones" as const,
  },
  "quran-Tajweed": {
    summaryTitleKey: "progressLogging.hoursGoalTitleTajweed",
    totalHours: 60,
    icon: "book-open-page-variant" as const,
  },
};

const FLOW_TEMPLATE_BY_GOAL: Partial<Record<GoalId, LoggingFlowTemplate>> = {
  "quran-listening": "quran-hours",
  "quran-Tajweed": "quran-hours",
  "quran-recitationBySurah-daily": "quran-recitation",
  "quran-recitationBySurah-weekly": "quran-recitation",
  "quran-memorisationBySurah": "quran-memorisation",
  "quran-memorisationByHizb": "quran-memorisation",
  "quran-memorisationByJuz": "quran-memorisation",
  "quran-recitationByCompletion": "quran-completion",
  "quran-recitationByJuz": "quran-juz",
  "prayer-tahiyyat": "tahiyat-ul-wudhu",
  "prayer-missed": "missed-prayers",
  "prayer-tahiyyatMasjid": "tahiyat-al-masjid",
  "prayer-duha": "duha-prayer",
  "prayer-tawbah": "tawbah-prayer",
  "prayer-istikhara": "istikhara-prayer",
  "prayer-shukr": "shukr-prayer",
  "prayer-qiyam": "qiyam-al-layl",
  "prayer-sunnah": "sunnah-rawatib",
  "sadaqah-zakat": "missed-zakat",
  "sadaqah-kafarah": "kaffarah-fasts-oaths",
  "sadaqah-fidya": "fidya",
  "sadaqah-Lillah": "lillah",
  "sadaqah-jariyah": "sadaqah-jariyah",
  "sadaqah-volunteering": "sadaqah-volunteering",
  "fasting-ramadan": "missed-ramadan-fasts",
  "fasting-mondayThursday": "monday-thursday-fasts",
  "fasting-whiteDays": "white-days-fasts",
};

export function getLoggingFlowTemplate(goalId: GoalId): LoggingFlowTemplate {
  return FLOW_TEMPLATE_BY_GOAL[goalId] ?? "prayer-session";
}

export function getQuranHoursFlowDefinition(
  goalId: GoalId,
): QuranHoursFlowDefinition | null {
  if (!isQuranHoursGoalId(goalId)) return null;

  return {
    template: "quran-hours",
    goalId,
    config: QURAN_HOURS_FLOW_CONFIG[goalId],
  };
}

export function getQuranRecitationFlowDefinition(
  goalId: GoalId,
): QuranRecitationFlowDefinition | null {
  if (!isSurahRecitationGoalId(goalId)) return null;

  const target = getQuranRecitationTargetConfig(goalId);

  return {
    template: "quran-recitation",
    goalId,
    config: {
      ...target,
      cycleTotal: getRecitationCycleTotal(target.frequency, target.quantity),
    },
  };
}

export function getQuranMemorisationFlowDefinition(
  goalId: GoalId,
): QuranMemorisationFlowDefinition | null {
  if (!isSurahMemorisationGoalId(goalId)) return null;

  return {
    template: "quran-memorisation",
    goalId,
    config: getQuranMemorisationTargetConfig(goalId),
  };
}

export function getQuranMemorisationHizbFlowDefinition(
  goalId: GoalId,
): QuranMemorisationHizbFlowDefinition | null {
  if (!isHizbMemorisationGoalId(goalId)) return null;

  return {
    template: "quran-memorisation",
    goalId,
    config: getQuranMemorisationHizbTargetConfig(goalId),
  };
}

export function getQuranMemorisationJuzFlowDefinition(
  goalId: GoalId,
): QuranMemorisationJuzFlowDefinition | null {
  if (!isJuzMemorisationGoalId(goalId)) return null;

  return {
    template: "quran-memorisation",
    goalId,
    config: getQuranMemorisationJuzTargetConfig(goalId),
  };
}

export function getQuranCompletionFlowDefinition(
  goalId: GoalId,
): QuranCompletionFlowDefinition | null {
  if (!isCompletionGoalId(goalId)) return null;

  const progress = getCompletionRecitationProgress();

  return {
    template: "quran-completion",
    goalId,
    config: {
      targetCompletions: progress.targetCompletions,
      completedCompletions: progress.completedCompletions,
      currentCompletion: getCurrentCompletionNumber(progress),
    },
  };
}

export function getQuranJuzFlowDefinition(
  goalId: GoalId,
): QuranJuzFlowDefinition | null {
  if (!isJuzRecitationGoalId(goalId)) return null;

  const progress = getJuzRecitationProgress();

  return {
    template: "quran-juz",
    goalId,
    config: {
      targetJuzCount: progress.targetJuzCount,
      completedJuzCount: progress.completedJuzCount,
      targetJuzRange: progress.targetJuzRange,
    },
  };
}
