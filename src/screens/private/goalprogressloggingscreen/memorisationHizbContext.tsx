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
import {
  getQuranFrameMemorisationItem,
  getQuranFrameMemorisationProgress,
  getQuranFrameMemorisationSurahName,
} from "@/src/utils/quranGoalFrameMap";
import { useOptionalQuranGoalFrameContext } from "./quranGoalFrameContext";
import {
  getHizbMemorisationGoals,
  type HizbMemorisationGoal,
  type HizbMemorisationStatusKind,
  type MemorisationHizbFilterId,
} from "./quranMemorisationHizbGoals";
import { getHizbVerseCount, resolveHizbRangeLabel } from "./quranHizbVerseMap";

type MemorisationHizbContextValue = {
  activeHizbId: MemorisationHizbFilterId;
  setActiveHizbId: (id: MemorisationHizbFilterId) => void;
  /** Hizb number passed to the frame API as `itemNumber`. */
  activeItemNumber: number | null;
  goals: HizbMemorisationGoal[];
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationHizbContext =
  createContext<MemorisationHizbContextValue | null>(null);

function deriveStatus(
  memorizedAyahs: number,
  totalAyahs: number,
  completed: boolean,
): HizbMemorisationStatusKind {
  if (completed || (totalAyahs > 0 && memorizedAyahs >= totalAyahs)) {
    return "completed";
  }
  if (memorizedAyahs > 0) return "in-progress";
  return "not-started";
}

function bareTitle(title: string | null | undefined, fallback: string) {
  const raw = title?.trim();
  if (!raw) return fallback;
  const bare = raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return bare || raw;
}

/** API sometimes puts "(total N verses)" in subtitle — that is not a range. */
function isTotalVersesLabel(value: string) {
  return /^\(?\s*total\b/i.test(value) || /\bverses?\s*\)?\s*$/i.test(value);
}

function pickRangeLabel(...candidates: Array<string | undefined | null>) {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && !isTotalVersesLabel(value)) return value;
  }
  return "";
}

