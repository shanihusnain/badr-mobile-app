import type { QueryClient } from "@tanstack/react-query";
import { resolveSadaqahType } from "@/src/utils/sadaqahGoalMap";

/** Invalidate frame / list caches after sadaqah log mutations. */
export function invalidateSadaqahCaches(
  queryClient: QueryClient,
  sadaqahTypeInput?: string | null,
) {
  const sadaqahType = sadaqahTypeInput
    ? resolveSadaqahType(sadaqahTypeInput)
    : null;

  if (sadaqahType) {
    queryClient.invalidateQueries({
      queryKey: ["sadaqah-goal-frame", sadaqahType],
    });
    queryClient.invalidateQueries({
      queryKey: ["sadaqah-goal-insights", sadaqahType],
    });
    queryClient.invalidateQueries({
      queryKey: ["sadaqah-goal-achievements", sadaqahType],
    });
    queryClient.invalidateQueries({
      queryKey: ["sadaqah-detail", sadaqahType],
    });
  } else {
    queryClient.invalidateQueries({ queryKey: ["sadaqah-goal-frame"] });
    queryClient.invalidateQueries({ queryKey: ["sadaqah-goal-insights"] });
    queryClient.invalidateQueries({ queryKey: ["sadaqah-goal-achievements"] });
    queryClient.invalidateQueries({ queryKey: ["sadaqah-detail"] });
  }

  queryClient.invalidateQueries({ queryKey: ["all-sadaqah-goals"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-categories"] });
  queryClient.invalidateQueries({ queryKey: ["goal-cycle-category-goals"] });
}
