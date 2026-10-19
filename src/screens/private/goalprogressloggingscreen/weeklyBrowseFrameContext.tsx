import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import {
  useGetPrayerGoalFrame,
  type PrayerGoalFrameData,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import {
  useGetQuranGoalFrame,
  type QuranGoalFrameData,
} from "@/src/api/queries/useGetQuranGoalFrame";
import {
  useGetFastingGoalFrame,
  type FastingGoalFrameData,
} from "@/src/api/queries/useGetFastingGoalFrame";
import {
  useGetSadaqahGoalFrame,
  type SadaqahGoalFrameData,
} from "@/src/api/queries/useGetSadaqahGoalFrame";
import { resolvePrayerTypeFromGoalId } from "@/src/utils/prayerGoalMap";
import { resolveQuranTypeFromGoalId } from "@/src/utils/quranGoalMap";
import { resolveFastingTypeFromGoalId } from "@/src/utils/fastingGoalMap";
import { resolveSadaqahTypeFromGoalId } from "@/src/utils/sadaqahGoalMap";
import type { GoalId } from "../home/components/goalsData";
import { useOptionalPrayerGoalFrameContext } from "./prayerGoalFrameContext";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import { useOptionalFastingGoalFrameContext } from "./fastingGoalFrameContext";
import { useOptionalSadaqahGoalFrameContext } from "./sadaqahGoalFrameContext";

export type WeeklyBrowseKind = "prayer" | "quran" | "fasting" | "sadaqah" | null;

export type WeeklyBrowseFrame =
  | PrayerGoalFrameData
  | QuranGoalFrameData
  | FastingGoalFrameData
  | SadaqahGoalFrameData;

type WeeklyBrowseDispatchValue = {
  setWeekNumber: (weekNumber: number) => void;
};

type WeeklyBrowseStateValue = {
  kind: WeeklyBrowseKind;
  weekNumber: number | null;
  frame: WeeklyBrowseFrame | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  isError: boolean;
  refetch: () => void;
};

const WeeklyBrowseDispatchContext =
  createContext<WeeklyBrowseDispatchValue | null>(null);

const WeeklyBrowseStateContext =
  createContext<WeeklyBrowseStateValue | null>(null);

type SetterRef = MutableRefObject<((weekNumber: number) => void) | null>;

const WeeklyBrowseSetterRefContext = createContext<SetterRef | null>(null);

/**
 * Stable dispatch only — does not re-render when the browsed week changes.
 * Wrap LoggingFlowSlot + WeeklyBrowseStateProvider.
 */
export function WeeklyBrowseDispatchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const setterRef = useRef<((weekNumber: number) => void) | null>(null);
  const setWeekNumber = useCallback((weekNumber: number) => {
    setterRef.current?.(weekNumber);
  }, []);
  const dispatch = useMemo(() => ({ setWeekNumber }), [setWeekNumber]);

  return (
    <WeeklyBrowseSetterRefContext.Provider value={setterRef}>
      <WeeklyBrowseDispatchContext.Provider value={dispatch}>
        {children}
      </WeeklyBrowseDispatchContext.Provider>
    </WeeklyBrowseSetterRefContext.Provider>
  );
}

function resolveBrowseKind(goalId: GoalId): WeeklyBrowseKind {
  if (resolvePrayerTypeFromGoalId(goalId)) return "prayer";
  if (resolveQuranTypeFromGoalId(goalId)) return "quran";
  if (resolveFastingTypeFromGoalId(goalId)) return "fasting";
  if (resolveSadaqahTypeFromGoalId(goalId)) return "sadaqah";
  return null;
}

function hydrateWeekFromScreenFrame(
  kind: WeeklyBrowseKind,
  prayerFrame: ReturnType<typeof useOptionalPrayerGoalFrameContext>,
  quranFrame: ReturnType<typeof useOptionalQuranGoalFrameContext>,
  fastingFrame: ReturnType<typeof useOptionalFastingGoalFrameContext>,
  sadaqahFrame: ReturnType<typeof useOptionalSadaqahGoalFrameContext>,
): number | null {
  if (kind === "prayer") {
    const n =
      prayerFrame?.weekNumber ?? prayerFrame?.frame?.cycle?.weekNumber ?? null;
    return typeof n === "number" && n > 0 ? n : null;
  }
  if (kind === "quran") {
    const n =
      quranFrame?.weekNumber ?? quranFrame?.frame?.week?.weekNumber ?? null;
    return typeof n === "number" && n > 0 ? n : null;
  }
  if (kind === "fasting") {
    const n =
      fastingFrame?.weekNumber ??
      fastingFrame?.frame?.week?.weekNumber ??
      fastingFrame?.frame?.cycle?.weekNumber ??
      null;
    return typeof n === "number" && n > 0 ? n : null;
  }
  if (kind === "sadaqah") {
    const n =
      sadaqahFrame?.weekNumber ??
      sadaqahFrame?.frame?.week?.weekNumber ??
      sadaqahFrame?.frame?.cycle?.weekNumber ??
      null;
    return typeof n === "number" && n > 0 ? n : null;
  }
  return null;
}

