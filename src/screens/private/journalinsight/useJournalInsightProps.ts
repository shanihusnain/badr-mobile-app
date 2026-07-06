import {
  PLAN_JOURNAL_PERIODS,
  type PlanJournalPeriod,
} from "../plan/planJournalConsistencyMockData";
import { useEffect, useMemo, useState } from "react";
import {
  getJournalInsightSnapshot,
  getJournalInsightSnapshots,
} from "./journalInsightMockData";

export function useJournalInsightProps(habitId: string) {
  const periods = PLAN_JOURNAL_PERIODS;
  const [period, setPeriod] = useState<PlanJournalPeriod>(periods[0]);
  const [periodIndex, setPeriodIndex] = useState(0);

  const periodSnapshots = useMemo(
    () => getJournalInsightSnapshots(habitId, period.id),
    [habitId, period.id],
  );

  const activeSnapshot = useMemo(
    () => getJournalInsightSnapshot(habitId, period.id, periodIndex),
    [habitId, period.id, periodIndex],
  );

  const deltaIsPositive = activeSnapshot.previousPeriodDeltaPercent >= 0;
  const canGoToPreviousPeriod = periodIndex < periodSnapshots.length - 1;
  const canGoToNextPeriod = periodIndex > 0;

  useEffect(() => {
    setPeriodIndex(0);
  }, [period.id, habitId]);

  const handlePreviousPeriodRange = () => {
    if (!canGoToPreviousPeriod) return;
    setPeriodIndex((current) => current + 1);
  };

  const handleNextPeriodRange = () => {
    if (!canGoToNextPeriod) return;
    setPeriodIndex((current) => current - 1);
  };

  return {
    periods,
    period,
    setPeriod,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
  };
}
