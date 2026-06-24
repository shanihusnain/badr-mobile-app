import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { QuranHoursWeeklyProgressDashboard } from "@/components/molecules/QuranHoursWeeklyProgressDashboard";
import { QuranWeeklyRecitationProgressDashboard } from "@/components/molecules/QuranWeeklyRecitationProgressDashboard";
import { TahiyatUlWudhuWeeklyProgressDashboard } from "@/components/molecules/TahiyatUlWudhuWeeklyProgressDashboard";
import { MissedPrayersWeeklyProgressDashboard } from "@/components/molecules/MissedPrayersWeeklyProgressDashboard";
import { TahiyatAlMasjidWeeklyProgressDashboard } from "@/components/molecules/TahiyatAlMasjidWeeklyProgressDashboard";
import { DuhaPrayerWeeklyProgressDashboard } from "@/components/molecules/DuhaPrayerWeeklyProgressDashboard";
import { TawbahPrayerWeeklyProgressDashboard } from "@/components/molecules/TawbahPrayerWeeklyProgressDashboard";
import { IstikharaPrayerWeeklyProgressDashboard } from "@/components/molecules/IstikharaPrayerWeeklyProgressDashboard";
import { ShukrPrayerWeeklyProgressDashboard } from "@/components/molecules/ShukrPrayerWeeklyProgressDashboard";
import { QiyamWeeklyProgressDashboard } from "@/components/molecules/QiyamWeeklyProgressDashboard";
import { SunnahRawatibWeeklyProgressDashboard } from "@/components/molecules/SunnahRawatibWeeklyProgressDashboard";
import { MissedZakatWeeklyProgressDashboard } from "@/components/molecules/MissedZakatWeeklyProgressDashboard";
import { SunnahPrayerConfig, SunnahDayData } from "@/components/molecules/SunnahRawatibDayRing";
import { PrayerProgressTrackerRing } from "@/components/molecules/PrayerProgressTrackerRing";
import type { DayProgress } from "@/components/molecules/WeeklyProgressDashboard";
import { GoalData } from "../../home/components/goalsData";
import {
  getLoggingFlowTemplate,
  getQuranHoursFlowDefinition,
} from "../loggingFlowRegistry";
import { getQuranHoursWeekSummary } from "../quranHoursWeeklyData";
import {
  canNavigateRecitationWeek,
  clampRecitationWeekIndex,
  cycleSummaryToWeekSummary,
  getQuranRecitationCycleSummary,
  getWeeklySurahDashboardItems,
} from "../quranRecitationWeeklyData";
import {
  canNavigateCompletionWeek,
  clampCompletionWeekIndex,
  getQuranCompletionCycleSummary,
  getQuranCompletionWeekSummary,
} from "../quranRecitationCompletionWeeklyData";
import { isQuranHoursGoalId } from "../types";
import {
  getSurahRecitationCycleMode,
  isSurahRecitationGoalId,
} from "../quranRecitationTarget";

type Props = {
  goalData: GoalData;
};

