import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGetQuranGoalByType } from "@/src/api/queries/useGetQuranGoalByType";
import type { QuranGoalFrameItem } from "@/src/api/queries/useGetQuranGoalFrame";
import type { QuranGoalDetailItem } from "@/src/utils/quranGoalMap";
import { stripEnglishParenthetical } from "@/src/utils/quranGoalMap";
import { resolveQuranSurahFrequency } from "@/src/storage/quranSurahFrequencyStorage";
import {
  getQuranFrameMemorisationItem,
  getQuranFrameMemorisationProgress,
  getQuranFrameMemorisationSurahName,
} from "@/src/utils/quranGoalFrameMap";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import {
  clampRecitationQuantity,
  getRecitationCycleTotal,
  getSurahRecitationCycleMode,
  type RecitationFrequency,
  type SurahRecitationGoalId,
} from "./quranRecitationTarget";
import {
  deriveSurahRecitationStatus,
  getSurahRecitationGoalsForFrequency,
  type SurahRecitationGoal,
  type SurahRecitationStatusKind,
} from "./quranRecitationSurahGoals";

export type RecitationSurahFilterId = string;

type RecitationSurahContextValue = {
  activeSurahId: RecitationSurahFilterId;
  setActiveSurahId: (id: RecitationSurahFilterId) => void;
  /** Quran surah number passed to the frame API as `itemNumber`. */
  activeItemNumber: number | null;
  goals: SurahRecitationGoal[];
  refreshKey: number;
  bumpRefresh: () => void;
};

const RecitationSurahContext =
  createContext<RecitationSurahContextValue | null>(null);

function bareSurahTitle(title: string | null | undefined, fallback: string) {
  const raw = title?.trim();
  if (!raw) return fallback;
  const bare = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return bare || raw;
}

function mapFrameItemToGoal(
  item: QuranGoalFrameItem,
  fallbackFrequency: RecitationFrequency,
): SurahRecitationGoal {
  const itemNumber = Number(item.itemNumber);
  const loggedRecitations = Math.max(
    0,
    Math.round(Number(item.completed) || 0),
  );
  const quantity = clampRecitationQuantity(
    Number(item.dailyTarget ?? item.target ?? 1) || 1,
  );
  const cycleTotal = Math.max(
    getRecitationCycleTotal(fallbackFrequency, quantity),
    Math.round(Number(item.target) || 0),
  );
  const achievementPercent =
    typeof item.achievementPct === "number"
      ? Math.min(100, Math.max(0, Math.round(item.achievementPct)))
      : undefined;
  const pillState = String(item.pill?.state ?? "").toUpperCase();
  const completed =
    pillState === "COMPLETED" ||
    pillState === "ACHIEVED" ||
    (cycleTotal > 0 && loggedRecitations >= cycleTotal);
  const status: SurahRecitationStatusKind = completed
    ? "achieved"
    : deriveSurahRecitationStatus(loggedRecitations, cycleTotal).status;

  return {
    id: String(itemNumber),
    itemNumber,
    surahName: bareSurahTitle(item.title, `Surah ${itemNumber}`),
    subtitle: item.subtitle?.trim() || undefined,
    pillLabel: item.pill?.label?.trim() || undefined,
    frequency: fallbackFrequency,
    quantity,
    loggedRecitations,
    cycleTotal,
    status,
    achievementPercent:
      achievementPercent ??
      deriveSurahRecitationStatus(loggedRecitations, cycleTotal)
        .achievementPercent,
    canLog: item.canLog !== false,
    completed,
  };
}

function mapDetailItemToGoal(
  item: QuranGoalDetailItem,
  fallbackFrequency: RecitationFrequency,
  goalFrequency?: string | null,
): SurahRecitationGoal {
  const itemNumber = Number(item.itemNumber);
  const id = String(itemNumber);
  const raw = item as QuranGoalDetailItem & {
    completed?: number | null;
    target?: number | null;
    frequency?: string | null;
    dailyTarget?: number | null;
  };
  const loggedRecitations = Math.max(
    0,
    Number(raw.completedCount ?? raw.completed ?? 0) || 0,
  );
  const quantity = clampRecitationQuantity(
    Number(raw.dailyTarget ?? raw.targetCount ?? raw.target ?? 1) || 1,
  );
  const frequency =
    resolveQuranSurahFrequency({
      surahId: itemNumber,
      times: quantity,
      itemFrequency: raw.frequency,
      goalFrequency,
    }) || fallbackFrequency;
  const cycleTotal = Math.max(
    getRecitationCycleTotal(frequency, quantity),
    Number(raw.targetCount ?? raw.target ?? 0) || 0,
  );
  const derived = deriveSurahRecitationStatus(loggedRecitations, cycleTotal);
  const completed =
    String(item.status ?? "").toUpperCase() === "COMPLETED" ||
    derived.status === "achieved";

  return {
    id,
    itemNumber,
    surahName: stripEnglishParenthetical(
      String(item.surahName ?? `Surah ${itemNumber}`),
    ),
    frequency,
    quantity,
    loggedRecitations,
    cycleTotal,
    status: completed ? "achieved" : derived.status,
    achievementPercent: derived.achievementPercent,
    completed,
  };
}

function enrichGoalFromFrame(
  goal: SurahRecitationGoal,
  frameGoal: SurahRecitationGoal | null,
): SurahRecitationGoal {
  if (!frameGoal || frameGoal.itemNumber !== goal.itemNumber) return goal;
  return { ...goal, ...frameGoal, id: goal.id, itemNumber: goal.itemNumber };
}

