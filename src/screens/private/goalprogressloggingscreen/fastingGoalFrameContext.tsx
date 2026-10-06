import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetFastingGoalFrame,
  type FastingGoalFrameData,
} from "@/src/api/queries/useGetFastingGoalFrame";
import { resolveFastingTypeFromGoalId } from "@/src/utils/fastingGoalMap";
import type { GoalId } from "../home/components/goalsData";

type FastingGoalFrameContextValue = {
  frame: FastingGoalFrameData | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
  weekNumber: number | null;
  setWeekNumber: (weekNumber: number) => void;
  openInsights?: () => void;
};

const FastingGoalFrameContext =
  createContext<FastingGoalFrameContextValue | null>(null);

export function FastingGoalFrameProvider({
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
  const fastingType = resolveFastingTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);
  /** Only send `week` after the user taps prev/next — not after hydrating from the first response. */
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = React.useState(false);

  React.useEffect(() => {
    setWeekNumberState(null);
    setHasUserSelectedWeek(false);
  }, [goalId]);

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetFastingGoalFrame(fastingType, {
      enabled: !!fastingType,
      weekNumber: hasUserSelectedWeek ? (weekNumber ?? undefined) : undefined,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (weekNumber != null) return;
    const fromWeek = data?.week?.weekNumber;
    if (typeof fromWeek === "number" && fromWeek > 0) {
      setWeekNumberState(fromWeek);
      return;
    }
    const fromCycle = data?.cycle?.weekNumber;
    if (typeof fromCycle === "number" && fromCycle > 0) {
      setWeekNumberState(fromCycle);
    }
  }, [data, weekNumber]);

  const setWeekNumber = React.useCallback((nextWeek: number) => {
    setHasUserSelectedWeek(true);
    setWeekNumberState(nextWeek);
  }, []);

  const value = useMemo(
    () => ({
      frame: data,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      openInsights: onOpenInsights,
    }),
    [
      data,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      onOpenInsights,
    ],
  );

  return (
    <FastingGoalFrameContext.Provider value={value}>
      {children}
    </FastingGoalFrameContext.Provider>
  );
}

export function useOptionalFastingGoalFrameContext() {
  return useContext(FastingGoalFrameContext);
}

export function useFastingGoalFrameContext() {
  const ctx = useContext(FastingGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "useFastingGoalFrameContext must be used within FastingGoalFrameProvider",
    );
  }
  return ctx;
}
