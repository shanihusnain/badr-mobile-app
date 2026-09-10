import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getSurahMemorisationGoals,
  type MemorisationSurahFilterId,
} from "./quranMemorisationSurahGoals";

type MemorisationSurahContextValue = {
  activeSurahId: MemorisationSurahFilterId;
  setActiveSurahId: (id: MemorisationSurahFilterId) => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationSurahContext =
  createContext<MemorisationSurahContextValue | null>(null);

export function MemorisationSurahProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSurahId, setActiveSurahId] = useState<MemorisationSurahFilterId>(
    () => getSurahMemorisationGoals()[0]?.id ?? "all",
  );
  const [refreshKey, setRefreshKey] = useState(0);

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
    <MemorisationSurahContext.Provider value={value}>
      {children}
    </MemorisationSurahContext.Provider>
  );
}

export function useMemorisationSurahContext(): MemorisationSurahContextValue {
  const context = useContext(MemorisationSurahContext);
  if (!context) {
    throw new Error(
      "useMemorisationSurahContext must be used within MemorisationSurahProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationSurahContext():
  | MemorisationSurahContextValue
  | null {
  return useContext(MemorisationSurahContext);
}
