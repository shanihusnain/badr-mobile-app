import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { MondayThursdayFastDayState } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";

type RingVisual =
  | { variant: "outline"; color: string; opacity?: number }
  | { variant: "solid"; color: string; scale?: number; opacity?: number }
  | { variant: "skipped" }
  | { variant: "menstruatingPlanned" }
  | { variant: "menstruatingUnplanned" };

/**
 * Mon & Thu Fasts day rings — match Figma states:
 * future outline, today/past grey fills, seagreen planned/completed,
 * yellow skip warning, red menstruating (bar vs center dot).
 */
function getRingVisual(
  state: MondayThursdayFastDayState,
  isMenstruating: boolean,
  isPlanned: boolean,
): RingVisual {
  if (isMenstruating && state !== "completed" && state !== "goalAchieved") {
    return isPlanned
      ? { variant: "menstruatingPlanned" }
      : { variant: "menstruatingUnplanned" };
  }

  switch (state) {
    case "future":
      return { variant: "outline", color: Colors.light.graylightshade };
    case "today":
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.88,
      };
    case "todayDisabled":
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.88,
        opacity: 0.45,
      };
    case "pastNeutral":
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.88,
      };
    case "planned":
    case "plannedToday":
      return { variant: "outline", color: Colors.light.seagreen };
    case "completed":
      // Figma annotates completed fill ~18px within the day column.
      return {
        variant: "solid",
        color: Colors.light.seagreen,
        scale: 0.82,
      };
    case "missed":
      return { variant: "skipped" };
    case "goalAchieved":
      return {
        variant: "outline",
        color: Colors.light.calendarBg,
        opacity: 0.4,
      };
    default:
      return { variant: "outline", color: Colors.light.dullWhiteOpacity };
  }
}

type Props = {
  size: number;
  state: MondayThursdayFastDayState;
  isMenstruating?: boolean;
  isPlanned?: boolean;
};

export function MondayThursdayFastDayRing({
  size,
  state,
  isMenstruating = false,
  isPlanned = false,
}: Props) {
  const visual = getRingVisual(state, isMenstruating, isPlanned);
  const borderWidth = 1.5;
  const wrapperStyle = [
    styles.wrapper,
    { width: size + 4, height: size + 4 },
  ];

  if (visual.variant === "skipped") {
    return (
      <View style={wrapperStyle}>
        <FontAwesome
          name="warning"
          size={Math.max(size * 0.72, 12)}
          color={Colors.light.yellow}
        />
      </View>
    );
  }

  if (visual.variant === "menstruatingPlanned") {
    // Solid red + white horizontal bar (planned Mon/Thu + menstruating).
    const fillSize = size * 0.88;
    const barWidth = fillSize * 0.48;
    const barHeight = Math.max(2, fillSize * 0.12);
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
            backgroundColor: Colors.light.red,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: Colors.light.white,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "menstruatingUnplanned") {
    // Solid red + small white center dot (not a planned Mon/Thu).
    const fillSize = size * 0.78;
    const dotSize = Math.max(3, fillSize * 0.22);
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
            backgroundColor: Colors.light.red,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: Colors.light.white,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "solid") {
    const fillSize = Math.min(size * (visual.scale ?? 1), size);
    // Prefer ~18px solid when the column ring is larger (Figma completed size).
    const capped =
      state === "completed" ? Math.min(fillSize, 18) : fillSize;
    return (
      <View style={[wrapperStyle, { opacity: visual.opacity }]}>
        <View
          style={{
            width: capped,
            height: capped,
            borderRadius: capped / 2,
            backgroundColor: visual.color,
          }}
        />
      </View>
    );
  }

  return (
    <View style={[wrapperStyle, { opacity: visual.opacity }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: visual.color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
