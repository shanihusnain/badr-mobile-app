import type { QueryClient } from "@tanstack/react-query";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

/** Invalidate frame / list / insights caches after fasting log mutations. */
export function invalidateFastingCaches(
  queryClient: QueryClient,
  fastingTypeInput?: string | null,
) {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : null;

  if (fastingType) {
    queryClient.invalidateQueries({
      queryKey: ["fasting-goal-frame", fastingType],
    });
    queryClient.invalidateQueries({
      queryKey: ["fasting-goal-insights", fastingType],
    });
    queryClient.invalidateQueries({
      queryKey: ["fasting-goal-achievements", fastingType],
    });
    queryClient.invalidateQueries({
      queryKey: ["fasting-loggable-dates", fastingType],
    });
  } else {
    queryClient.invalidateQueries({ queryKey: ["fasting-goal-frame"] });
    queryClient.invalidateQueries({ queryKey: ["fasting-goal-insights"] });
    queryClient.invalidateQueries({ queryKey: ["fasting-goal-achievements"] });
    queryClient.invalidateQueries({ queryKey: ["fasting-loggable-dates"] });
  }

  queryClient.invalidateQueries({ queryKey: ["all-fasting-goals"] });
  queryClient.invalidateQueries({ queryKey: ["fasting-calendar-preview"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
}
