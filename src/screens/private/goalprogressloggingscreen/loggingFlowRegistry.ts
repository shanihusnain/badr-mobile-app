import { GoalId } from "../home/components/goalsData";
import {
  getCompletionRecitationProgress,
  getCurrentCompletionNumber,
} from "./quranRecitationCompletionData";
import {
  getQuranRecitationTargetConfig,
  getRecitationCycleTotal,
  isSurahRecitationGoalId,
} from "./quranRecitationTarget";
import {
  isCompletionGoalId,
  isQuranHoursGoalId,
  LoggingFlowTemplate,
  QuranCompletionFlowDefinition,
  QuranHoursFlowDefinition,
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
  "quran-recitationByCompletion": "quran-completion",
  "prayer-tahiyyat": "tahiyat-ul-wudhu",
  "prayer-missed": "missed-prayers",
  "prayer-tahiyyatMasjid": "tahiyat-al-masjid",
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
