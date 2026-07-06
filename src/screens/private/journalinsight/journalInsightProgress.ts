import { Colors } from "@/constants/theme";
import type { PlanJournalPeriodId } from "../plan/planJournalConsistencyMockData";

export function getJournalInsightProgressColor(percent: number): string {
  if (percent <= 33) return Colors.light.white;
  if (percent <= 66) return Colors.light.dullWhite;
  return Colors.light.golden;
}

export function getPeriodCountPercent(
  count: number,
  periodId: PlanJournalPeriodId,
): number {
  const periodMax = periodId === 2 ? 28 : periodId === 3 ? 90 : 180;

  return Math.min(100, Math.max(0, Math.round((count / periodMax) * 100)));
}