export function WeeklyProgressSection({ goalData }: Props) {
  const { t } = useTranslation();
  const template = getLoggingFlowTemplate(goalData.id);
  console.log("template inside the weekly progress section", template);
  const quranWeek = useMemo(() => {
    if (!isQuranHoursGoalId(goalData.id)) return null;
    return getQuranHoursWeekSummary(goalData.id);
  }, [goalData.id]);

  const recitationCycle = useMemo(() => {
    if (!isSurahRecitationGoalId(goalData.id)) return null;
    const mode = getSurahRecitationCycleMode(goalData.id);
    return getQuranRecitationCycleSummary(goalData.id, {
      forceDaily: mode === "daily",
      forceWeekly: mode === "weekly",
    });
  }, [goalData.id]);

  const completionCycle = useMemo(() => {
    if (template !== "quran-completion") return null;
    return getQuranCompletionCycleSummary();
  }, [template]);

  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    if (recitationCycle) {
      setWeekIndex(recitationCycle.activeWeekIndex);
    }
  }, [goalData.id, recitationCycle]);

  useEffect(() => {
    if (completionCycle) {
      setWeekIndex(completionCycle.activeWeekIndex);
    }
  }, [completionCycle, goalData.id]);

  const quranRecitationWeek = useMemo(() => {
    if (!recitationCycle) return null;
    return cycleSummaryToWeekSummary(recitationCycle, weekIndex);
  }, [recitationCycle, weekIndex]);

  const quranCompletionWeek = useMemo(() => {
    if (!completionCycle) return null;
    return getQuranCompletionWeekSummary(weekIndex);
  }, [completionCycle, weekIndex]);

  const weeklySurahItems = useMemo(() => {
    if (!recitationCycle || recitationCycle.type !== "weekly") return [];
    return getWeeklySurahDashboardItems(weekIndex);
  }, [recitationCycle, weekIndex]);

  const isWeeklySurahDashboard =
    quranRecitationWeek?.frequency === "weekly" && weeklySurahItems.length > 0;

  const handleCompletionPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampCompletionWeekIndex(current - 1));
  }, []);

  const handleCompletionNextWeek = useCallback(() => {
    setWeekIndex((current) => clampCompletionWeekIndex(current + 1));
  }, []);

  const handlePrevWeek = useCallback(() => {
    if (!recitationCycle) return;
    setWeekIndex((current) =>
      clampRecitationWeekIndex(current - 1, recitationCycle),
    );
  }, [recitationCycle]);

  const handleNextWeek = useCallback(() => {
    if (!recitationCycle) return;
    setWeekIndex((current) =>
      clampRecitationWeekIndex(current + 1, recitationCycle),
    );
  }, [recitationCycle]);

  const quranFlow = getQuranHoursFlowDefinition(goalData.id);

  if (template === "quran-hours" && quranWeek && quranFlow) {
    const statsIcon =
      quranFlow.config.icon === "headphones"
        ? "headphones"
        : "book-open-page-variant";

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

  if (template === "quran-completion" && quranCompletionWeek && completionCycle) {
    return (
      <QuranWeeklyRecitationProgressDashboard
        weekDays={[]}
        weekRangeLabel={quranCompletionWeek.weekRangeLabel}
        weekFraction={quranCompletionWeek.weekFraction}
        visualizationMode="completion"
        completionWeekDays={quranCompletionWeek.weekDays}
        completionTarget={quranCompletionWeek.targetCompletions}
        completionsLoggedThisWeek={quranCompletionWeek.completionsLoggedThisWeek}
        streakDays={quranCompletionWeek.streakDays}
        motivationalQuote={t(quranCompletionWeek.motivationalQuoteKey)}
        onPrevWeek={
          canNavigateCompletionWeek(weekIndex, "prev")
            ? handleCompletionPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateCompletionWeek(weekIndex, "next")
            ? handleCompletionNextWeek
            : undefined
        }
      />
    );
  }

  if (
    template === "quran-recitation" &&
    quranRecitationWeek &&
    recitationCycle
  ) {
    return (
      <QuranWeeklyRecitationProgressDashboard
        weekDays={quranRecitationWeek.weekDays}
        weekRangeLabel={quranRecitationWeek.weekRangeLabel}
        weekFraction={quranRecitationWeek.weekFraction}
        totalRecitationsThisWeek={quranRecitationWeek.totalRecitationsThisWeek}
        dailyTarget={quranRecitationWeek.dailyTarget}
        weekRecitationTarget={quranRecitationWeek.weekRecitationTarget}
        visualizationMode={isWeeklySurahDashboard ? "weekly" : "daily"}
        weeklySurahItems={weeklySurahItems}
        streakDays={quranRecitationWeek.streakDays}
        motivationalQuote={t(quranRecitationWeek.motivationalQuoteKey)}
        onPrevWeek={
          canNavigateRecitationWeek(weekIndex, recitationCycle, "prev")
            ? handlePrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateRecitationWeek(weekIndex, recitationCycle, "next")
            ? handleNextWeek
            : undefined
        }
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

  if (template === "duha-prayer") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 2, isLogged: true },
        { day: "Mon", prayersLogged: 4, isLogged: true, isBestDay: true },
        { day: "Tue", prayersLogged: 2, isLogged: true },
        { day: "Wed", prayersLogged: 0, isLogged: false },
        { day: "Thu", prayersLogged: 0, isLogged: false },
        { day: "Fri", prayersLogged: 2, isLogged: true },
        { day: "Sat", prayersLogged: 2, isLogged: true },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "1/4",
      totalPrayersThisWeek: 12,
      streakDays: 2,
    };
    return (
      <DuhaPrayerWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="weather-partly-cloudy"
      />
    );
  }

  if (template === "tawbah-prayer") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 1, isLogged: true },
        { day: "Mon", prayersLogged: 2, isLogged: true, isBestDay: true },
        { day: "Tue", prayersLogged: 1, isLogged: true },
        { day: "Wed", prayersLogged: 0, isLogged: false },
        { day: "Thu", prayersLogged: 1, isLogged: true },
        { day: "Fri", prayersLogged: 1, isLogged: true },
        { day: "Sat", prayersLogged: 1, isLogged: true },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "1/4",
      totalPrayersThisWeek: 7,
      streakDays: 3,
    };
    return (
      <TawbahPrayerWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="hand-heart"
      />
    );
  }

  if (template === "istikhara-prayer") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 1, isLogged: true },
        { day: "Mon", prayersLogged: 0, isLogged: false },
        { day: "Tue", prayersLogged: 1, isLogged: true },
        { day: "Wed", prayersLogged: 1, isLogged: true },
        { day: "Thu", prayersLogged: 0, isLogged: false },
        { day: "Fri", prayersLogged: 1, isLogged: true, isBestDay: true },
        { day: "Sat", prayersLogged: 1, isLogged: true },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "1/4",
      totalPrayersThisWeek: 5,
      streakDays: 3,
    };
    return (
      <IstikharaPrayerWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="star-crescent"
      />
    );
  }

  if (template === "shukr-prayer") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 2, isLogged: true },
        { day: "Mon", prayersLogged: 2, isLogged: true, isBestDay: true },
        { day: "Tue", prayersLogged: 1, isLogged: true },
        { day: "Wed", prayersLogged: 2, isLogged: true },
        { day: "Thu", prayersLogged: 0, isLogged: false },
        { day: "Fri", prayersLogged: 2, isLogged: true },
        { day: "Sat", prayersLogged: 2, isLogged: true },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "2/4",
      totalPrayersThisWeek: 11,
      streakDays: 4,
    };
    return (
      <ShukrPrayerWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="heart"
      />
    );
  }

  if (template === "qiyam-al-layl") {
    const mockWeek = {
      weekDays: [
        { day: "Sun", prayersLogged: 4, isLogged: true, loggedTime: "after-isha" as const },
        { day: "Mon", prayersLogged: 8, isLogged: true, isBestDay: true, loggedTime: "both" as const },
        { day: "Tue", prayersLogged: 4, isLogged: true, loggedTime: "before-fajr" as const },
        { day: "Wed", prayersLogged: 0, isMissedStrict: true },
        { day: "Thu", prayersLogged: 4, isLogged: true, loggedTime: "after-isha" as const },
        { day: "Fri", prayersLogged: 4, isLogged: true, loggedTime: "after-isha" as const },
        { day: "Sat", prayersLogged: 4, isLogged: true, loggedTime: "after-isha" as const },
      ],
      weekRangeLabel: "Nov 29 — Dec 5",
      weekFraction: "2/4",
      totalPrayersThisWeek: 28,
      streakDays: 5,
    };
    return (
      <QiyamWeeklyProgressDashboard
        weekDays={mockWeek.weekDays}
        weekRangeLabel={mockWeek.weekRangeLabel}
        weekFraction={mockWeek.weekFraction}
        totalPrayersThisWeek={mockWeek.totalPrayersThisWeek}
        streakDays={mockWeek.streakDays}
        statsIcon="rug"
      />
    );
  }

  if (template === "sunnah-rawatib") {
    const mockGoal: SunnahPrayerConfig[] = [
      { id: "before_fajr", weight: 1 },
      { id: "before_dhuhr", weight: 2 },
      { id: "after_dhuhr", weight: 2 },
      { id: "before_asr", weight: 2 },
      { id: "after_maghrib", weight: 1 },
      { id: "after_isha", weight: 1 },
    ];
    const mockWeekDays: SunnahDayData[] = [
      { day: "Sun", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 0, after_maghrib: 1, after_isha: 0 } } },
      { day: "Mon", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 2, after_maghrib: 1, after_isha: 0 } } },
      { day: "Tue", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 2, after_maghrib: 1, after_isha: 1 } } },
      { day: "Wed", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 2, after_maghrib: 1, after_isha: 1 } } },
      { day: "Thu", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 2, after_maghrib: 1, after_isha: 0 } } },
      { day: "Fri", data: { goal: mockGoal, logged: { before_fajr: 1, before_dhuhr: 2, after_dhuhr: 2, before_asr: 2, after_maghrib: 1, after_isha: 1 } } },
      { day: "Sat", data: { goal: mockGoal, logged: { before_fajr: 0, before_dhuhr: 2, after_dhuhr: 1, before_asr: 1, after_maghrib: 1 } } },
    ];
    return (
      <SunnahRawatibWeeklyProgressDashboard
        weekDays={mockWeekDays}
        weekRangeLabel="Nov 29 — Dec 5"
        weekFraction="1/4"
        totalPrayersThisWeek={55}
        streakDays={2}
        selectedDayIndex={6}
      />
    );
  }

  if (template === "missed-zakat") {
    const ZAKAT_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalSpent: 30,
        streakDays: 3,
        remainingAmount: 70,
        selectedDayIndex: 3,
        days: [
          { day: "Sun", amountLogged: 0, isFuture: false },
          { day: "Mon", amountLogged: 5, isFuture: false, isLogged: true },
          { day: "Tue", amountLogged: 10, isFuture: false, isLogged: true },
          { day: "Wed", amountLogged: 15, isFuture: false, isLogged: true, isBestDay: true },
          { day: "Thu", amountLogged: 0, isFuture: true },
          { day: "Fri", amountLogged: 0, isFuture: true },
          { day: "Sat", amountLogged: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalSpent: 30,
        streakDays: 0,
        remainingAmount: 40,
        selectedDayIndex: 6,
        days: [
          { day: "Sun", amountLogged: 0, isFuture: false },
          { day: "Mon", amountLogged: 0, isFuture: false },
          { day: "Tue", amountLogged: 30, isFuture: false, isLogged: true, isBestDay: true },
          { day: "Wed", amountLogged: 0, isFuture: false },
          { day: "Thu", amountLogged: 0, isFuture: false },
          { day: "Fri", amountLogged: 0, isFuture: false },
          { day: "Sat", amountLogged: 0, isFuture: false },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalSpent: 0,
        streakDays: 0,
        remainingAmount: 40,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", amountLogged: 0, isFuture: false },
          { day: "Mon", amountLogged: 0, isFuture: false },
          { day: "Tue", amountLogged: 0, isFuture: false },
          { day: "Wed", amountLogged: 0, isFuture: false },
          { day: "Thu", amountLogged: 0, isFuture: true },
          { day: "Fri", amountLogged: 0, isFuture: true },
          { day: "Sat", amountLogged: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalSpent: 40,
        streakDays: 5,
        remainingAmount: 0,
        selectedDayIndex: 4,
        days: [
          { day: "Sun", amountLogged: 10, isFuture: false, isLogged: true },
          { day: "Mon", amountLogged: 10, isFuture: false, isLogged: true },
          { day: "Tue", amountLogged: 10, isFuture: false, isLogged: true },
          { day: "Wed", amountLogged: 5, isFuture: false, isLogged: true },
          { day: "Thu", amountLogged: 5, isFuture: false, isLogged: true, isBestDay: true },
          { day: "Fri", amountLogged: 0, isFuture: true },
          { day: "Sat", amountLogged: 0, isFuture: true },
        ],
      },
    ];

    const [zakatWeekIndex, setZakatWeekIndex] = useState(0);
    const zakatWeek = ZAKAT_WEEKS[zakatWeekIndex];

    return (
      <MissedZakatWeeklyProgressDashboard
        weekDays={zakatWeek.days}
        weekRangeLabel={zakatWeek.weekRangeLabel}
        weekFraction={zakatWeek.weekFraction}
        totalSpentThisWeek={zakatWeek.totalSpent}
        streakDays={zakatWeek.streakDays}
        remainingAmount={zakatWeek.remainingAmount}
        selectedDayIndex={zakatWeek.selectedDayIndex}
        onPrevWeek={() => setZakatWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() => setZakatWeekIndex((i) => Math.min(ZAKAT_WEEKS.length - 1, i + 1))}
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
