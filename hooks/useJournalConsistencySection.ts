import {
  PLAN_JOURNAL_PERIODS,
  type PlanJournalConsistencySnapshot,
  type PlanJournalPeriod,
  type PlanJournalPeriodId,
} from "@/src/screens/private/plan/planJournalConsistencyMockData";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useJournalConsistencySection<
  T extends PlanJournalConsistencySnapshot,
>(
  resolveSnapshots: (periodId: PlanJournalPeriodId) => T[],
  resetKey?: string | number,
) {
  const periods = PLAN_JOURNAL_PERIODS;
  const [period, setPeriod] = useState<PlanJournalPeriod>(periods[0]);
  const [periodIndex, setPeriodIndex] = useState(0);

  const periodSnapshots = useMemo(
    () => resolveSnapshots(period.id),
    [period.id, resetKey, resolveSnapshots],
  );

  const activeSnapshot = useMemo(() => {
    const safeIndex = Math.min(
      Math.max(periodIndex, 0),
      Math.max(periodSnapshots.length - 1, 0),
    );

    return periodSnapshots[safeIndex] ?? periodSnapshots[0];
  }, [periodSnapshots, periodIndex]);

  const deltaIsPositive = activeSnapshot.previousPeriodDeltaPercent >= 0;
  const canGoToPreviousPeriod = periodIndex < periodSnapshots.length - 1;
  const canGoToNextPeriod = periodIndex > 0;

  useEffect(() => {
    setPeriodIndex(0);
  }, [period.id, resetKey]);

  const handlePreviousPeriodRange = useCallback(() => {
    if (!canGoToPreviousPeriod) return;
    setPeriodIndex((current) => current + 1);
  }, [canGoToPreviousPeriod]);

  const handleNextPeriodRange = useCallback(() => {
    if (!canGoToNextPeriod) return;
    setPeriodIndex((current) => current - 1);
  }, [canGoToNextPeriod]);

  return {
    periods,
    period,
    setPeriod,
    periodIndex,
    activeSnapshot,
    deltaIsPositive,
    canGoToPreviousPeriod,
    canGoToNextPeriod,
    handlePreviousPeriodRange,
    handleNextPeriodRange,
  };
}
