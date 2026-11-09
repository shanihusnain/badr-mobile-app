import React, { useEffect } from "react";
import { Pressable } from "react-native";
import { styles as commonStyles } from "./DailyProgressLogging.styles";
import { useLoggingOverlay } from "../loggingOverlayContext";

/**
 * Full-screen dim behind the logging flow card. Also notifies the screen
 * shell so header back / info buttons drop under the overlay.
 */
export function LoggingBackdrop() {
  const setLoggingOverlayActive = useLoggingOverlay()?.setLoggingOverlayActive;

  useEffect(() => {
    setLoggingOverlayActive?.(true);
    return () => setLoggingOverlayActive?.(false);
  }, [setLoggingOverlayActive]);

  return <Pressable style={commonStyles.backdrop} />;
}
