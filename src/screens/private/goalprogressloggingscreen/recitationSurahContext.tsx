import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getSurahRecitationCycleMode,
  type SurahRecitationGoalId,
} from "./quranRecitationTarget";
import {
  getSurahRecitationGoalsForFrequency,
  type SurahRecitationGoal,
} from "./quranRecitationSurahGoals";

export type RecitationSurahFilterId = string;

type RecitationSurahContextValue = {
  activeSurahId: RecitationSurahFilterId;
  setActiveSurahId: (id: RecitationSurahFilterId) => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const RecitationSurahContext =
  createContext<RecitationSurahContextValue | null>(null);

function getInitialSurahId(goalId: SurahRecitationGoalId): string {
  const frequency = getSurahRecitationCycleMode(goalId);
  return getSurahRecitationGoalsForFrequency(frequency)[0]?.id ?? "";
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
  const [activeSurahId, setActiveSurahId] = useState(() => {
    if (initialSurahId) {
      return initialSurahId;
    }
    return getInitialSurahId(goalId);
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const goals = getSurahRecitationGoalsForFrequency(
      getSurahRecitationCycleMode(goalId),
    );
    setActiveSurahId((current) =>
      goals.some((goal) => goal.id === current)
        ? current
        : (goals[0]?.id ?? ""),
    );
  }, [goalId]);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      activeSurahId,
      setActiveSurahId,
      refreshKey,
      bumpRefresh,
    }),
    [activeSurahId, refreshKey, bumpRefresh],
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