/**
 * Owns browsed weekNumber + week-scoped frame query.
 * Mount only around WeeklyProgressSection so week nav does not re-render hero/flows.
 */
export function WeeklyBrowseStateProvider({
  goalId,
  refreshKey = 0,
  children,
}: {
  goalId: GoalId;
  refreshKey?: number;
  children: ReactNode;
}) {
  const kind = resolveBrowseKind(goalId);
  const prayerType = resolvePrayerTypeFromGoalId(goalId);
  const quranGoalType = resolveQuranTypeFromGoalId(goalId);
  const fastingType = resolveFastingTypeFromGoalId(goalId);
  const sadaqahType = resolveSadaqahTypeFromGoalId(goalId);

  const screenPrayer = useOptionalPrayerGoalFrameContext();
  const screenQuran = useOptionalQuranGoalFrameContext();
  const screenFasting = useOptionalFastingGoalFrameContext();
  const screenSadaqah = useOptionalSadaqahGoalFrameContext();
  const setterRef = useContext(WeeklyBrowseSetterRefContext);

  const [weekNumber, setWeekNumberState] = React.useState<number | null>(null);

  React.useEffect(() => {
    setWeekNumberState(null);
  }, [goalId]);

  // Hydrate browse week from the screen "current" frame once available.
  useEffect(() => {
    if (weekNumber != null) return;
    const hydrated = hydrateWeekFromScreenFrame(
      kind,
      screenPrayer,
      screenQuran,
      screenFasting,
      screenSadaqah,
    );
    if (hydrated != null) {
      setWeekNumberState(hydrated);
    }
  }, [kind, weekNumber, screenPrayer, screenQuran, screenFasting, screenSadaqah]);

  useEffect(() => {
    if (!setterRef) return;
    setterRef.current = setWeekNumberState;
    return () => {
      setterRef.current = null;
    };
  }, [setterRef]);

  const quranItemNumber = screenQuran?.itemNumber ?? undefined;
  const browseEnabled = weekNumber != null && kind != null;

  const prayerQuery = useGetPrayerGoalFrame(prayerType, {
    enabled: browseEnabled && kind === "prayer",
    weekNumber: weekNumber ?? undefined,
  });

  const quranQuery = useGetQuranGoalFrame(quranGoalType, {
    enabled: browseEnabled && kind === "quran",
    weekNumber: weekNumber ?? undefined,
    itemNumber: quranItemNumber,
  });

  const fastingQuery = useGetFastingGoalFrame(fastingType, {
    enabled: browseEnabled && kind === "fasting",
    weekNumber: weekNumber ?? undefined,
  });

  const sadaqahQuery = useGetSadaqahGoalFrame(sadaqahType, {
    enabled: browseEnabled && kind === "sadaqah",
    weekNumber: weekNumber ?? undefined,
  });

  const activeQuery =
    kind === "prayer"
      ? prayerQuery
      : kind === "quran"
        ? quranQuery
        : kind === "fasting"
          ? fastingQuery
          : kind === "sadaqah"
            ? sadaqahQuery
            : null;

  useEffect(() => {
    if (refreshKey > 0) {
      activeQuery?.refetch();
    }
  }, [refreshKey, activeQuery?.refetch]);

  const state = useMemo<WeeklyBrowseStateValue>(() => {
    if (!kind || !activeQuery) {
      return {
        kind,
        weekNumber,
        frame: undefined,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        refetch: () => {},
      };
    }
    return {
      kind,
      weekNumber,
      frame: activeQuery.data,
      isLoading: activeQuery.isLoading,
      isFetching: activeQuery.isFetching,
      isPlaceholderData: activeQuery.isPlaceholderData,
      isError: activeQuery.isError,
      refetch: activeQuery.refetch,
    };
  }, [
    kind,
    weekNumber,
    activeQuery?.data,
    activeQuery?.isLoading,
    activeQuery?.isFetching,
    activeQuery?.isPlaceholderData,
    activeQuery?.isError,
    activeQuery?.refetch,
  ]);

  return (
    <WeeklyBrowseStateContext.Provider value={state}>
      {children}
    </WeeklyBrowseStateContext.Provider>
  );
}

export function useWeeklyBrowseDispatch() {
  return useContext(WeeklyBrowseDispatchContext);
}

export function useOptionalWeeklyBrowseState() {
  return useContext(WeeklyBrowseStateContext);
}

export function useWeeklyBrowseState() {
  const ctx = useContext(WeeklyBrowseStateContext);
  if (!ctx) {
    throw new Error(
      "useWeeklyBrowseState must be used within WeeklyBrowseStateProvider",
    );
  }
  return ctx;
}
