import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  getHizbMemorisationGoals,
  type MemorisationHizbFilterId,
} from "./quranMemorisationHizbGoals";

type MemorisationHizbContextValue = {
  activeHizbId: MemorisationHizbFilterId;
  setActiveHizbId: (id: MemorisationHizbFilterId) => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const MemorisationHizbContext =
  createContext<MemorisationHizbContextValue | null>(null);

export function MemorisationHizbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeHizbId, setActiveHizbId] = useState<MemorisationHizbFilterId>(
    () => getHizbMemorisationGoals()[0]?.id ?? "all",
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      activeHizbId,
      setActiveHizbId,
      refreshKey,
      bumpRefresh,
    }),
    [activeHizbId, refreshKey, bumpRefresh],
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
