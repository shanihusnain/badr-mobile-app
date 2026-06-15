import { GoalId } from "../home/components/goalsData";
import {
  isQuranHoursGoalId,
  LoggingFlowTemplate,
  QuranHoursFlowDefinition,
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
