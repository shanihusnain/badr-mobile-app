import React, { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";

/** Fallback until the first content layout is measured. */
const FALLBACK_BODY_MIN_HEIGHT = 240;

type Props = {
  loading: boolean;
  children: ReactNode;
};

/**
 * Keeps prayer weekly dashboard card height stable:
 * measures the days+footer body when content is shown, then reuses that
 * height while showing a centered LoadingComponent.
 */
export function PrayerWeeklyDashboardBody({ loading, children }: Props) {
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  if (loading) {
    return (
      <View
        style={[
          styles.body,
          {
            minHeight: measuredHeight ?? FALLBACK_BODY_MIN_HEIGHT,
            height: measuredHeight ?? undefined,
          },
        ]}
      >
        <LoadingComponent size="medium" style={styles.loader} />
      </View>
    );
  }

  return (
    <View
      style={styles.body}
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.height);
        if (next > 0) {
          setMeasuredHeight((prev) => (prev === next ? prev : next));
        }
      }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  loader: {
    flex: 0,
  },
});
