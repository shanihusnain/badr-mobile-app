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
};

const PrayerGoalFrameContext = createContext<PrayerGoalFrameContextValue | null>(
  null,
);

export function PrayerGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
}) {
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumber] = React.useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useGetPrayerGoalFrame(
    prayerType,
    { enabled: !!prayerType, weekNumber: weekNumber ?? undefined },
  );

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (weekNumber != null) return;
    if (!data?.cycle?.weekNumber) return;
    setWeekNumber(data.cycle.weekNumber);
  }, [data, weekNumber]);

  const value = useMemo(
    () => ({
      frame: data,
      isLoading,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
    }),
    [data, isLoading, isError, refetch, weekNumber],
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
