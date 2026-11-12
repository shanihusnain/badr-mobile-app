import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { MissedRamadanFastDayState } from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsWeeklyData";

/** Same as prayer `ringInnerFuture` — upcoming empty day outline. */
const PRAYER_FUTURE_OUTLINE = {
  color: "rgba(255, 255, 255, 0.32)",
  borderWidth: 1,
} as const;

type RingVisual =
  | {
      variant: "outline";
      color: string;
      opacity?: number;
      borderWidth?: number;
    }
  | { variant: "solid"; color: string; scale?: number; opacity?: number }
  /** Solid disc + border on the same view (booked for another goal). */
  | {
      variant: "solidWithBorder";
      fillColor: string;
      borderColor: string;
    }
  /** Logged planned fast — solid ringRamadan fill inside matching outline */
  | { variant: "completedWithOutline"; color: string }
  /** #9 — MISSED: grey outline + yellow warning inside */
  | { variant: "skippedWarning" }
  /** #10 / #11 — EXCUSED planned menstruating: solid red + grey outline */
  | { variant: "menstruatingPlanned" }
  /** #12 / #13 — unplanned menstruating: smaller solid red, no outline */
  | { variant: "menstruatingUnplanned" };

/**
 * Missed Ramadan Fasts day rings — Figma 7-day card (17 states).
 */
function getRingVisual(
  state: MissedRamadanFastDayState,
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
      // Match prayer upcoming empty ring (thin translucent white outline).
      return {
        variant: "outline",
        color: PRAYER_FUTURE_OUTLINE.color,
        borderWidth: PRAYER_FUTURE_OUTLINE.borderWidth,
      };
    case "disabledPast":
    case "todayDisabled":
    case "pastNeutral":
      // Match the other goal dashboards: selected empty today / disabled day is a
      // grey disc with a light border, not a solid filled circle.
      return {
        variant: "solidWithBorder",
        fillColor: Colors.light.greybuttonBackground,
        borderColor: "rgba(255, 255, 255, 0.32)",
      };
    case "plannedToday":
      // Planned today — grey disc inside Ramadan accent ring border.
      return {
        variant: "solidWithBorder",
        fillColor: Colors.light.greybuttonBackground,
        borderColor: Colors.light.ringRamadan,
      };
    case "today":
      // Plain today — grey disc; accent border only if frame marks planned.
      return {
        variant: "solidWithBorder",
        fillColor: Colors.light.greybuttonBackground,
        borderColor: isPlanned
          ? Colors.light.ringRamadan
          : Colors.light.grey,
      };
    case "planned":
      // #5 — empty ringRamadan (#B7977E) outline
      return { variant: "outline", color: Colors.light.ringRamadan };
    case "plannedSkipped":
      // #9
      return { variant: "skippedWarning" };
    case "completed":
      // Logged planned fast — tan fill + matching ring outline
      return {
        variant: "completedWithOutline",
        color: Colors.light.ringRamadan,
      };
    case "goalAchieved":
      // #15
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
  state: MissedRamadanFastDayState;
  isMenstruating?: boolean;
  isPlanned?: boolean;
};

export function MissedRamadanFastDayRing({
  size,
  state,
  isMenstruating = false,
  isPlanned = false,
}: Props) {
  const visual = getRingVisual(state, isMenstruating, isPlanned);
  const borderWidth = 1.5;
  const outlineBorderWidth =
    visual.variant === "outline" && visual.borderWidth != null
      ? visual.borderWidth
      : borderWidth;
  const wrapperStyle = [styles.wrapper, { width: size + 4, height: size + 4 }];

  if (visual.variant === "skippedWarning") {
    // #9 — grey outline with yellow warning centered
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
              // #9 skipped — same ringRamadan as planned days (Fri/Sat/Sun)
              borderColor: Colors.light.ringRamadan,
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
    // #10 / #11 — solid red fill inside grey outline
    const fillSize = size * 0.78;
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
              borderColor: Colors.light.graylightshade,
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
      </View>
    );
  }

  if (visual.variant === "menstruatingUnplanned") {
    // #12 / #13 — smaller solid red disc, no outline
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
    // Outer bordered ring + inner fill so accent borders stay crisp
    // (same-view fill+border often washes out ringRamadan on dark fills).
    const innerSize = Math.max(size - borderWidth * 2, size * 0.72);
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
              borderColor: visual.borderColor,
              backgroundColor: "transparent",
            },
          ]}
        >
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: visual.fillColor,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "completedWithOutline") {
    const innerSize = size - borderWidth * 2;
    const fillSize = Math.max(innerSize * 0.85, 1);
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
              borderColor: visual.color,
            },
          ]}
        >
          <View
            style={{
              width: fillSize,
              height: fillSize,
              borderRadius: fillSize / 2,
              backgroundColor: visual.color,
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
            borderWidth: outlineBorderWidth,
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
