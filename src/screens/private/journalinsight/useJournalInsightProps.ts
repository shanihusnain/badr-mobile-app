import { useGetHabitDetail } from "@/src/api/queries/usGetHabitDetail";
import {
  PLAN_JOURNAL_PERIODS,
  type PlanJournalPeriod,
} from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { getPlanJournalHabitTitleById } from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapHabitDetailToSnapshot } from "./mapHabitDetailToSnapshot";

function todayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function resolvePeriod(periodLabel?: string): PlanJournalPeriod {
  return (
    PLAN_JOURNAL_PERIODS.find((item) => item.label === periodLabel) ??
    PLAN_JOURNAL_PERIODS[0]
  );
}

type UseJournalInsightPropsOptions = {
  habitCategory: string;
  initialPeriodLabel?: string;
  initialEndDate?: string;
};

export function useJournalInsightProps({
  habitCategory,
  initialPeriodLabel,
  initialEndDate,
}: UseJournalInsightPropsOptions) {
  const periods = PLAN_JOURNAL_PERIODS;
  const [period, setPeriod] = useState<PlanJournalPeriod>(() =>
    resolvePeriod(initialPeriodLabel),
  );
  const [endDate, setEndDate] = useState(
    () => initialEndDate?.trim() || todayDateKey(),
  );

  useEffect(() => {
    if (initialPeriodLabel) {
      setPeriod(resolvePeriod(initialPeriodLabel));
    }
  }, [initialPeriodLabel]);

  useEffect(() => {
    if (initialEndDate?.trim()) {
      setEndDate(initialEndDate.trim());
    }
  }, [initialEndDate]);

  const {
    data: habitDetail,
    isFetching,
    isLoading,
  } = useGetHabitDetail(habitCategory, period.label, endDate);

  const activeSnapshot = useMemo(
    () =>
      mapHabitDetailToSnapshot(habitDetail, {
        isLoading: isFetching || isLoading || !habitDetail,
        habitTitle:
          habitDetail?.title ?? getPlanJournalHabitTitleById(habitCategory),
      }),
    [habitCategory, habitDetail, isFetching, isLoading],
  );

  const canGoToPreviousPeriod = Boolean(
    habitDetail?.navigation?.previousEndDate,
  );
  const canGoToNextPeriod = Boolean(habitDetail?.navigation?.nextEndDate);

  const handleSelectPeriod = useCallback((nextPeriod: PlanJournalPeriod) => {
    setPeriod(nextPeriod);
    setEndDate(todayDateKey());
  }, []);

  const handlePreviousPeriodRange = useCallback(() => {
    const previousEndDate = habitDetail?.navigation?.previousEndDate;
    if (!previousEndDate) return;
    setEndDate(previousEndDate);
  }, [habitDetail?.navigation?.previousEndDate]);

  const handleNextPeriodRange = useCallback(() => {
    const nextEndDate = habitDetail?.navigation?.nextEndDate;
    if (!nextEndDate) return;
    setEndDate(nextEndDate);
  }, [habitDetail?.navigation?.nextEndDate]);

  return {
    periods,
    period,
    setPeriod: handleSelectPeriod,
    activeSnapshot,
    deltaIsPositive: (activeSnapshot.previousPeriodDeltaPercent ?? 0) >= 0,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
    isLoading: isFetching || isLoading,
    endDate,
  };
}
