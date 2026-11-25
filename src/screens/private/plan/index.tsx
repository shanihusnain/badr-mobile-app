import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { TopSpace } from "@/components/atoms/TopSpace";
import { useGetJournalInsights } from "@/src/api/queries/useGetJournalInsights";
import {
  consistencyBadgeToDeltaPercent,
  normalizeConsistencyBadge,
} from "@/src/utils/consistencyBadge";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoalTabContent } from "./components/GoalTabContent";
import { JournalCustomizeBottomSheet } from "./components/JournalCustomizeBottomSheet";
import { JournalTabContent } from "./components/JournalTabContent";
import { PlanTabBar } from "./components/PlanTabBar";
import type { PlanJournalConsistencySnapshot } from "./planJournalConsistencyMockData";
import type { PlanJournalPeriod } from "./planJournalConsistencyMockData";
import { usePlanProps } from "./usePlanProps";

function todayDateKey() {
  return new Date().toISOString().split("T")[0];
}

export default function PlanScreen() {
  const { customizeJournal } = useLocalSearchParams<{
    customizeJournal?: string | string[];
  }>();
  const {
    tabs,
    PERIODS,
    selectedTab,
    setSelectedTab,
    period,
    setPeriod,
    activeSnapshot,
    studyMaterial,
    journalTabs,
    selectedJournalTab,
    setSelectedJournalTab,
  } = usePlanProps();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [insightsEndDate, setInsightsEndDate] = useState(todayDateKey);
  const shouldOpenJournalCustomizer = Array.isArray(customizeJournal)
    ? customizeJournal[0] === "true"
    : customizeJournal === "true";

  useFocusEffect(
    useCallback(() => {
      if (!shouldOpenJournalCustomizer) return;

      setSelectedTab(2);
      const timeout = setTimeout(() => {
        bottomSheetRef.current?.expand();
      }, 250);

      return () => clearTimeout(timeout);
    }, [setSelectedTab, shouldOpenJournalCustomizer]),
  );

  const { data: journalInsights, isFetching: isFetchingJournalInsights } =
    useGetJournalInsights(period.label, insightsEndDate);

  useEffect(() => {
    setInsightsEndDate(todayDateKey());
  }, [period.id]);

  const journalSnapshot = useMemo<PlanJournalConsistencySnapshot>(() => {
    const fallbackHabits =
      journalInsights?.categories.map((category) => ({
        id: category.key,
        name: category.title,
        percent: null as number | null,
      })) ??
      activeSnapshot.journalingHabits?.map((habit) => ({
        ...habit,
        percent: null as number | null,
      })) ??
      [];

    if (isFetchingJournalInsights || !journalInsights) {
      return {
        dateRangeLabel: "---",
        consistencyPercent: null,
        previousPeriodDeltaPercent: null,
        consistencyBadge: null,
        journalingHabits: fallbackHabits,
      };
    }

    const hasComparison = journalInsights.consistency.hasComparison;
    const badge = hasComparison
      ? normalizeConsistencyBadge(journalInsights.consistency.badge)
      : null;

    return {
      dateRangeLabel: journalInsights.window.label,
      consistencyPercent: journalInsights.consistency.pct,
      previousPeriodDeltaPercent: consistencyBadgeToDeltaPercent(
        badge,
        hasComparison,
      ),
      consistencyBadge: badge?.label ?? null,
      journalingHabits: journalInsights.categories.map((category) => ({
        id: category.key,
        name: category.title,
        percent: category.pct,
      })),
    };
  }, [activeSnapshot, isFetchingJournalInsights, journalInsights]);

  const canGoToPreviousPeriod = Boolean(
    journalInsights?.navigation.previousEndDate,
  );
  const canGoToNextPeriod = Boolean(journalInsights?.navigation.nextEndDate);

  const handleSelectPeriod = useCallback(
    (nextPeriod: PlanJournalPeriod) => {
      setPeriod(nextPeriod);
      setInsightsEndDate(todayDateKey());
    },
    [setPeriod],
  );

  const handlePreviousPeriodRange = useCallback(() => {
    const previousEndDate = journalInsights?.navigation.previousEndDate;
    if (!previousEndDate) return;
    setInsightsEndDate(previousEndDate);
  }, [journalInsights?.navigation.previousEndDate]);

  const handleNextPeriodRange = useCallback(() => {
    const nextEndDate = journalInsights?.navigation.nextEndDate;
    if (!nextEndDate) return;
    setInsightsEndDate(nextEndDate);
  }, [journalInsights?.navigation.nextEndDate]);

  const handleCustomizePress = useCallback((selectedBehaviorIds: string[]) => {
    console.log("Selected journal behaviors:", selectedBehaviorIds);
    bottomSheetRef.current?.close();
  }, []);

  return (
    <BlackScreenWrapper edges={[]}>
      <TopSpace top={20} />
      <PlanTabBar
        tabs={tabs}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
      />
      <TopSpace top={20} />
      {selectedTab === 1 ? (
        <GoalTabContent studyMaterial={studyMaterial} />
      ) : (
        <JournalTabContent
          bannerText={journalInsights?.intro}
          activeSnapshot={journalSnapshot}
          periods={PERIODS}
          period={period}
          deltaIsPositive={
            (journalSnapshot.previousPeriodDeltaPercent ?? 0) > 0
          }
          canGoToPreviousPeriod={canGoToPreviousPeriod}
          canGoToNextPeriod={canGoToNextPeriod}
          onSelectPeriod={handleSelectPeriod}
          onPreviousPeriodRange={handlePreviousPeriodRange}
          onNextPeriodRange={handleNextPeriodRange}
          onGetStartedPress={() => bottomSheetRef.current?.expand()}
          isLoadingHabits={isFetchingJournalInsights}
          insightsEndDate={insightsEndDate}
        />
      )}
      <JournalCustomizeBottomSheet
        ref={bottomSheetRef}
        journalTabs={journalTabs}
        selectedJournalTab={selectedJournalTab}
        onSelectJournalTab={setSelectedJournalTab}
        onCustomizePress={handleCustomizePress}
      />
    </BlackScreenWrapper>
  );
}
