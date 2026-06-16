import { convertTabPropsToOptions } from "expo-router/build/native-tabs/NativeTabTrigger";
import { GoalId } from "../home/components/goalsData";
import {
  getQuranRecitationTargetConfig,
  getRecitationCycleTotal,
  isSurahRecitationGoalId,
} from "./quranRecitationTarget";
import {
  isQuranHoursGoalId,
  LoggingFlowTemplate,
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
  "quran-recitationBySurah": "quran-recitation",
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
