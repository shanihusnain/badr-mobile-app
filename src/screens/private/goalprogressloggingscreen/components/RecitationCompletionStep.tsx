import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";
import {
  clampDailyRecitationTarget,
  getRecitationSegmentColor,
  type QuranRecitationDayType,
  type RecitationSegmentVisualState,
} from "@/src/screens/private/goalprogressloggingscreen/quranRecitationWeeklyData";

type Props = {
  /** Period target (daily quantity or weekly quota), 1–5. */
  target: number;
  /** Already logged before this session (stays green). */
  alreadyLogged: number;
  /** Count being added in this session (1…remaining). */
  sessionCount: number;
  dayType: QuranRecitationDayType;
  onChangeSessionCount: (count: number) => void;
};

const RING_SIZE = 42;

/**
 * Logging “Add completion” ring.
 * Previously logged → green; remaining empty → white (today) / yellow (past);
 * session picks fill the next empty slots as green.
 */
export function RecitationCompletionStep({
  target: rawTarget,
  alreadyLogged,
  sessionCount,
  dayType,
  onChangeSessionCount,
}: Props) {
  const formatNumber = useLocaleNumber();
  const target = clampDailyRecitationTarget(rawTarget);
  const prior = Math.min(Math.max(alreadyLogged, 0), target);
  const remaining = Math.max(0, target - prior);
  const displayCompleted = Math.min(prior + Math.max(sessionCount, 0), target);

  const segmentStates = useMemo((): RecitationSegmentVisualState[] => {
    return Array.from({ length: target }, (_, index) => {
      if (index < displayCompleted) return "completed";
      if (dayType === "future") return "future";
      if (dayType === "past") return "missed";
      return "pending";
    });
  }, [dayType, displayCompleted, target]);

  const handlePress = () => {
    if (remaining <= 0) return;
    // Cycle 1…remaining (never leave the step at 0 after first tap).
    const next =
      sessionCount >= remaining || sessionCount < 1 ? 1 : sessionCount + 1;
    onChangeSessionCount(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={remaining <= 0}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={`${displayCompleted} of ${target}`}
    >
      <View style={styles.badge}>
        {target === 1 ? (
          <SolidCompletionRing
            filled={displayCompleted >= 1}
            dayType={dayType}
            size={RING_SIZE}
          />
        ) : (
          <SegmentedCompletionRing
            size={RING_SIZE}
            segmentStates={segmentStates}
          />
        )}
      </View>
      <Text style={styles.fraction}>
        {`${formatNumber(displayCompleted)}/${formatNumber(target)}`}
      </Text>
    </Pressable>
  );
}

function SolidCompletionRing({
  filled,
  dayType,
  size,
}: {
  filled: boolean;
  dayType: QuranRecitationDayType;
  size: number;
}) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;

  if (filled) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: Colors.light.green,
        }}
      />
    );
  }

  // Empty 0/1 — hollow white (today) or yellow (past missed) outline.
  const stroke =
    dayType === "past" ? Colors.light.yellow : "rgba(255, 255, 255, 0.85)";

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
}

function SegmentedCompletionRing({
  size,
  segmentStates,
}: {
  size: number;
  segmentStates: RecitationSegmentVisualState[];
}) {
  const target = segmentStates.length;
  // Thick arcs with rounded caps; gaps centered at top & bottom (2× daily).
  const strokeWidth = 4.2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Round caps eat ~strokeWidth of the gap visually — pad so a clear center gap remains.
  const gapSize =
    target === 2
      ? strokeWidth + 5
      : target >= 5
        ? strokeWidth + 2
        : strokeWidth + 3;
  const segmentWidth = circumference / target;
  const dashLength = Math.max(segmentWidth - gapSize, 1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        {segmentStates.map((state, index) => (
          <Circle
            key={`${index}-${state}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={getRecitationSegmentColor(state)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            // Shift by half-gap so openings sit on the vertical center (12 & 6 o'clock).
            strokeDashoffset={-(index * segmentWidth) - gapSize / 2}
            strokeLinecap="round"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  badge: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  fraction: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
});
