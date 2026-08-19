import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { WeeklyProgressDashboard } from "@/components/molecules/WeeklyProgressDashboard";
import { QuranHoursWeeklyProgressDashboard } from "@/components/molecules/QuranHoursWeeklyProgressDashboard";
import { QuranWeeklyRecitationProgressDashboard } from "@/components/molecules/QuranWeeklyRecitationProgressDashboard";
import { TahiyatUlWudhuWeeklyProgressDashboard } from "@/components/molecules/TahiyatUlWudhuWeeklyProgressDashboard";
import { MissedPrayersWeeklyProgressDashboard } from "@/components/molecules/MissedPrayersWeeklyProgressDashboard";
import { TahiyatAlMasjidWeeklyProgressDashboard } from "@/components/molecules/TahiyatAlMasjidWeeklyProgressDashboard";
import { MissedRamadanFastsWeeklyProgressDashboard } from "@/components/molecules/MissedRamadanFastsWeeklyProgressDashboard";
import { MondayThursdayFastsWeeklyProgressDashboard } from "@/components/molecules/MondayThursdayFastsWeeklyProgressDashboard";
import { WhiteDaysFastsWeeklyProgressDashboard } from "@/components/molecules/WhiteDaysFastsWeeklyProgressDashboard";
import { ProphetDawoodFastsWeeklyProgressDashboard } from "@/components/molecules/ProphetDawoodFastsWeeklyProgressDashboard";
import { DuhaPrayerWeeklyProgressDashboard } from "@/components/molecules/DuhaPrayerWeeklyProgressDashboard";
import { TawbahPrayerWeeklyProgressDashboard } from "@/components/molecules/TawbahPrayerWeeklyProgressDashboard";
import { IstikharaPrayerWeeklyProgressDashboard } from "@/components/molecules/IstikharaPrayerWeeklyProgressDashboard";
import { ShukrPrayerWeeklyProgressDashboard } from "@/components/molecules/ShukrPrayerWeeklyProgressDashboard";
import { QiyamWeeklyProgressDashboard } from "@/components/molecules/QiyamWeeklyProgressDashboard";

import { MissedZakatWeeklyProgressDashboard } from "@/components/molecules/MissedZakatWeeklyProgressDashboard";
import { KaffarahWeeklyProgressDashboard } from "@/components/molecules/KaffarahWeeklyProgressDashboard";
import { FidyaWeeklyProgressDashboard } from "@/components/molecules/FidyaWeeklyProgressDashboard";
import { LillahWeeklyProgressDashboard } from "@/components/molecules/LillahWeeklyProgressDashboard";
import { SadaqahJariyahWeeklyProgressDashboard } from "@/components/molecules/SadaqahJariyahWeeklyProgressDashboard";
import { VolunteeringWeeklyProgressDashboard } from "@/components/molecules/VolunteeringWeeklyProgressDashboard";
import {
  SunnahPrayerConfig,
  SunnahDayData,
} from "@/components/molecules/SunnahRawatibDayRing";
import {
  SunnahRawatibWeeklyProgressDashboard,
  type SunnahRawatibDayProgress,
} from "@/components/molecules/SunnahRawatibWeeklyProgressDashboard";

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
  getDailySurahRecitationWeekSummary,
  getWeeklySurahDashboardItemForSurah,
  getWeeklySurahDashboardItems,
} from "../quranRecitationWeeklyData";
import {
  canNavigateCompletionWeek,
  clampCompletionWeekIndex,
  getQuranCompletionCycleSummary,
  getQuranCompletionWeekSummary,
} from "../quranRecitationCompletionWeeklyData";
import {
  canNavigateJuzWeek,
  clampJuzWeekIndex,
  getQuranJuzCycleSummary,
  getQuranJuzWeekSummary,
} from "../quranRecitationJuzWeeklyData";
import { QuranMemorisationWeeklyProgressDashboard } from "@/components/molecules/QuranMemorisationWeeklyProgressDashboard";
import {
  canNavigateMemorisationWeek,
  clampMemorisationWeekIndex,
  getQuranMemorisationCycleSummary,
} from "../quranMemorisationWeeklyData";
import {
  canNavigateHizbMemorisationWeek,
  clampHizbMemorisationWeekIndex,
  getQuranMemorisationHizbCycleSummary,
} from "../quranMemorisationHizbWeeklyData";
import {
  canNavigateJuzMemorisationWeek,
  clampJuzMemorisationWeekIndex,
  getQuranMemorisationJuzCycleSummary,
} from "../quranMemorisationJuzWeeklyData";
import { useOptionalMemorisationSurahContext } from "../memorisationSurahContext";
import { useOptionalMemorisationHizbContext } from "../memorisationHizbContext";
import { useOptionalMemorisationJuzContext } from "../memorisationJuzContext";
import { useOptionalRecitationSurahContext } from "../recitationSurahContext";
import { getSurahMemorisationGoals } from "../quranMemorisationSurahGoals";
import { getHizbMemorisationGoals } from "../quranMemorisationHizbGoals";
import { getJuzMemorisationGoals } from "../quranMemorisationJuzGoals";
import { getSurahRecitationGoalById } from "../quranRecitationSurahGoals";
import { isQuranHoursGoalId } from "../types";
import {
  getSurahRecitationCycleMode,
  isSurahRecitationGoalId,
} from "../quranRecitationTarget";
import { isHizbMemorisationGoalId } from "../quranMemorisationHizbTarget";
import { isJuzMemorisationGoalId } from "../quranMemorisationJuzTarget";
import { isSurahMemorisationGoalId } from "../quranMemorisationTarget";
import {
  canNavigateMissedRamadanFastWeek,
  clampMissedRamadanFastWeekIndex,
  getMissedRamadanFastCycleSummary,
  getMissedRamadanFastTodayIndexInWeek,
} from "../missedRamadanFastsWeeklyData";
import {
  canNavigateMondayThursdayFastWeek,
  clampMondayThursdayFastWeekIndex,
  getMondayThursdayFastCycleSummary,
  getMondayThursdayFastTodayIndexInWeek,
} from "../mondayThursdayFastsWeeklyData";
import {
  canNavigateWhiteDaysFastWeek,
  clampWhiteDaysFastWeekIndex,
  getWhiteDaysFastCycleSummary,
  getWhiteDaysFastTodayIndexInWeek,
} from "../whiteDaysFastsWeeklyData";
import {
  canNavigateProphetDawoodFastWeek,
  clampProphetDawoodFastWeekIndex,
  getProphetDawoodFastCycleSummary,
  getProphetDawoodFastTodayIndexInWeek,
} from "../prophetDawoodFastsWeeklyData";
import { useOptionalPrayerGoalFrameContext } from "../prayerGoalFrameContext";
import {
  formatPrayerFrameWeekRange,
  getPrayerFrameTodayIndex,
  getPrayerFrameWeekFraction,
  mapFiveDailyFrameWeekDays,
  mapPrayerFrameWeekDays,
} from "@/src/utils/prayerGoalFrameMap";

