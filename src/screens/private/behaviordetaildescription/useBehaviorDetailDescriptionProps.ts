import { useJournalConsistencySection } from "@/hooks/useJournalConsistencySection";
import { useCallback, useMemo } from "react";
import type { PlanJournalPeriodId } from "../plan/planJournalConsistencyMockData";
import {
  getBehaviorDetailContent,
  getBehaviorDetailPeriodView,
  getBehaviorDetailSnapshots,
} from "./behaviorDetailMockData";

export function useBehaviorDetailDescriptionProps(behaviorName: string) {
  const resolveSnapshots = useCallback(
    (periodId: PlanJournalPeriodId) =>
      getBehaviorDetailSnapshots(behaviorName, periodId),
    [behaviorName],
  );

  const consistency = useJournalConsistencySection(
    resolveSnapshots,
    behaviorName,
  );
  const content = getBehaviorDetailContent(behaviorName);
  const activePeriodView = useMemo(
    () =>
      getBehaviorDetailPeriodView(
        behaviorName,
        consistency.period.id,
        consistency.periodIndex,
        consistency.activeSnapshot,
      ),
    [
      behaviorName,
      consistency.period.id,
      consistency.periodIndex,
      consistency.activeSnapshot,
    ],
  );

  return {
    ...consistency,
    content,
    activePeriodView,
  };
}