function mapFrameItemToGoal(item: QuranGoalFrameItem): HizbMemorisationGoal {
  const itemNumber = Number(item.itemNumber);
  const memorizedAyahs = Math.max(0, Math.round(Number(item.completed) || 0));
  const totalAyahs = Math.max(0, Math.round(Number(item.target) || 0));
  const progressPercentage =
    typeof item.achievementPct === "number"
      ? Math.min(100, Math.max(0, Math.round(item.achievementPct)))
      : totalAyahs > 0
        ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
        : 0;
  const pillState = String(item.pill?.state ?? "").toUpperCase();
  const completed =
    pillState === "COMPLETED" ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);
  const hizbNameRaw = bareTitle(item.title, `Hizb ${itemNumber}`);
  const rangeFromTitle = hizbNameRaw.includes("|")
    ? hizbNameRaw.split("|").slice(1).join("|").trim()
    : "";
  const rangeLabel = pickRangeLabel(
    item.subtitle,
    rangeFromTitle,
    resolveHizbRangeLabel(itemNumber),
  );
  const hizbName = hizbNameRaw.includes("|")
    ? hizbNameRaw.split("|")[0]!.trim()
    : hizbNameRaw;
  const displayName = rangeLabel ? `${hizbName} | ${rangeLabel}` : hizbName;

  return {
    id: String(itemNumber),
    itemNumber,
    hizbName,
    rangeLabel,
    displayName,
    subtitle: rangeLabel || undefined,
    pillLabel: item.pill?.label?.trim() || undefined,
    totalAyahs:
      totalAyahs > 0 ? totalAyahs : getHizbVerseCount(String(itemNumber)),
    memorizedAyahs,
    progressPercentage,
    completed,
    canLog: item.canLog !== false,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function mapDetailItemToGoal(item: QuranGoalDetailItem): HizbMemorisationGoal {
  const itemNumber = Number(item.itemNumber);
  const id = String(itemNumber);
  const raw = item as QuranGoalDetailItem & {
    completed?: number | null;
    target?: number | null;
  };
  const memorizedAyahs = Math.max(
    0,
    Number(raw.completedCount ?? raw.completed ?? 0) || 0,
  );
  const totalFromVerses =
    item.verseStart != null && item.verseEnd != null
      ? Math.max(0, Number(item.verseEnd) - Number(item.verseStart) + 1)
      : 0;
  const totalAyahs = Math.max(
    0,
    Number(raw.targetCount ?? raw.target ?? 0) || totalFromVerses || 0,
  );
  const progressPercentage =
    totalAyahs > 0
      ? Math.min(100, Math.round((memorizedAyahs / totalAyahs) * 100))
      : 0;
  const completed =
    String(item.status ?? "").toUpperCase() === "COMPLETED" ||
    (totalAyahs > 0 && memorizedAyahs >= totalAyahs);
  const fallbackName = `Hizb ${itemNumber}`;
  const rawName = String(item.surahName?.trim() || fallbackName);
  const hizbName = bareTitle(
    rawName.includes("|") ? rawName.split("|")[0]!.trim() : rawName,
    fallbackName,
  );
  const rangeLabel = pickRangeLabel(
    rawName.includes("|") ? rawName.split("|").slice(1).join("|").trim() : "",
    resolveHizbRangeLabel(itemNumber),
  );

  return {
    id,
    itemNumber,
    hizbName,
    rangeLabel,
    displayName: rangeLabel ? `${hizbName} | ${rangeLabel}` : hizbName,
    totalAyahs: totalAyahs > 0 ? totalAyahs : getHizbVerseCount(id),
    memorizedAyahs,
    progressPercentage,
    completed,
    status: deriveStatus(memorizedAyahs, totalAyahs, completed),
  };
}

function enrichGoalFromFrame(
  goal: HizbMemorisationGoal,
  frameGoal: HizbMemorisationGoal | null,
): HizbMemorisationGoal {
  if (!frameGoal || frameGoal.itemNumber !== goal.itemNumber) return goal;
  return { ...goal, ...frameGoal, id: goal.id, itemNumber: goal.itemNumber };
}

export function MemorisationHizbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const quranFrame = useOptionalQuranGoalFrameContext();
  const { data: detail } = useGetQuranGoalByType("MEMORIZATION_HIZB");

  const frameGoals = useMemo(() => {
    const items = quranFrame?.frame?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map(mapFrameItemToGoal)
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [quranFrame?.frame?.items]);

  const detailGoals = useMemo(() => {
    const items = detail?.items ?? [];
    if (items.length === 0) return null;
    return items
      .map(mapDetailItemToGoal)
      .filter((goal) => goal.itemNumber != null && goal.itemNumber > 0);
  }, [detail]);

  const frameActiveGoal = useMemo((): HizbMemorisationGoal | null => {
    const frame = quranFrame?.frame;
    const itemNumber = quranFrame?.itemNumber;
    if (!frame || itemNumber == null || itemNumber <= 0) return null;

    const item = getQuranFrameMemorisationItem(frame, itemNumber);
    const progress = getQuranFrameMemorisationProgress(frame, itemNumber);
    const rawName =
      getQuranFrameMemorisationSurahName(frame, itemNumber) ||
      item?.title?.trim() ||
      `Hizb ${itemNumber}`;
    const hizbName = rawName.includes("|")
      ? rawName.split("|")[0]!.trim()
      : bareTitle(rawName, `Hizb ${itemNumber}`);
    const rangeLabel = pickRangeLabel(
      item?.subtitle,
      rawName.includes("|") ? rawName.split("|").slice(1).join("|").trim() : "",
      resolveHizbRangeLabel(itemNumber),
    );
    const pillLabel = item?.pill?.label?.trim() || undefined;
    const canLog = item?.canLog !== false;
    const displayName = rangeLabel ? `${hizbName} | ${rangeLabel}` : hizbName;

    return {
      id: String(itemNumber),
      itemNumber,
      hizbName,
      rangeLabel,
      displayName,
      subtitle: rangeLabel || undefined,
      pillLabel,
      totalAyahs:
        progress.totalAyahs > 0
          ? progress.totalAyahs
          : getHizbVerseCount(String(itemNumber)),
      memorizedAyahs: progress.memorizedAyahs,
      progressPercentage: progress.progressPercent,
      completed: progress.completed,
      canLog,
      status: deriveStatus(
        progress.memorizedAyahs,
        progress.totalAyahs,
        progress.completed,
      ),
    };
  }, [quranFrame?.frame, quranFrame?.itemNumber]);

  const goals = useMemo(() => {
    const base =
      frameGoals && frameGoals.length > 0
        ? frameGoals
        : detailGoals && detailGoals.length > 0
          ? detailGoals
          : frameActiveGoal
            ? [frameActiveGoal]
            : getHizbMemorisationGoals();

    return base.map((goal) => enrichGoalFromFrame(goal, frameActiveGoal));
  }, [detailGoals, frameActiveGoal, frameGoals]);

  const [activeHizbId, setActiveHizbIdState] =
    useState<MemorisationHizbFilterId>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (activeHizbId !== "all") return;
    const first = goals[0];
    if (!first) return;
    setActiveHizbIdState(first.id);
  }, [goals, activeHizbId]);

  const activeItemNumber = useMemo(() => {
    if (activeHizbId === "all") return goals[0]?.itemNumber ?? null;
    const fromId = Number(activeHizbId);
    if (Number.isFinite(fromId) && fromId > 0) return fromId;
    const match = goals.find((goal) => goal.id === activeHizbId);
    return match?.itemNumber ?? null;
  }, [activeHizbId, goals]);

  const setFrameItemNumber = quranFrame?.setItemNumber;
  const frameItemNumber = quranFrame?.itemNumber;
  const refetchFrame = quranFrame?.refetch;

  useEffect(() => {
    if (activeItemNumber == null || !setFrameItemNumber) return;
    if (frameItemNumber === activeItemNumber) return;
    setFrameItemNumber(activeItemNumber);
  }, [activeItemNumber, frameItemNumber, setFrameItemNumber]);

  const setActiveHizbId = useCallback((id: MemorisationHizbFilterId) => {
    setActiveHizbIdState(id);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
    refetchFrame?.();
  }, [refetchFrame]);

  const value = useMemo(
    () => ({
      activeHizbId,
      setActiveHizbId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    }),
    [
      activeHizbId,
      setActiveHizbId,
      activeItemNumber,
      goals,
      refreshKey,
      bumpRefresh,
    ],
  );

  return (
    <MemorisationHizbContext.Provider value={value}>
      {children}
    </MemorisationHizbContext.Provider>
  );
}

export function useMemorisationHizbContext(): MemorisationHizbContextValue {
  const context = useContext(MemorisationHizbContext);
  if (!context) {
    throw new Error(
      "useMemorisationHizbContext must be used within MemorisationHizbProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationHizbContext():
  | MemorisationHizbContextValue
  | null {
  return useContext(MemorisationHizbContext);
}
