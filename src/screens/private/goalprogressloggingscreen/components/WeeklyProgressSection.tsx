import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { QuranHoursWeeklyProgressDashboard } from "@/components/molecules/QuranHoursWeeklyProgressDashboard";
import { PrayerProgressTrackerRing } from "@/components/molecules/PrayerProgressTrackerRing";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";
import { GoalData } from "../../home/components/goalsData";
import {
  getLoggingFlowTemplate,
  getQuranHoursFlowDefinition,
} from "../loggingFlowRegistry";
import { getQuranHoursWeekSummary } from "../quranHoursWeeklyData";
import { isQuranHoursGoalId } from "../types";

type Props = {
  goalData: GoalData;
};

export function WeeklyProgressSection({ goalData }: Props) {
  const { t } = useTranslation();
  const template = getLoggingFlowTemplate(goalData.id);

  const quranWeek = useMemo(() => {
    if (!isQuranHoursGoalId(goalData.id)) return null;
    return getQuranHoursWeekSummary(goalData.id);
  }, [goalData.id]);

  const quranFlow = getQuranHoursFlowDefinition(goalData.id);

  if (template === "quran-hours" && quranWeek && quranFlow) {
    const statsIcon =
      quranFlow.config.icon === "headphones" ? "headphones" : "book-open-page-variant";

    return (
      <QuranHoursWeeklyProgressDashboard
        weekDays={quranWeek.weekDays}
        weekRangeLabel={quranWeek.weekRangeLabel}
        weekFraction={quranWeek.weekFraction}
        totalMinutesThisWeek={quranWeek.totalMinutesThisWeek}
        streakDays={quranWeek.streakDays}
        motivationalQuote={t(quranWeek.motivationalQuoteKey)}
        statsIcon={statsIcon}
      />
    );
  }

  return (
    <WeeklyProgressDashboard
      renderRing={(day: DayProgress, size: number) => (
        <PrayerProgressTrackerRing
          statuses={day.statuses}
          isMenstruating={day.isMenstruating}
          size={size}
          strokeWidth={2.5}
        />
      )}
    />
  );
}
