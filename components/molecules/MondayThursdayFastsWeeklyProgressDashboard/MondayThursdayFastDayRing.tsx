import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { MondayThursdayFastDayState } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";

type RingVisual =
  | { variant: "outline"; color: string; opacity?: number }
  | { variant: "solid"; color: string; scale?: number; opacity?: number }
  | {
    variant: "outlineWithFill";
    borderColor: string;
    fillColor: string;
    fillScale: number;
  }
  /** Solid disc + border on the same view (today / today-disabled). */
  | {
    variant: "solidWithBorder";
    fillColor: string;
    borderColor: string;
  }
  | { variant: "completed" }
  | { variant: "skippedWarning" }
  | { variant: "menstruatingPlanned" }
  | { variant: "menstruatingUnplanned" };

/**
 * Mon & Thu Fasts day rings — Figma 17 states.
 * Seagreen for planned/completed; yellow skip; red menstruating.
 */
function getRingVisual(
  state: MondayThursdayFastDayState,
  isMenstruating: boolean,
  isPlanned: boolean,
  isToday: boolean,
): RingVisual {
  if (isMenstruating && state !== "completed" && state !== "goalAchieved") {
    if (isPlanned || isToday) {
      return { variant: "menstruatingPlanned" };
    }
    return { variant: "menstruatingUnplanned" };
  }

  switch (state) {
    case "future":
      // #1 — calendarBg outline
      return { variant: "outline", color: Colors.light.calendarBg };
    case "today":
    case "todayDisabled":
      // #2 / #3 — same look: solid dark disc + thin light border (Figma Today /
      // Today Disable Day). Fill matches dashboard card behind the today chip.
      return {
        variant: "solidWithBorder",
        fillColor: Colors.light.greybuttonBackground,
        borderColor: "rgba(255, 255, 255, 0.32)",
      };
    case "disabledPast":
      // #4 — ringRamadan (#B7977E) at 60% opacity
      return {
        variant: "outline",
        color: Colors.light.ringRamadan,
        opacity: 0.6,
      };
    case "pastNeutral":
      // #14 — solid grey only (Figma grey day / no activity — no border)
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.92,
      };
    case "planned":
    case "plannedToday":
      // #5 / #6 — empty seagreen ring (fills only after user logs → completed)
      return { variant: "outline", color: Colors.light.seagreen };
    case "completed":
      // #7 / #8 — seagreen ring + solid mid fill
      return { variant: "completed" };
    case "missed":
      return { variant: "skippedWarning" };
    case "goalAchieved":
      return {
        variant: "outline",
        color: Colors.light.calendarBg,
        opacity: 0.35,
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
  isToday?: boolean;
};

export function MondayThursdayFastDayRing({
  size,
  state,
  isMenstruating = false,
  isPlanned = false,
  isToday = false,
}: Props) {
  const visual = getRingVisual(state, isMenstruating, isPlanned, isToday);
  const borderWidth = 1.5;
  const wrapperStyle = [styles.wrapper, { width: size + 4, height: size + 4 }];

  if (visual.variant === "skippedWarning") {
    return (
      <View style={wrapperStyle}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor: Colors.light.seagreen,
            },
          ]}
        >
          <FontAwesome
            name="warning"
            size={Math.max(size * 0.5, 9)}
            color={Colors.light.yellow}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "menstruatingPlanned") {
    const fillSize = size * 0.88;
    return (
      <View
        style={[
          wrapperStyle,
          {
            borderWidth: 1,
            borderColor: Colors.light.seagreen,
            borderRadius: (size + 4) / 2,
          },
        ]}
      >
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
            backgroundColor: Colors.light.red,
          }}
        />
      </View>
    );
  }

  if (visual.variant === "menstruatingUnplanned") {
    const fillSize = size * 0.58;
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
            backgroundColor: Colors.light.red,
          }}
        />
      </View>
    );
  }

  if (visual.variant === "solidWithBorder") {
    // One view — fill + border; matches Figma today / today-disabled.
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: visual.fillColor,
            borderWidth,
            borderColor: visual.borderColor,
          }}
        />
      </View>
    );
  }

  if (visual.variant === "completed" || visual.variant === "outlineWithFill") {
    // Nested fill inside bordered ring — RN centers in the padding box.
    const borderColor =
      visual.variant === "completed"
        ? Colors.light.seagreen
        : visual.borderColor;
    const fillColor =
      visual.variant === "completed" ? Colors.light.seagreen : visual.fillColor;
    const innerSize = size - borderWidth * 2;
    const fillScale =
      visual.variant === "completed" ? 0.85 : visual.fillScale;
    const fillSize = Math.max(innerSize * fillScale, 1);

    return (
      <View style={wrapperStyle}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor,
            },
          ]}
        >
          <View
            style={{
              width: fillSize,
              height: fillSize,
              borderRadius: fillSize / 2,
              backgroundColor: fillColor,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "solid") {
    const fillSize = size * (visual.scale ?? 1);
    return (
      <View style={[wrapperStyle, { opacity: visual.opacity }]}>
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
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