type Props = {
  goalData: GoalData;
  refreshKey?: number;
  onWeekProgressPercentChange?: (percent: number | null) => void;
};

export function WeeklyProgressSection({
  goalData,
  refreshKey = 0,
  onWeekProgressPercentChange,
}: Props) {
  const { t } = useTranslation();
  const template = getLoggingFlowTemplate(goalData.id);
  const prayerFrame = useOptionalPrayerGoalFrameContext();
  const memorisationContext = useOptionalMemorisationSurahContext();
  const hizbMemorisationContext = useOptionalMemorisationHizbContext();
  const juzMemorisationContext = useOptionalMemorisationJuzContext();
  const recitationContext = useOptionalRecitationSurahContext();

  const memorisationSurahFilter =
    memorisationContext?.activeSurahId ??
    getSurahMemorisationGoals()[0]?.id ??
    "all";

  const memorisationHizbFilter =
    hizbMemorisationContext?.activeHizbId ??
    getHizbMemorisationGoals()[0]?.id ??
    "all";

  const memorisationJuzFilter =
    juzMemorisationContext?.activeJuzId ??
    getJuzMemorisationGoals()[0]?.id ??
    "all";

  const [weekIndex, setWeekIndex] = useState(0);

  const memorisationCycle = useMemo(() => {
    if (template !== "quran-memorisation") return null;
    if (!isSurahMemorisationGoalId(goalData.id)) return null;
    return getQuranMemorisationCycleSummary(memorisationSurahFilter);
  }, [
    template,
    goalData.id,
    memorisationSurahFilter,
    memorisationContext?.refreshKey,
  ]);

  const hizbMemorisationCycle = useMemo(() => {
    if (template !== "quran-memorisation") return null;
    if (!isHizbMemorisationGoalId(goalData.id)) return null;
    return getQuranMemorisationHizbCycleSummary(memorisationHizbFilter);
  }, [
    template,
    goalData.id,
    memorisationHizbFilter,
    hizbMemorisationContext?.refreshKey,
  ]);

  const juzMemorisationCycle = useMemo(() => {
    if (template !== "quran-memorisation") return null;
    if (!isJuzMemorisationGoalId(goalData.id)) return null;
    return getQuranMemorisationJuzCycleSummary(memorisationJuzFilter);
  }, [
    template,
    goalData.id,
    memorisationJuzFilter,
    juzMemorisationContext?.refreshKey,
  ]);

  const memorisationWeek = useMemo(() => {
    if (!memorisationCycle) return null;
    return memorisationCycle.weeks[clampMemorisationWeekIndex(weekIndex)];
  }, [memorisationCycle, weekIndex]);

  const hizbMemorisationWeek = useMemo(() => {
    if (!hizbMemorisationCycle) return null;
    return hizbMemorisationCycle.weeks[
      clampHizbMemorisationWeekIndex(weekIndex)
    ];
  }, [hizbMemorisationCycle, weekIndex]);

  const juzMemorisationWeek = useMemo(() => {
    if (!juzMemorisationCycle) return null;
    return juzMemorisationCycle.weeks[clampJuzMemorisationWeekIndex(weekIndex)];
  }, [juzMemorisationCycle, weekIndex]);
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

  const juzCycle = useMemo(() => {
    if (template !== "quran-juz") return null;
    return getQuranJuzCycleSummary();
  }, [template]);

  const missedRamadanCycle = useMemo(() => {
    if (template !== "missed-ramadan-fasts") return null;
    return getMissedRamadanFastCycleSummary();
  }, [template, refreshKey]);

  const mondayThursdayCycle = useMemo(() => {
    if (template !== "monday-thursday-fasts") return null;
    return getMondayThursdayFastCycleSummary();
  }, [template, refreshKey]);

  const whiteDaysCycle = useMemo(() => {
    if (template !== "white-days-fasts") return null;
    return getWhiteDaysFastCycleSummary();
  }, [template, refreshKey]);

  const prophetDawoodCycle = useMemo(() => {
    if (template !== "prophet-dawood-fasts") return null;
    return getProphetDawoodFastCycleSummary();
  }, [template, refreshKey]);
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

  useEffect(() => {
    if (juzCycle) {
      setWeekIndex(juzCycle.activeWeekIndex);
    }
  }, [juzCycle, goalData.id]);

  useEffect(() => {
    if (juzMemorisationCycle) {
      setWeekIndex(juzMemorisationCycle.activeWeekIndex);
    }
  }, [juzMemorisationCycle, goalData.id, memorisationJuzFilter]);

  useEffect(() => {
    if (hizbMemorisationCycle) {
      setWeekIndex(hizbMemorisationCycle.activeWeekIndex);
    }
  }, [hizbMemorisationCycle, goalData.id, memorisationHizbFilter]);

  useEffect(() => {
    if (memorisationCycle) {
      setWeekIndex(memorisationCycle.activeWeekIndex);
    }
  }, [memorisationCycle, goalData.id, memorisationSurahFilter]);

  useEffect(() => {
    if (missedRamadanCycle) {
      setWeekIndex(missedRamadanCycle.activeWeekIndex);
    }
  }, [missedRamadanCycle, goalData.id, refreshKey]);

  useEffect(() => {
    if (mondayThursdayCycle) {
      setWeekIndex(mondayThursdayCycle.activeWeekIndex);
    }
  }, [mondayThursdayCycle, goalData.id, refreshKey]);

  useEffect(() => {
    if (whiteDaysCycle) {
      setWeekIndex(whiteDaysCycle.activeWeekIndex);
    }
  }, [whiteDaysCycle, goalData.id, refreshKey]);

  useEffect(() => {
    if (prophetDawoodCycle) {
      setWeekIndex(prophetDawoodCycle.activeWeekIndex);
    }
  }, [prophetDawoodCycle, goalData.id, refreshKey]);

  const quranRecitationWeek = useMemo(() => {
    if (!recitationCycle) return null;

    const activeSurahId = isSurahRecitationGoalId(goalData.id)
      ? recitationContext?.activeSurahId
      : undefined;

    if (activeSurahId) {
      if (recitationCycle.type === "weekly") {
        const item = getWeeklySurahDashboardItemForSurah(
          activeSurahId,
          weekIndex,
        );
        const baseWeek = cycleSummaryToWeekSummary(recitationCycle, weekIndex);
        if (item) {
          return {
            ...baseWeek,
            totalRecitationsThisWeek: item.completedThisWeek,
            weekRecitationTarget: item.weeklyTarget,
            frequency: "weekly" as const,
          };
        }
      } else {
        return getDailySurahRecitationWeekSummary(
          activeSurahId,
          recitationCycle,
          weekIndex,
        );
      }
    }

    return cycleSummaryToWeekSummary(recitationCycle, weekIndex);
  }, [
    recitationCycle,
    weekIndex,
    goalData.id,
    recitationContext?.activeSurahId,
    recitationContext?.refreshKey,
  ]);

  const weeklySurahItems = useMemo(() => {
    if (!recitationCycle || recitationCycle.type !== "weekly") return [];

    const activeSurahId = isSurahRecitationGoalId(goalData.id)
      ? recitationContext?.activeSurahId
      : undefined;

    if (activeSurahId) {
      const item = getWeeklySurahDashboardItemForSurah(
        activeSurahId,
        weekIndex,
      );
      return item ? [item] : [];
    }

    return getWeeklySurahDashboardItems(weekIndex);
  }, [
    recitationCycle,
    weekIndex,
    goalData.id,
    recitationContext?.activeSurahId,
    recitationContext?.refreshKey,
  ]);

  const quranCompletionWeek = useMemo(() => {
    if (!completionCycle) return null;
    return getQuranCompletionWeekSummary(weekIndex);
  }, [completionCycle, weekIndex]);

  const quranJuzWeek = useMemo(() => {
    if (!juzCycle) return null;
    return getQuranJuzWeekSummary(weekIndex);
  }, [juzCycle, weekIndex]);

  const missedRamadanWeek = useMemo(() => {
    if (!missedRamadanCycle) return null;
    return missedRamadanCycle.weeks[clampMissedRamadanFastWeekIndex(weekIndex)];
  }, [missedRamadanCycle, weekIndex]);

  const mondayThursdayWeek = useMemo(() => {
    if (!mondayThursdayCycle) return null;
    return mondayThursdayCycle.weeks[
      clampMondayThursdayFastWeekIndex(weekIndex)
    ];
  }, [mondayThursdayCycle, weekIndex]);

  const whiteDaysWeek = useMemo(() => {
    if (!whiteDaysCycle) return null;
    return whiteDaysCycle.weeks[clampWhiteDaysFastWeekIndex(weekIndex)];
  }, [whiteDaysCycle, weekIndex]);

  const prophetDawoodWeek = useMemo(() => {
    if (!prophetDawoodCycle) return null;
    return prophetDawoodCycle.weeks[clampProphetDawoodFastWeekIndex(weekIndex)];
  }, [prophetDawoodCycle, weekIndex]);

  useEffect(() => {
    if (template !== "monday-thursday-fasts") {
      onWeekProgressPercentChange?.(null);
      return;
    }

    onWeekProgressPercentChange?.(
      mondayThursdayWeek?.cumulativeCompletionPercent ?? null,
    );
  }, [
    template,
    mondayThursdayWeek?.cumulativeCompletionPercent,
    onWeekProgressPercentChange,
  ]);

  const activeRecitationSurahName = useMemo(() => {
    if (!isSurahRecitationGoalId(goalData.id)) return undefined;
    const surahId = recitationContext?.activeSurahId;
    if (!surahId) return undefined;
    return getSurahRecitationGoalById(surahId)?.surahName;
  }, [goalData.id, recitationContext?.activeSurahId]);

  const isWeeklySurahDashboard =
    quranRecitationWeek?.frequency === "weekly" && weeklySurahItems.length > 0;

  const handleJuzPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampJuzWeekIndex(current - 1));
  }, []);

  const handleJuzNextWeek = useCallback(() => {
    setWeekIndex((current) => clampJuzWeekIndex(current + 1));
  }, []);

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

  const handleMemorisationPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampMemorisationWeekIndex(current - 1));
  }, []);

  const handleMemorisationNextWeek = useCallback(() => {
    setWeekIndex((current) => clampMemorisationWeekIndex(current + 1));
  }, []);

  const handleJuzMemorisationPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampJuzMemorisationWeekIndex(current - 1));
  }, []);

  const handleJuzMemorisationNextWeek = useCallback(() => {
    setWeekIndex((current) => clampJuzMemorisationWeekIndex(current + 1));
  }, []);

  const handleHizbMemorisationPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampHizbMemorisationWeekIndex(current - 1));
  }, []);

  const handleHizbMemorisationNextWeek = useCallback(() => {
    setWeekIndex((current) => clampHizbMemorisationWeekIndex(current + 1));
  }, []);

  const handleMissedRamadanPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampMissedRamadanFastWeekIndex(current - 1));
  }, []);

  const handleMissedRamadanNextWeek = useCallback(() => {
    setWeekIndex((current) => clampMissedRamadanFastWeekIndex(current + 1));
  }, []);

  const handleMondayThursdayPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampMondayThursdayFastWeekIndex(current - 1));
  }, []);

  const handleMondayThursdayNextWeek = useCallback(() => {
    setWeekIndex((current) => clampMondayThursdayFastWeekIndex(current + 1));
  }, []);

  const handleWhiteDaysPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampWhiteDaysFastWeekIndex(current - 1));
  }, []);

  const handleWhiteDaysNextWeek = useCallback(() => {
    setWeekIndex((current) => clampWhiteDaysFastWeekIndex(current + 1));
  }, []);

  const handleProphetDawoodPrevWeek = useCallback(() => {
    setWeekIndex((current) => clampProphetDawoodFastWeekIndex(current - 1));
  }, []);

  const handleProphetDawoodNextWeek = useCallback(() => {
    setWeekIndex((current) => clampProphetDawoodFastWeekIndex(current + 1));
  }, []);

  const quranFlow = getQuranHoursFlowDefinition(goalData.id);

  if (
    template === "quran-memorisation" &&
    isJuzMemorisationGoalId(goalData.id) &&
    juzMemorisationWeek
  ) {
    return (
      <QuranMemorisationWeeklyProgressDashboard
        weekDays={juzMemorisationWeek.weekDays}
        weekRangeLabel={juzMemorisationWeek.weekRangeLabel}
        surahName={juzMemorisationWeek.juzName}
        totalAyahsThisWeek={juzMemorisationWeek.totalAyahsThisWeek}
        memorizedAyahs={juzMemorisationWeek.memorizedAyahs}
        totalAyahs={juzMemorisationWeek.totalAyahs}
        remainingAyahs={juzMemorisationWeek.remainingAyahs}
        progressPercent={juzMemorisationWeek.progressPercent}
        completed={juzMemorisationWeek.completed}
        streakDays={juzMemorisationWeek.streakDays}
        motivationalQuote={t(juzMemorisationWeek.motivationalQuoteKey)}
        currentWeek={juzMemorisationWeek.currentWeek}
        onPrevWeek={
          canNavigateJuzMemorisationWeek(weekIndex, "prev")
            ? handleJuzMemorisationPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateJuzMemorisationWeek(weekIndex, "next")
            ? handleJuzMemorisationNextWeek
            : undefined
        }
      />
    );
  }

  if (
    template === "quran-memorisation" &&
    isHizbMemorisationGoalId(goalData.id) &&
    hizbMemorisationWeek
  ) {
    return (
      <QuranMemorisationWeeklyProgressDashboard
        weekDays={hizbMemorisationWeek.weekDays}
        weekRangeLabel={hizbMemorisationWeek.weekRangeLabel}
        surahName={hizbMemorisationWeek.hizbName}
        totalAyahsThisWeek={hizbMemorisationWeek.totalAyahsThisWeek}
        memorizedAyahs={hizbMemorisationWeek.memorizedAyahs}
        totalAyahs={hizbMemorisationWeek.totalAyahs}
        remainingAyahs={hizbMemorisationWeek.remainingAyahs}
        progressPercent={hizbMemorisationWeek.progressPercent}
        completed={hizbMemorisationWeek.completed}
        streakDays={hizbMemorisationWeek.streakDays}
        motivationalQuote={t(hizbMemorisationWeek.motivationalQuoteKey)}
        currentWeek={hizbMemorisationWeek.currentWeek}
        onPrevWeek={
          canNavigateHizbMemorisationWeek(weekIndex, "prev")
            ? handleHizbMemorisationPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateHizbMemorisationWeek(weekIndex, "next")
            ? handleHizbMemorisationNextWeek
            : undefined
        }
      />
    );
  }

  if (
    template === "quran-memorisation" &&
    isSurahMemorisationGoalId(goalData.id) &&
    memorisationWeek
  ) {
    return (
      <QuranMemorisationWeeklyProgressDashboard
        weekDays={memorisationWeek.weekDays}
        weekRangeLabel={memorisationWeek.weekRangeLabel}
        surahName={memorisationWeek.surahName}
        totalAyahsThisWeek={memorisationWeek.totalAyahsThisWeek}
        memorizedAyahs={memorisationWeek.memorizedAyahs}
        totalAyahs={memorisationWeek.totalAyahs}
        remainingAyahs={memorisationWeek.remainingAyahs}
        progressPercent={memorisationWeek.progressPercent}
        completed={memorisationWeek.completed}
        streakDays={memorisationWeek.streakDays}
        motivationalQuote={t(memorisationWeek.motivationalQuoteKey)}
        currentWeek={memorisationWeek.currentWeek}
        onPrevWeek={
          canNavigateMemorisationWeek(weekIndex, "prev")
            ? handleMemorisationPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateMemorisationWeek(weekIndex, "next")
            ? handleMemorisationNextWeek
            : undefined
        }
      />
    );
  }

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

  if (template === "quran-juz" && quranJuzWeek && juzCycle) {
    return (
      <QuranWeeklyRecitationProgressDashboard
        weekDays={[]}
        weekRangeLabel={quranJuzWeek.weekRangeLabel}
        weekFraction={quranJuzWeek.weekFraction}
        visualizationMode="juz"
        completionWeekDays={quranJuzWeek.weekDays}
        completionTarget={quranJuzWeek.targetCompletions}
        completionsLoggedThisWeek={quranJuzWeek.completionsLoggedThisWeek}
        streakDays={quranJuzWeek.streakDays}
        motivationalQuote={t(quranJuzWeek.motivationalQuoteKey)}
        onPrevWeek={
          canNavigateJuzWeek(weekIndex, "prev") ? handleJuzPrevWeek : undefined
        }
        onNextWeek={
          canNavigateJuzWeek(weekIndex, "next") ? handleJuzNextWeek : undefined
        }
      />
    );
  }

  if (
    template === "quran-completion" &&
    quranCompletionWeek &&
    completionCycle
  ) {
    return (
      <QuranWeeklyRecitationProgressDashboard
        weekDays={[]}
        weekRangeLabel={quranCompletionWeek.weekRangeLabel}
        weekFraction={quranCompletionWeek.weekFraction}
        visualizationMode="completion"
        completionWeekDays={quranCompletionWeek.weekDays}
        completionTarget={quranCompletionWeek.targetCompletions}
        completionsLoggedThisWeek={
          quranCompletionWeek.completionsLoggedThisWeek
        }
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
        selectedSurahId={
          isSurahRecitationGoalId(goalData.id)
            ? recitationContext?.activeSurahId
            : undefined
        }
        surahContextLabel={activeRecitationSurahName}
        lockSurahSelection={isSurahRecitationGoalId(goalData.id)}
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
  if (template === "missed-ramadan-fasts" && missedRamadanWeek) {
    const missedRamadanTodayIndex = getMissedRamadanFastTodayIndexInWeek(
      missedRamadanWeek.weekDays,
    );

    return (
      <MissedRamadanFastsWeeklyProgressDashboard
        weekSummary={missedRamadanWeek}
        selectedDayIndex={missedRamadanTodayIndex}
        onPrevWeek={
          canNavigateMissedRamadanFastWeek(weekIndex, "prev")
            ? handleMissedRamadanPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateMissedRamadanFastWeek(weekIndex, "next")
            ? handleMissedRamadanNextWeek
            : undefined
        }
      />
    );
  }

  if (template === "monday-thursday-fasts" && mondayThursdayWeek) {
    const mondayThursdayTodayIndex = getMondayThursdayFastTodayIndexInWeek(
      mondayThursdayWeek.weekDays,
    );

    return (
      <MondayThursdayFastsWeeklyProgressDashboard
        weekSummary={mondayThursdayWeek}
        selectedDayIndex={mondayThursdayTodayIndex}
        onPrevWeek={
          canNavigateMondayThursdayFastWeek(weekIndex, "prev")
            ? handleMondayThursdayPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateMondayThursdayFastWeek(weekIndex, "next")
            ? handleMondayThursdayNextWeek
            : undefined
        }
      />
    );
  }

  if (template === "white-days-fasts" && whiteDaysWeek) {
    const whiteDaysTodayIndex = getWhiteDaysFastTodayIndexInWeek(
      whiteDaysWeek.weekDays,
    );

    return (
      <WhiteDaysFastsWeeklyProgressDashboard
        weekSummary={whiteDaysWeek}
        selectedDayIndex={whiteDaysTodayIndex}
        onPrevWeek={
          canNavigateWhiteDaysFastWeek(weekIndex, "prev")
            ? handleWhiteDaysPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateWhiteDaysFastWeek(weekIndex, "next")
            ? handleWhiteDaysNextWeek
            : undefined
        }
      />
    );
  }

  if (template === "prophet-dawood-fasts" && prophetDawoodWeek) {
    const prophetDawoodTodayIndex = getProphetDawoodFastTodayIndexInWeek(
      prophetDawoodWeek.weekDays,
    );

    return (
      <ProphetDawoodFastsWeeklyProgressDashboard
        weekSummary={prophetDawoodWeek}
        selectedDayIndex={prophetDawoodTodayIndex}
        onPrevWeek={
          canNavigateProphetDawoodFastWeek(weekIndex, "prev")
            ? handleProphetDawoodPrevWeek
            : undefined
        }
        onNextWeek={
          canNavigateProphetDawoodFastWeek(weekIndex, "next")
            ? handleProphetDawoodNextWeek
            : undefined
        }
      />
    );
  }

  if (template === "tahiyat-ul-wudhu") {
    const frame = prayerFrame?.frame;
    if (frame) {
      const totalWeeks = frame.cycle.totalWeeks;
      const currentWeek = frame.cycle.weekNumber;

      const canPrev = currentWeek > 1;
      const canNext = currentWeek < totalWeeks;

      const handlePrevWeek = canPrev
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek - 1);
          }
        : undefined;

      const handleNextWeek = canNext
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek + 1);
          }
        : undefined;

      return (
        <TahiyatUlWudhuWeeklyProgressDashboard
          weekDays={mapPrayerFrameWeekDays(frame)}
          weekRangeLabel={formatPrayerFrameWeekRange(
            frame.cycle.weekStart,
            frame.cycle.weekEnd,
          )}
          weekFraction={getPrayerFrameWeekFraction(frame)}
          totalPrayersThisWeek={frame.week.thisWeekTotal}
          streakDays={frame.week.currentStreak}
          motivationalQuote={frame.week.motivationalMessage}
          selectedDayIndex={getPrayerFrameTodayIndex(frame)}
          statsIcon="rug"
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      );
    }

    return (
      <TahiyatUlWudhuWeeklyProgressDashboard
        weekDays={[]}
        weekRangeLabel=""
        weekFraction="—"
        totalPrayersThisWeek={0}
        streakDays={0}
        statsIcon="rug"
      />
    );
  }

  if (template === "missed-prayers") {
    const frame = prayerFrame?.frame;
    if (frame) {
      const totalWeeks = frame.cycle.totalWeeks;
      const currentWeek = frame.cycle.weekNumber;

      const canPrev = currentWeek > 1;
      const canNext = currentWeek < totalWeeks;

      const handlePrevWeek = canPrev
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek - 1);
          }
        : undefined;

      const handleNextWeek = canNext
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek + 1);
          }
        : undefined;

      return (
        <MissedPrayersWeeklyProgressDashboard
          weekDays={mapPrayerFrameWeekDays(frame)}
          weekRangeLabel={formatPrayerFrameWeekRange(
            frame.cycle.weekStart,
            frame.cycle.weekEnd,
          )}
          weekFraction={getPrayerFrameWeekFraction(frame)}
          totalPrayersThisWeek={frame.week.thisWeekTotal}
          streakDays={frame.week.currentStreak}
          selectedDayIndex={getPrayerFrameTodayIndex(frame)}
          statsIcon="ticket-confirmation"
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      );
    }

    return (
      <MissedPrayersWeeklyProgressDashboard
        weekDays={[]}
        weekRangeLabel="---"
        weekFraction="---"
        totalPrayersThisWeek={0}
        streakDays={0}
        motivationalQuote="---"
        loading={prayerFrame?.isLoading || (!frame && !prayerFrame?.isError)}
      />
    );
  }

  if (template === "five-daily-prayers") {
    const frame = prayerFrame?.frame;
    const frameLoading =
      prayerFrame?.isLoading || (!frame && !prayerFrame?.isError);

    if (frame) {
      const totalWeeks = frame.cycle.totalWeeks;
      const currentWeek = frame.cycle.weekNumber;
      const canPrev = currentWeek > 1;
      const canNext = currentWeek < totalWeeks;

      return (
        <WeeklyProgressDashboard
          weekDays={mapFiveDailyFrameWeekDays(frame)}
          weekRangeLabel={formatPrayerFrameWeekRange(
            frame.cycle.weekStart,
            frame.cycle.weekEnd,
          )}
          weekFraction={getPrayerFrameWeekFraction(frame)}
          onTimePrayersCount={frame.week.thisWeekOnTime ?? 0}
          streakDays={frame.week.currentStreak}
          motivationalQuote={frame.week.motivationalMessage}
          selectedDayIndex={getPrayerFrameTodayIndex(frame)}
          onPrevWeek={
            canPrev
              ? () => prayerFrame?.setWeekNumber(currentWeek - 1)
              : undefined
          }
          onNextWeek={
            canNext
              ? () => prayerFrame?.setWeekNumber(currentWeek + 1)
              : undefined
          }
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

    return (
      <WeeklyProgressDashboard
        weekDays={[
          { day: "Sun", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Mon", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Tue", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Wed", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Thu", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Fri", statuses: ["none", "none", "none", "none", "none"] },
          { day: "Sat", statuses: ["none", "none", "none", "none", "none"] },
        ]}
        weekRangeLabel={frameLoading ? "---" : ""}
        weekFraction={frameLoading ? "---" : "—"}
        onTimePrayersCount={0}
        streakDays={0}
        motivationalQuote={frameLoading ? "---" : ""}
        renderRing={(day: DayProgress, size: number) => (
          <PrayerProgressTrackerRing
            statuses={day.statuses}
            size={size}
            strokeWidth={2.5}
          />
        )}
      />
    );
  }

  if (template === "tahiyat-al-masjid") {
    const frame = prayerFrame?.frame;
    if (frame) {
      const totalWeeks = frame.cycle.totalWeeks;
      const currentWeek = frame.cycle.weekNumber;

      const canPrev = currentWeek > 1;
      const canNext = currentWeek < totalWeeks;

      const handlePrevWeek = canPrev
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek - 1);
          }
        : undefined;

      const handleNextWeek = canNext
        ? () => {
            prayerFrame?.setWeekNumber(currentWeek + 1);
          }
        : undefined;

      return (
        <TahiyatAlMasjidWeeklyProgressDashboard
          weekDays={mapPrayerFrameWeekDays(frame)}
          weekRangeLabel={formatPrayerFrameWeekRange(
            frame.cycle.weekStart,
            frame.cycle.weekEnd,
          )}
          weekFraction={getPrayerFrameWeekFraction(frame)}
          totalPrayersThisWeek={frame.week.thisWeekTotal}
          streakDays={frame.week.currentStreak}
          motivationalQuote={frame.week.motivationalMessage}
          selectedDayIndex={getPrayerFrameTodayIndex(frame)}
          statsIcon="mosque"
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      );
    }

    return (
      <TahiyatAlMasjidWeeklyProgressDashboard
        weekDays={[]}
        weekRangeLabel=""
        weekFraction="—"
        totalPrayersThisWeek={0}
        streakDays={0}
        statsIcon="mosque"
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
        {
          day: "Sun",
          prayersLogged: 4,
          isLogged: true,
          loggedTime: "after-isha" as const,
        },
        {
          day: "Mon",
          prayersLogged: 8,
          isLogged: true,
          isBestDay: true,
          loggedTime: "both" as const,
        },
        {
          day: "Tue",
          prayersLogged: 4,
          isLogged: true,
          loggedTime: "before-fajr" as const,
        },
        { day: "Wed", prayersLogged: 0, isMissedStrict: true },
        {
          day: "Thu",
          prayersLogged: 4,
          isLogged: true,
          loggedTime: "after-isha" as const,
        },
        {
          day: "Fri",
          prayersLogged: 4,
          isLogged: true,
          loggedTime: "after-isha" as const,
        },
        {
          day: "Sat",
          prayersLogged: 4,
          isLogged: true,
          loggedTime: "after-isha" as const,
        },
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
    const mockWeekDays: SunnahRawatibDayProgress[] = [
      {
        day: "Sun",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 0,
            after_maghrib: 1,
            after_isha: 0,
          },
        },
      },
      {
        day: "Mon",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 2,
            after_maghrib: 1,
            after_isha: 0,
          },
        },
      },
      {
        day: "Tue",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 2,
            after_maghrib: 1,
            after_isha: 1,
          },
        },
      },
      {
        day: "Wed",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 2,
            after_maghrib: 1,
            after_isha: 1,
          },
        },
      },
      {
        day: "Thu",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 2,
            after_maghrib: 1,
            after_isha: 0,
          },
        },
      },
      {
        day: "Fri",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 1,
            before_dhuhr: 2,
            after_dhuhr: 2,
            before_asr: 2,
            after_maghrib: 1,
            after_isha: 1,
          },
        },
      },
      {
        day: "Sat",
        data: {
          goal: mockGoal,
          logged: {
            before_fajr: 0,
            before_dhuhr: 2,
            after_dhuhr: 1,
            before_asr: 1,
            after_maghrib: 1,
          },
        },
      },
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
          {
            day: "Wed",
            amountLogged: 15,
            isFuture: false,
            isLogged: true,
            isBestDay: true,
          },
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
          {
            day: "Tue",
            amountLogged: 30,
            isFuture: false,
            isLogged: true,
            isBestDay: true,
          },
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
          {
            day: "Thu",
            amountLogged: 5,
            isFuture: false,
            isLogged: true,
            isBestDay: true,
          },
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
        onNextWeek={() =>
          setZakatWeekIndex((i) => Math.min(ZAKAT_WEEKS.length - 1, i + 1))
        }
      />
    );
  }

  if (template === "kaffarah-fasts-oaths") {
    const KAFFARAH_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalThisWeek: 5,
        streakDays: 1,
        selectedDayIndex: 6,
        days: [
          {
            day: "Sun",
            category: "clothes" as const,
            count: 2,
            isToday: false,
          },
          { day: "Mon", category: null, count: 0 },
          { day: "Tue", category: null, count: 0 },
          { day: "Wed", category: "meals" as const, count: 2, isToday: false },
          { day: "Thu", category: null, count: 0 },
          { day: "Fri", category: "meals" as const, count: 1, isToday: false },
          { day: "Sat", category: null, count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalThisWeek: 8,
        streakDays: 3,
        selectedDayIndex: 3,
        days: [
          {
            day: "Sun",
            category: "clothes" as const,
            count: 3,
            isBestDay: true,
          },
          { day: "Mon", category: "meals" as const, count: 2 },
          { day: "Tue", category: "meals" as const, count: 1 },
          { day: "Wed", category: "clothes" as const, count: 2, isToday: true },
          { day: "Thu", category: null, count: 0, isFuture: true },
          { day: "Fri", category: null, count: 0, isFuture: true },
          { day: "Sat", category: null, count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalThisWeek: 0,
        streakDays: 0,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", category: null, count: 0 },
          { day: "Mon", category: null, count: 0 },
          { day: "Tue", category: null, count: 0 },
          { day: "Wed", category: null, count: 0 },
          { day: "Thu", category: null, count: 0, isFuture: true },
          { day: "Fri", category: null, count: 0, isFuture: true },
          { day: "Sat", category: null, count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalThisWeek: 10,
        streakDays: 5,
        selectedDayIndex: 4,
        days: [
          { day: "Sun", category: "meals" as const, count: 3, isBestDay: true },
          { day: "Mon", category: "clothes" as const, count: 2 },
          { day: "Tue", category: "meals" as const, count: 2 },
          { day: "Wed", category: "clothes" as const, count: 1 },
          { day: "Thu", category: "meals" as const, count: 2, isBlurDay: true },
          { day: "Fri", category: null, count: 0, isBlurDay: true },
          { day: "Sat", category: null, count: 0, isBlurDay: true },
        ],
      },
    ];

    const [kaffarahWeekIndex, setKaffarahWeekIndex] = useState(0);
    const kaffarahWeek = KAFFARAH_WEEKS[kaffarahWeekIndex];

    return (
      <KaffarahWeeklyProgressDashboard
        weekDays={kaffarahWeek.days}
        weekRangeLabel={kaffarahWeek.weekRangeLabel}
        weekFraction={kaffarahWeek.weekFraction}
        totalThisWeek={kaffarahWeek.totalThisWeek}
        streakDays={kaffarahWeek.streakDays}
        selectedDayIndex={kaffarahWeek.selectedDayIndex}
        motivationalQuote="Kaffarah is a reminder of Allah's mercy—keep it up and stay inspired!"
        onPrevWeek={() => setKaffarahWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() =>
          setKaffarahWeekIndex((i) =>
            Math.min(KAFFARAH_WEEKS.length - 1, i + 1),
          )
        }
      />
    );
  }

  if (template === "fidya") {
    const FIDYA_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalThisWeek: 3,
        streakDays: 1,
        selectedDayIndex: 6,
        days: [
          { day: "Sun", count: 1, isToday: false },
          { day: "Mon", count: 0 },
          { day: "Tue", count: 0 },
          { day: "Wed", count: 1, isToday: false },
          { day: "Thu", count: 0 },
          { day: "Fri", count: 1, isBestDay: true },
          { day: "Sat", count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalThisWeek: 5,
        streakDays: 3,
        selectedDayIndex: 3,
        days: [
          { day: "Sun", count: 2, isBestDay: true },
          { day: "Mon", count: 1 },
          { day: "Tue", count: 1 },
          { day: "Wed", count: 1, isToday: true },
          { day: "Thu", count: 0, isFuture: true },
          { day: "Fri", count: 0, isFuture: true },
          { day: "Sat", count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalThisWeek: 0,
        streakDays: 0,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", count: 0 },
          { day: "Mon", count: 0 },
          { day: "Tue", count: 0 },
          { day: "Wed", count: 0 },
          { day: "Thu", count: 0, isFuture: true },
          { day: "Fri", count: 0, isFuture: true },
          { day: "Sat", count: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalThisWeek: 10,
        streakDays: 5,
        selectedDayIndex: 4,
        days: [
          { day: "Sun", count: 3, isBestDay: true },
          { day: "Mon", count: 2 },
          { day: "Tue", count: 2 },
          { day: "Wed", count: 1 },
          { day: "Thu", count: 2, isBlurDay: true },
          { day: "Fri", count: 0, isBlurDay: true },
          { day: "Sat", count: 0, isBlurDay: true },
        ],
      },
    ];

    const [fidyaWeekIndex, setFidyaWeekIndex] = useState(0);
    const fidyaWeek = FIDYA_WEEKS[fidyaWeekIndex];

    return (
      <FidyaWeeklyProgressDashboard
        weekDays={fidyaWeek.days}
        weekRangeLabel={fidyaWeek.weekRangeLabel}
        weekFraction={fidyaWeek.weekFraction}
        totalThisWeek={fidyaWeek.totalThisWeek}
        streakDays={fidyaWeek.streakDays}
        selectedDayIndex={fidyaWeek.selectedDayIndex}
        onPrevWeek={() => setFidyaWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() =>
          setFidyaWeekIndex((i) => Math.min(FIDYA_WEEKS.length - 1, i + 1))
        }
      />
    );
  }

  if (template === "lillah") {
    const LILLAH_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalThisWeek: 350,
        streakDays: 1,
        selectedDayIndex: 6,
        days: [
          { day: "Sun", category: "household-essentials" as const, amount: 50 },
          { day: "Mon", category: null, amount: 0 },
          {
            day: "Tue",
            category: "food-relief" as const,
            amount: 140,
            isBestDay: true,
          },
          { day: "Wed", category: "qurbani" as const, amount: 100 },
          { day: "Thu", category: null, amount: 0 },
          { day: "Fri", category: "food-relief" as const, amount: 60 },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalThisWeek: 120,
        streakDays: 3,
        selectedDayIndex: 3,
        days: [
          {
            day: "Sun",
            category: "qard-hassan" as const,
            amount: 60,
            isBestDay: true,
          },
          { day: "Mon", category: "debt-assistance" as const, amount: 20 },
          { day: "Tue", category: "food-relief" as const, amount: 20 },
          {
            day: "Wed",
            category: "household-essentials" as const,
            amount: 20,
            isToday: true,
          },
          { day: "Thu", category: null, amount: 0, isFuture: true },
          { day: "Fri", category: null, amount: 0, isFuture: true },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalThisWeek: 0,
        streakDays: 0,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", category: null, amount: 0 },
          { day: "Mon", category: null, amount: 0 },
          { day: "Tue", category: null, amount: 0 },
          { day: "Wed", category: null, amount: 0 },
          { day: "Thu", category: null, amount: 0, isFuture: true },
          { day: "Fri", category: null, amount: 0, isFuture: true },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalThisWeek: 100,
        streakDays: 5,
        selectedDayIndex: 4,
        days: [
          {
            day: "Sun",
            category: "qurbani" as const,
            amount: 40,
            isBestDay: true,
          },
          { day: "Mon", category: "household-essentials" as const, amount: 20 },
          { day: "Tue", category: "food-relief" as const, amount: 20 },
          { day: "Wed", category: "qard-hassan" as const, amount: 20 },
          {
            day: "Thu",
            category: "debt-assistance" as const,
            amount: 0,
            isBlurDay: true,
          },
          { day: "Fri", category: null, amount: 0, isBlurDay: true },
          { day: "Sat", category: null, amount: 0, isBlurDay: true },
        ],
      },
    ];

    const [lillahWeekIndex, setLillahWeekIndex] = useState(0);
    const lillahWeek = LILLAH_WEEKS[lillahWeekIndex];

    return (
      <LillahWeeklyProgressDashboard
        weekDays={lillahWeek.days}
        weekRangeLabel={lillahWeek.weekRangeLabel}
        weekFraction={lillahWeek.weekFraction}
        totalThisWeek={lillahWeek.totalThisWeek}
        streakDays={lillahWeek.streakDays}
        selectedDayIndex={lillahWeek.selectedDayIndex}
        onPrevWeek={() => setLillahWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() =>
          setLillahWeekIndex((i) => Math.min(LILLAH_WEEKS.length - 1, i + 1))
        }
      />
    );
  }

  if (template === "sadaqah-jariyah") {
    const SADAQAH_JARIYAH_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalThisWeek: 350,
        streakDays: 1,
        selectedDayIndex: 6,
        days: [
          { day: "Sun", category: "honoring-parents" as const, amount: 50 },
          { day: "Mon", category: null, amount: 0 },
          {
            day: "Tue",
            category: "sponsoring-orphans" as const,
            amount: 140,
            isBestDay: true,
          },
          { day: "Wed", category: "building-wells" as const, amount: 100 },
          { day: "Thu", category: null, amount: 0 },
          { day: "Fri", category: "sponsoring-orphans" as const, amount: 60 },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalThisWeek: 120,
        streakDays: 3,
        selectedDayIndex: 3,
        days: [
          {
            day: "Sun",
            category: "teaching-quran" as const,
            amount: 60,
            isBestDay: true,
          },
          { day: "Mon", category: "planting-trees" as const, amount: 20 },
          { day: "Tue", category: "providing-clothing" as const, amount: 20 },
          {
            day: "Wed",
            category: "honoring-parents" as const,
            amount: 20,
            isToday: true,
          },
          { day: "Thu", category: null, amount: 0, isFuture: true },
          { day: "Fri", category: null, amount: 0, isFuture: true },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalThisWeek: 0,
        streakDays: 0,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", category: null, amount: 0 },
          { day: "Mon", category: null, amount: 0 },
          { day: "Tue", category: null, amount: 0 },
          { day: "Wed", category: null, amount: 0 },
          { day: "Thu", category: null, amount: 0, isFuture: true },
          { day: "Fri", category: null, amount: 0, isFuture: true },
          { day: "Sat", category: null, amount: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalThisWeek: 100,
        streakDays: 5,
        selectedDayIndex: 4,
        days: [
          {
            day: "Sun",
            category: "building-wells" as const,
            amount: 40,
            isBestDay: true,
          },
          { day: "Mon", category: "honoring-parents" as const, amount: 20 },
          { day: "Tue", category: "sponsoring-orphans" as const, amount: 20 },
          { day: "Wed", category: "teaching-quran" as const, amount: 20 },
          {
            day: "Thu",
            category: "planting-trees" as const,
            amount: 0,
            isBlurDay: true,
          },
          { day: "Fri", category: null, amount: 0, isBlurDay: true },
          { day: "Sat", category: null, amount: 0, isBlurDay: true },
        ],
      },
    ];

    const [sadaqahJariyahWeekIndex, setSadaqahJariyahWeekIndex] = useState(0);
    const sjWeek = SADAQAH_JARIYAH_WEEKS[sadaqahJariyahWeekIndex];

    return (
      <SadaqahJariyahWeeklyProgressDashboard
        weekDays={sjWeek.days}
        weekRangeLabel={sjWeek.weekRangeLabel}
        weekFraction={sjWeek.weekFraction}
        totalThisWeek={sjWeek.totalThisWeek}
        streakDays={sjWeek.streakDays}
        selectedDayIndex={sjWeek.selectedDayIndex}
        onPrevWeek={() => setSadaqahJariyahWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() =>
          setSadaqahJariyahWeekIndex((i) =>
            Math.min(SADAQAH_JARIYAH_WEEKS.length - 1, i + 1),
          )
        }
      />
    );
  }

  if (template === "sadaqah-volunteering") {
    const VOLUNTEERING_WEEKS = [
      {
        weekRangeLabel: "Nov 29 — Dec 5",
        weekFraction: "1/4",
        totalMinutesThisWeek: 150, // 2h 30m
        streakDays: 0,
        selectedDayIndex: 6,
        days: [
          {
            day: "Sun",
            category: "distributing-food" as const,
            minutesLogged: 60,
            isBestDay: true,
          },
          { day: "Mon", category: null, minutesLogged: 0 },
          {
            day: "Tue",
            category: "shaping-futures" as const,
            minutesLogged: 60,
          },
          {
            day: "Wed",
            category: "offering-compassion" as const,
            minutesLogged: 30,
          },
          { day: "Thu", category: null, minutesLogged: 0 },
          { day: "Fri", category: null, minutesLogged: 0 },
          { day: "Sat", category: null, minutesLogged: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 6 — 12",
        weekFraction: "2/4",
        totalMinutesThisWeek: 60,
        streakDays: 1,
        selectedDayIndex: 3,
        days: [
          {
            day: "Sun",
            category: "distributing-food" as const,
            minutesLogged: 30,
            isBestDay: true,
          },
          {
            day: "Mon",
            category: "shaping-futures" as const,
            minutesLogged: 15,
          },
          {
            day: "Tue",
            category: "offering-compassion" as const,
            minutesLogged: 15,
          },
          { day: "Wed", category: null, minutesLogged: 0, isToday: true },
          { day: "Thu", category: null, minutesLogged: 0, isFuture: true },
          { day: "Fri", category: null, minutesLogged: 0, isFuture: true },
          { day: "Sat", category: null, minutesLogged: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 13 — 19",
        weekFraction: "3/4",
        totalMinutesThisWeek: 0,
        streakDays: 0,
        selectedDayIndex: 0,
        days: [
          { day: "Sun", category: null, minutesLogged: 0 },
          { day: "Mon", category: null, minutesLogged: 0 },
          { day: "Tue", category: null, minutesLogged: 0 },
          { day: "Wed", category: null, minutesLogged: 0 },
          { day: "Thu", category: null, minutesLogged: 0, isFuture: true },
          { day: "Fri", category: null, minutesLogged: 0, isFuture: true },
          { day: "Sat", category: null, minutesLogged: 0, isFuture: true },
        ],
      },
      {
        weekRangeLabel: "Dec 20 — 26",
        weekFraction: "4/4",
        totalMinutesThisWeek: 210, // 3h 30m
        streakDays: 5,
        selectedDayIndex: 4,
        days: [
          {
            day: "Sun",
            category: "shaping-futures" as const,
            minutesLogged: 60,
            isBestDay: true,
          },
          {
            day: "Mon",
            category: "distributing-food" as const,
            minutesLogged: 45,
          },
          {
            day: "Tue",
            category: "offering-compassion" as const,
            minutesLogged: 45,
          },
          {
            day: "Wed",
            category: "shaping-futures" as const,
            minutesLogged: 30,
          },
          {
            day: "Thu",
            category: "distributing-food" as const,
            minutesLogged: 30,
            isBlurDay: true,
          },
          { day: "Fri", category: null, minutesLogged: 0, isBlurDay: true },
          { day: "Sat", category: null, minutesLogged: 0, isBlurDay: true },
        ],
      },
    ];

    const [volunteeringWeekIndex, setVolunteeringWeekIndex] = useState(0);
    const volWeek = VOLUNTEERING_WEEKS[volunteeringWeekIndex];

    return (
      <VolunteeringWeeklyProgressDashboard
        weekDays={volWeek.days}
        weekRangeLabel={volWeek.weekRangeLabel}
        weekFraction={volWeek.weekFraction}
        totalMinutesThisWeek={volWeek.totalMinutesThisWeek}
        streakDays={volWeek.streakDays}
        selectedDayIndex={volWeek.selectedDayIndex}
        onPrevWeek={() => setVolunteeringWeekIndex((i) => Math.max(0, i - 1))}
        onNextWeek={() =>
          setVolunteeringWeekIndex((i) =>
            Math.min(VOLUNTEERING_WEEKS.length - 1, i + 1),
          )
        }
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