export function RecitationSurahProvider({
  goalId,
  initialSurahId,
  children,
}: {
  goalId: SurahRecitationGoalId;
  initialSurahId?: string;
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { data: detail } = useGetQuranGoalByType("RECITATION_SURAH");
  const fallbackFrequency = getSurahRecitationCycleMode(goalId);

  const frameGoals = useMemo(() => {
    const items = quranFrame?.frame?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map((item) => mapFrameItemToGoal(item, fallbackFrequency))
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [fallbackFrequency, quranFrame?.frame?.items]);

  const detailGoals = useMemo(() => {
    const items = detail?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map((item) =>
        mapDetailItemToGoal(item, fallbackFrequency, detail?.frequency),
      )
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [detail, fallbackFrequency]);

  const frameActiveGoal = useMemo((): SurahRecitationGoal | null => {
    const frame = quranFrame?.frame;
    const itemNumber = quranFrame?.itemNumber;
    if (!frame || itemNumber == null || itemNumber <= 0) return null;

    const item = getQuranFrameMemorisationItem(frame, itemNumber);
    const progress = getQuranFrameMemorisationProgress(frame, itemNumber);
    const surahName =
      getQuranFrameMemorisationSurahName(frame, itemNumber) ||
      item?.title?.trim() ||
      `Surah ${itemNumber}`;
    const quantity = clampRecitationQuantity(
      Number(item?.dailyTarget ?? progress.totalAyahs ?? 1) || 1,
    );
    const cycleTotal = Math.max(
      getRecitationCycleTotal(fallbackFrequency, quantity),
      progress.totalAyahs,
    );
    const loggedRecitations = progress.memorizedAyahs;
    const derived = deriveSurahRecitationStatus(
      loggedRecitations,
      cycleTotal,
    );

    return {
      id: String(itemNumber),
      itemNumber,
      surahName,
      subtitle: item?.subtitle?.trim() || undefined,
      pillLabel: item?.pill?.label?.trim() || undefined,
      frequency: fallbackFrequency,
      quantity,
      loggedRecitations,
      cycleTotal,
      status: progress.completed ? "achieved" : derived.status,
      achievementPercent:
        progress.progressPercent || derived.achievementPercent,
      canLog: item?.canLog !== false,
      completed: progress.completed,
    };
  }, [fallbackFrequency, quranFrame?.frame, quranFrame?.itemNumber]);

  const goals = useMemo(() => {
    const base =
      frameGoals && frameGoals.length > 0
        ? frameGoals
        : detailGoals && detailGoals.length > 0
          ? detailGoals
          : frameActiveGoal
            ? [frameActiveGoal]
            : getSurahRecitationGoalsForFrequency(fallbackFrequency);

    return base.map((goal) => enrichGoalFromFrame(goal, frameActiveGoal));
  }, [
    detailGoals,
    fallbackFrequency,
    frameActiveGoal,
    frameGoals,
  ]);

  const [activeSurahId, setActiveSurahIdState] = useState(
    () => initialSurahId ?? "",
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeSurahId && goals.some((goal) => goal.id === activeSurahId)) {
      return;
    }
    const first = goals[0];
    if (!first) return;
    setActiveSurahIdState(first.id);
  }, [activeSurahId, goals]);

  const activeItemNumber = useMemo(() => {
    const fromId = Number(activeSurahId);
    if (Number.isFinite(fromId) && fromId > 0) return fromId;
    const match = goals.find((goal) => goal.id === activeSurahId);
    return match?.itemNumber ?? goals[0]?.itemNumber ?? null;
  }, [activeSurahId, goals]);

  const setFrameItemNumber = quranFrame?.setItemNumber;
  const frameItemNumber = quranFrame?.itemNumber;
  const refetchFrame = quranFrame?.refetch;

  useEffect(() => {
    if (activeItemNumber == null || !setFrameItemNumber) return;
    if (frameItemNumber === activeItemNumber) return;
    setFrameItemNumber(activeItemNumber);
  }, [activeItemNumber, frameItemNumber, setFrameItemNumber]);

  const setActiveSurahId = useCallback((id: RecitationSurahFilterId) => {
    setActiveSurahIdState(id);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
    refetchFrame?.();
  }, [refetchFrame]);

  const value = useMemo(
    () => ({
      activeSurahId,
      setActiveSurahId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    }),
    [
      activeSurahId,
      setActiveSurahId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    ],
  );

  return (
    <RecitationSurahContext.Provider value={value}>
      {children}
    </RecitationSurahContext.Provider>
  );
}

export function useRecitationSurahContext(): RecitationSurahContextValue {
  const context = useContext(RecitationSurahContext);
  if (!context) {
    throw new Error(
      "useRecitationSurahContext must be used within RecitationSurahProvider",
    );
  }
  return context;
}

export function useOptionalRecitationSurahContext():
  | RecitationSurahContextValue
  | null {
  return useContext(RecitationSurahContext);
}

export function getActiveRecitationSurahGoal(
  activeSurahId: string,
): SurahRecitationGoal | undefined {
  return getSurahRecitationGoalsForFrequency("daily")
    .concat(getSurahRecitationGoalsForFrequency("weekly"))
    .find((goal) => goal.id === activeSurahId);
}
