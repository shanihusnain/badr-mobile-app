import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { QuranHoursWeeklyProgressDashboard } from "@/components/molecules/QuranHoursWeeklyProgressDashboard";
import { TahiyatUlWudhuWeeklyProgressDashboard } from "@/components/molecules/TahiyatUlWudhuWeeklyProgressDashboard";
import { MissedPrayersWeeklyProgressDashboard } from "@/components/molecules/MissedPrayersWeeklyProgressDashboard";
import { TahiyatAlMasjidWeeklyProgressDashboard } from "@/components/molecules/TahiyatAlMasjidWeeklyProgressDashboard";
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

  if (template === "tahiyat-ul-wudhu") {
    // Mock week data based on the images, in a real app this would come from a hook/data store
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 0, isLogged: true },
        { day: "Mon", prayersLogged: 5, isLogged: true, isBestDay: true },
        { day: "Tue", prayersLogged: 2, isLogged: true },
        { day: "Wed", prayersLogged: 0, isLogged: false },
        { day: "Thu", prayersLogged: 0, isLogged: false },
        { day: "Fri", prayersLogged: 2, isLogged: true },
        { day: "Sat", prayersLogged: 3, isLogged: true },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "1/4",
      totalPrayersThisWeek: 15,
      streakDays: 2,
    };

    return (
      <TahiyatUlWudhuWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="rug"
      />
    );
  }

  if (template === "missed-prayers") {
    // Mock week data based on the images
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 0, isLogged: true },
        { day: "Mon", prayersLogged: 5, isLogged: true, isBestDay: true },
        { day: "Tue", prayersLogged: 2, isLogged: true },
        { day: "Wed", prayersLogged: 0, isLogged: false },
        { day: "Thu", prayersLogged: 0, isLogged: false },
        { day: "Fri", prayersLogged: 2, isLogged: true },
        { day: "Sat", prayersLogged: 9, isLogged: true }, // Sat 4 is selected in UI, 9 prayers gets us to 18 total
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "1/4",
      totalPrayersThisWeek: 18,
      streakDays: 2,
    };

    return (
      <MissedPrayersWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
      />
    );
  }

  if (template === "tahiyat-al-masjid") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 3, isLogged: true },
        { day: "Mon", prayersLogged: 3, isLogged: true },
        { day: "Tue", prayersLogged: 2, isLogged: true },
        { day: "Wed", prayersLogged: 1, isLogged: true },
        { day: "Thu", prayersLogged: 0, isLogged: false, isMenstruation: true },
        { day: "Fri", prayersLogged: 4, isLogged: true, isBestDay: true },
        { day: "Sat", prayersLogged: 1, isLogged: true },
      ],
      weekRangeLabel: "Dec 20 — 26",
      weekFraction: "4/4",
      totalPrayersThisWeek: 14,
      streakDays: 2,
    };

    return (
      <TahiyatAlMasjidWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
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
