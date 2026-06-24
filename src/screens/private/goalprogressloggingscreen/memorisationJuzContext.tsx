import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getJuzMemorisationGoals,
  type MemorisationJuzFilterId,
} from "./quranMemorisationJuzGoals";

type MemorisationJuzContextValue = {
  activeJuzId: MemorisationJuzFilterId;
  setActiveJuzId: (id: MemorisationJuzFilterId) => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationJuzContext =
  createContext<MemorisationJuzContextValue | null>(null);

export function MemorisationJuzProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeJuzId, setActiveJuzId] = useState<MemorisationJuzFilterId>(
    () => getJuzMemorisationGoals()[0]?.id ?? "all",
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      activeJuzId,
      setActiveJuzId,
      refreshKey,
      bumpRefresh,
    }),
    [activeJuzId, refreshKey, bumpRefresh],
  );

  return (
    <MemorisationJuzContext.Provider value={value}>
      {children}
    </MemorisationJuzContext.Provider>
  );
}

export function useMemorisationJuzContext(): MemorisationJuzContextValue {
  const context = useContext(MemorisationJuzContext);
  if (!context) {
    throw new Error(
      "useMemorisationJuzContext must be used within MemorisationJuzProvider",
    );
  }
  return context;
}

export function useOptionalMemorisationJuzContext():
  | MemorisationJuzContextValue
  | null {
  return useContext(MemorisationJuzContext);
}
