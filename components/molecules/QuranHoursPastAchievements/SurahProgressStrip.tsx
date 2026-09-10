import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import type { SurahProgressSegment } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationPastAchievementData";

type SurahProgressStripProps = {
  segments: SurahProgressSegment[];
};

export function SurahProgressStrip({ segments }: SurahProgressStripProps) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <View
          key={`${segment.status}-${index}`}
          style={[
            styles.segment,
            { flex: segment.flex ?? 1 },
            segment.status === "completed" && styles.completed,
            segment.status === "incomplete" && styles.incomplete,
            segment.status === "pending" && styles.pending,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    height: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  segment: {
    marginHorizontal: 1,
    borderRadius: 3,
  },
  completed: {
    backgroundColor: Colors.light.white,
  },
  incomplete: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  pending: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
