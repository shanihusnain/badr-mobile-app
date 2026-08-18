import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetPrayerGoalFrame,
  type PrayerGoalFrameData,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import type { GoalId } from "../home/components/goalsData";

type PrayerGoalFrameContextValue = {
  frame: PrayerGoalFrameData | null | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  weekNumber: number | null;
  setWeekNumber: (weekNumber: number) => void;
  openInsights?: () => void;
};

const PrayerGoalFrameContext = createContext<PrayerGoalFrameContextValue | null>(
  null,
);

export function PrayerGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
  onOpenInsights,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
  onOpenInsights?: () => void;
}) {
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);
  /** Only send `week` after the user taps prev/next — not after hydrating from the first response. */
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = React.useState(false);

  React.useEffect(() => {
    setWeekNumberState(null);
    setHasUserSelectedWeek(false);
  }, [goalId]);

  const { data, isLoading, isError, refetch } = useGetPrayerGoalFrame(
    prayerType,
    {
      enabled: !!prayerType,
      weekNumber: hasUserSelectedWeek ? (weekNumber ?? undefined) : undefined,
    },
  );

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (weekNumber != null) return;
    if (!data?.cycle?.weekNumber) return;
    setWeekNumberState(data.cycle.weekNumber);
  }, [data, weekNumber]);

  const setWeekNumber = React.useCallback((nextWeek: number) => {
    setHasUserSelectedWeek(true);
    setWeekNumberState(nextWeek);
  }, []);

  const value = useMemo(
    () => ({
      frame: data,
      isLoading,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      openInsights: onOpenInsights,
    }),
    [data, isLoading, isError, refetch, weekNumber, setWeekNumber, onOpenInsights],
  );

  return (
    <PrayerGoalFrameContext.Provider value={value}>
      {children}
    </PrayerGoalFrameContext.Provider>
  );
}

export function useOptionalPrayerGoalFrameContext() {
  return useContext(PrayerGoalFrameContext);
}

export function usePrayerGoalFrameContext() {
  const ctx = useContext(PrayerGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "usePrayerGoalFrameContext must be used within PrayerGoalFrameProvider",
    );
  }
  return ctx;
}
