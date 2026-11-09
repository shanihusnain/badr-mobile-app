import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoggingOverlayContextValue = {
  isLoggingOverlayActive: boolean;
  setLoggingOverlayActive: (active: boolean) => void;
};

const LoggingOverlayContext =
  createContext<LoggingOverlayContextValue | null>(null);

export function LoggingOverlayProvider({ children }: { children: ReactNode }) {
  const [isLoggingOverlayActive, setIsLoggingOverlayActive] = useState(false);
  const setLoggingOverlayActive = useCallback((active: boolean) => {
    setIsLoggingOverlayActive(active);
  }, []);

  const value = useMemo(
    () => ({ isLoggingOverlayActive, setLoggingOverlayActive }),
    [isLoggingOverlayActive, setLoggingOverlayActive],
  );

  return (
    <LoggingOverlayContext.Provider value={value}>
      {children}
    </LoggingOverlayContext.Provider>
  );
}

export function useLoggingOverlay() {
  return useContext(LoggingOverlayContext);
}
