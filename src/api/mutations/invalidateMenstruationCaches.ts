import type { QueryClient } from "@tanstack/react-query";
import { ACTIVE_MENSTRUATION_QUERY_KEY } from "@/src/api/queries/useGetActiveMenstruationPeriod";
import { MENSTRUATION_PERIODS_LIST_QUERY_KEY } from "@/src/api/queries/useGetMenstruationPeriods";

/**
 * After create / end / correct / delete — period state and prayer goals
 * are recalculated server-side before the response returns.
 */
export function invalidateMenstruationRelatedQueries(
  queryClient: QueryClient,
) {
  queryClient.invalidateQueries({ queryKey: ACTIVE_MENSTRUATION_QUERY_KEY });
  queryClient.invalidateQueries({
    queryKey: MENSTRUATION_PERIODS_LIST_QUERY_KEY,
  });
  queryClient.invalidateQueries({ queryKey: ["menstruationPeriod"] });
  queryClient.invalidateQueries({ queryKey: ["me"] });

  // Prayer targets / rings / day-detail drop menstruation windows.
  queryClient.invalidateQueries({ queryKey: ["prayer-goal-frame"] });
  queryClient.invalidateQueries({ queryKey: ["prayer-goal-day-detail"] });
  queryClient.invalidateQueries({ queryKey: ["prayer-goal-achievements"] });
  queryClient.invalidateQueries({ queryKey: ["prayer-goal-insights"] });
  queryClient.invalidateQueries({ queryKey: ["all-prayer-goals"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
}
