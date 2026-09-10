import { useJournalConsistencySection } from "@/hooks/useJournalConsistencySection";
import { useCallback } from "react";
import type { PlanJournalPeriodId } from "../plan/planJournalConsistencyMockData";
import { getJournalInsightSnapshots } from "./journalInsightMockData";

export function useJournalInsightProps(habitId: string) {
  const resolveSnapshots = useCallback(
    (periodId: PlanJournalPeriodId) =>
      getJournalInsightSnapshots(habitId, periodId),
    [habitId],
  );

  return useJournalConsistencySection(resolveSnapshots, habitId);
}
