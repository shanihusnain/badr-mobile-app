import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { MondayThursdayFastDayState } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";

type RingVisual =
  | { variant: "outline"; color: string; opacity?: number }
  | { variant: "solid"; color: string; scale?: number; opacity?: number }
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
    // #10/#11 planned menstruating: full solid red
    // #12 today unplanned menstruating: also full solid red (on today chip)
    // #13 past unplanned menstruating: smaller solid red
    if (isPlanned || isToday) {
      return { variant: "menstruatingPlanned" };
    }
    return { variant: "menstruatingUnplanned" };
  }

  switch (state) {
    case "future":
      // #1
      return { variant: "outline", color: Colors.light.graylightshade };
    case "today":
      // #2
      return { variant: "outline", color: Colors.light.graylightshade };
    case "todayDisabled":
      // #3
      return {
        variant: "outline",
        color: Colors.light.graylightshade,
        opacity: 0.55,
      };
    case "disabledPast":
      // #4
      return {
        variant: "outline",
        color: Colors.light.graylightshade,
        opacity: 0.35,
      };
    case "pastNeutral":
      // #14 — grey day (small solid)
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.88,
      };
    case "planned":
    case "plannedToday":
      // #5 / #6
      return { variant: "outline", color: Colors.light.seagreen };
    case "completed":
      // #7 / #8
      return { variant: "completed" };
    case "missed":
      // #9
      return { variant: "skippedWarning" };
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
    // #9 — yellow outline with warning centered
    return (
      <View style={[wrapperStyle, {}]}>
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
            size={Math.max(size * 0.4, 9)}
            color={Colors.light.yellow}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "menstruatingPlanned") {
    // #10 / #11 — solid red disc
    const fillSize = size * 0.88;
    return (
      <View
        style={[
          wrapperStyle,
          {
            borderWidth: 1,
            borderColor: Colors.light.seagreen,
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
    // #12 / #13 — smaller solid red disc
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

  if (visual.variant === "completed") {
    // #7 logged today / #8 logged past — solid seagreen disc inside matching ring
    // (same icon for both; today chip + white label vs muted label are handled outside)
    const fillSize = size * 0.62;
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
          <View
            style={{
              width: fillSize,
              height: fillSize,
              borderRadius: fillSize / 2,
              backgroundColor: Colors.light.seagreen,
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
