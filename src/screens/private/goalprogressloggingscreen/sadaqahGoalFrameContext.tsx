import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetSadaqahGoalFrame,
  type SadaqahGoalFrameData,
} from "@/src/api/queries/useGetSadaqahGoalFrame";
import { resolveSadaqahTypeFromGoalId } from "@/src/utils/sadaqahGoalMap";
import type { GoalId } from "../home/components/goalsData";

type SadaqahGoalFrameContextValue = {
  frame: SadaqahGoalFrameData | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
  /** Current cycle week from the latest current-frame response. */
  weekNumber: number | null;
  /**
   * @deprecated Week browsing is owned by WeeklyBrowseFrameProvider.
   * Kept as a no-op so existing call sites do not change the screen frame.
   */
  setWeekNumber: (weekNumber: number) => void;
  openInsights?: () => void;
};

const SadaqahGoalFrameContext =
  createContext<SadaqahGoalFrameContextValue | null>(null);

export function SadaqahGoalFrameProvider({
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
  const sadaqahType = resolveSadaqahTypeFromGoalId(goalId);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);

  React.useEffect(() => {
    setWeekNumberState(null);
  }, [goalId]);

  // Always fetch the current cycle frame — week browsing uses WeeklyBrowseFrameProvider.
  // No keepPrevious: switching Kaffarah ↔ Zakat must not paint the other goal's frame.
  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetSadaqahGoalFrame(sadaqahType, {
      enabled: !!sadaqahType,
      keepPrevious: false,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    const fromWeek = data?.week?.weekNumber;
    if (typeof fromWeek === "number" && fromWeek > 0) {
      setWeekNumberState(fromWeek);
      return;
    }
    const fromCycle = data?.cycle?.weekNumber;
    if (typeof fromCycle === "number" && fromCycle > 0) {
      setWeekNumberState(fromCycle);
    }
  }, [data]);

  const setWeekNumber = React.useCallback((_nextWeek: number) => {
    // No-op: browse week is handled by WeeklyBrowseFrameProvider.
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
    <SadaqahGoalFrameContext.Provider value={value}>
      {children}
    </SadaqahGoalFrameContext.Provider>
  );
}

export function useOptionalSadaqahGoalFrameContext() {
  return useContext(SadaqahGoalFrameContext);
}

export function useSadaqahGoalFrameContext() {
  const ctx = useContext(SadaqahGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "useSadaqahGoalFrameContext must be used within SadaqahGoalFrameProvider",
    );
  }
  return ctx;
}
