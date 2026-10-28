import { useGetJournalBehaviorDetils } from "@/src/api/queries/useGetJournalBehaviorDetils";
import {
  PLAN_JOURNAL_PERIODS,
  type PlanJournalPeriod,
} from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapBehaviorDetailToView } from "./mapBehaviorDetailToView";

function todayDateKey() {
  return new Date().toISOString().split("T")[0];
}

function resolvePeriod(periodLabel?: string): PlanJournalPeriod {
  return (
    PLAN_JOURNAL_PERIODS.find((item) => item.label === periodLabel) ??
    PLAN_JOURNAL_PERIODS[0]
  );
}

type UseBehaviorDetailDescriptionPropsOptions = {
  behaviorId: string;
  initialPeriodLabel?: string;
  initialEndDate?: string;
  fallbackTitle?: string;
};

export function useBehaviorDetailDescriptionProps({
  behaviorId,
  initialPeriodLabel,
  initialEndDate,
  fallbackTitle,
}: UseBehaviorDetailDescriptionPropsOptions) {
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
    data: behaviorDetails,
    isFetching,
    isLoading,
  } = useGetJournalBehaviorDetils(behaviorId, period.label, endDate);

  const mapped = useMemo(
    () =>
      mapBehaviorDetailToView(behaviorDetails, {
        isLoading: isFetching || isLoading || !behaviorDetails,
        title: behaviorDetails?.title || fallbackTitle,
      }),
    [behaviorDetails, fallbackTitle, isFetching, isLoading],
  );

  const canGoToPreviousPeriod = Boolean(
    behaviorDetails?.navigation?.previousEndDate,
  );
  const canGoToNextPeriod = Boolean(behaviorDetails?.navigation?.nextEndDate);

  const handleSelectPeriod = useCallback((nextPeriod: PlanJournalPeriod) => {
    setPeriod(nextPeriod);
    setEndDate(todayDateKey());
  }, []);

  const handlePreviousPeriodRange = useCallback(() => {
    const previousEndDate = behaviorDetails?.navigation?.previousEndDate;
    if (!previousEndDate) return;
    setEndDate(previousEndDate);
  }, [behaviorDetails?.navigation?.previousEndDate]);

  const handleNextPeriodRange = useCallback(() => {
    const nextEndDate = behaviorDetails?.navigation?.nextEndDate;
    if (!nextEndDate) return;
    setEndDate(nextEndDate);
  }, [behaviorDetails?.navigation?.nextEndDate]);

  return {
    periods,
    period,
    setPeriod: handleSelectPeriod,
    activeSnapshot: mapped.snapshot,
    deltaIsPositive: (mapped.snapshot.previousPeriodDeltaPercent ?? 0) >= 0,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
    content: mapped.content,
    activePeriodView: mapped.periodView,
    title: mapped.title,
    isLoading: isFetching || isLoading,
    endDate,
  };
}
