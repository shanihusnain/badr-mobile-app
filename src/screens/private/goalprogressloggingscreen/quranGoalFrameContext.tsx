import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  useGetQuranGoalFrame,
  type QuranGoalFrameData,
} from "@/src/api/queries/useGetQuranGoalFrame";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import type { GoalId } from "../home/components/goalsData";

type QuranGoalFrameContextValue = {
  frame: QuranGoalFrameData | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
  weekNumber: number | null;
  setWeekNumber: (weekNumber: number) => void;
  /** Active surah/juz/hizb for multi-item frames (e.g. MEMORIZATION_SURAH). */
  itemNumber: number | null;
  setItemNumber: (itemNumber: number) => void;
  openInsights?: () => void;
};

const QuranGoalFrameContext =
  createContext<QuranGoalFrameContextValue | null>(null);

function quranTypeRequiresItemNumber(quranGoalType: string | null): boolean {
  if (!quranGoalType) return false;
  return (
    quranGoalType === "MEMORIZATION_SURAH" ||
    quranGoalType === "MEMORIZATION_JUZ" ||
    quranGoalType === "MEMORIZATION_HIZB" ||
    quranGoalType === "RECITATION_SURAH"
  );
}

export function QuranGoalFrameProvider({
  goalId,
  refreshKey = 0,
  children,
  onOpenInsights,
  /** Seed itemNumber before the carousel reports the active surah. */
  initialItemNumber,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
  onOpenInsights?: () => void;
  initialItemNumber?: number | null;
}) {
  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const requiresItemNumber = quranTypeRequiresItemNumber(quranGoalType);
  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);
  const [hasUserSelectedWeek, setHasUserSelectedWeek] = React.useState(false);
  const [itemNumber, setItemNumberState] = React.useState<number | null>(
    () => initialItemNumber ?? null,
  );

  const {
    data: detail,
    isFetched: isDetailFetched,
    isError: isDetailError,
  } = useGetQuranGoalByType(requiresItemNumber ? quranGoalType : null, {
    enabled: requiresItemNumber && !!quranGoalType,
  });

  React.useEffect(() => {
    setWeekNumberState(null);
    setHasUserSelectedWeek(false);
    setItemNumberState(initialItemNumber ?? null);
  }, [goalId, initialItemNumber]);

  /** Prefer detail list so the first frame call already includes `itemNumber`. */
  useEffect(() => {
    if (itemNumber != null) return;
    if (initialItemNumber != null) {
      setItemNumberState(initialItemNumber);
      return;
    }
    const first = detail?.items?.[0]?.itemNumber;
    if (typeof first === "number" && Number.isFinite(first) && first > 0) {
      setItemNumberState(first);
    }
  }, [detail, itemNumber, initialItemNumber]);

  const canFetchFrameWithoutItem =
    requiresItemNumber &&
    (isDetailError || (isDetailFetched && !(detail?.items?.length)));

  const frameEnabled =
    !!quranGoalType &&
    (!requiresItemNumber || itemNumber != null || canFetchFrameWithoutItem);

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useGetQuranGoalFrame(quranGoalType, {
      enabled: frameEnabled,
      weekNumber: hasUserSelectedWeek ? (weekNumber ?? undefined) : undefined,
      itemNumber: itemNumber ?? undefined,
    });

  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (weekNumber != null) return;
    if (!data?.week?.weekNumber) return;
    setWeekNumberState(data.week.weekNumber);
  }, [data, weekNumber]);

  /** Fallback if detail had no items but frame returned one. */
  useEffect(() => {
    if (itemNumber != null) return;
    const first = data?.items?.[0]?.itemNumber;
    if (typeof first === "number" && Number.isFinite(first) && first > 0) {
      setItemNumberState(first);
    }
  }, [data, itemNumber]);

  const setWeekNumber = React.useCallback((nextWeek: number) => {
    setHasUserSelectedWeek(true);
    setWeekNumberState(nextWeek);
  }, []);

  const setItemNumber = React.useCallback((nextItem: number) => {
    if (!Number.isFinite(nextItem) || nextItem <= 0) return;
    setItemNumberState(nextItem);
  }, []);

  const waitingForItemNumber =
    requiresItemNumber && itemNumber == null && !canFetchFrameWithoutItem;

  const value = useMemo(
    () => ({
      frame: data,
      isLoading: waitingForItemNumber || isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      itemNumber,
      setItemNumber,
      openInsights: onOpenInsights,
    }),
    [
      data,
      waitingForItemNumber,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
      weekNumber,
      setWeekNumber,
      itemNumber,
      setItemNumber,
      onOpenInsights,
    ],
  );

  return (
    <QuranGoalFrameContext.Provider value={value}>
      {children}
    </QuranGoalFrameContext.Provider>
  );
}

export function useOptionalQuranGoalFrameContext() {
  return useContext(QuranGoalFrameContext);
}

export function useQuranGoalFrameContext() {
  const ctx = useContext(QuranGoalFrameContext);
  if (!ctx) {
    throw new Error(
      "useQuranGoalFrameContext must be used within QuranGoalFrameProvider",
    );
  }
  return ctx;
}
