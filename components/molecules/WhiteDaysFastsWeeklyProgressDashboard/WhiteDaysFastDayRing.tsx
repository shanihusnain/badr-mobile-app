import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { WhiteDaysFastDayState } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";

type RingVisual =
  | {
      variant: "outline";
      color: string;
      showWarning?: boolean;
    }
  | {
      variant: "solid";
      color: string;
      /** Slightly smaller than outline diameter (design). */
      scale?: number;
    }
  | {
      /** Today completed: white ring + smaller white fill */
      variant: "completedToday";
    }
  | {
      /** Planned White Day + menstruating (today or past): white ring + red fill */
      variant: "menstruatingPlanned";
    }
  | {
      /** Non–White Day + menstruating: solid red */
      variant: "menstruatingUnplanned";
      scale?: number;
    }
  | {
      /** Today, not a White Day — filled muted grey */
      variant: "todayDisabled";
    };

function getRingVisual(
  state: WhiteDaysFastDayState,
  isMenstruating: boolean,
  isWhiteDay: boolean,
  isToday: boolean,
): RingVisual {
  if (isMenstruating && state !== "completed") {
    if (isWhiteDay) {
      return { variant: "menstruatingPlanned" };
    }
    return { variant: "menstruatingUnplanned", scale: 0.78 };
  }

  switch (state) {
    case "todayDisabled":
      return { variant: "todayDisabled" };
    case "inactive":
      return { variant: "outline", color: Colors.light.graylightshade };
    case "planned":
    case "plannedToday":
      return { variant: "outline", color: Colors.light.white };
    case "completed":
      // Today completed: white ring + slightly smaller white fill.
      // Past completed: solid white (slightly smaller).
      if (isToday) {
        return { variant: "completedToday" };
      }
      return { variant: "solid", color: Colors.light.white, scale: 0.82 };
    case "missed":
      return {
        variant: "outline",
        color: Colors.light.white,
        showWarning: true,
      };
    default:
      return { variant: "outline", color: Colors.light.graylightshade };
  }
}

type Props = {
  size: number;
  state: WhiteDaysFastDayState;
  isMenstruating?: boolean;
  isWhiteDay?: boolean;
  isToday?: boolean;
};

export function WhiteDaysFastDayRing({
  size,
  state,
  isMenstruating = false,
  isWhiteDay = false,
  isToday = false,
}: Props) {
  const visual = getRingVisual(state, isMenstruating, isWhiteDay, isToday);
  const borderWidth = 1.5;
  const wrapperStyle = [styles.wrapper, { width: size + 4, height: size + 4 }];

  if (visual.variant === "todayDisabled") {
    const fillSize = size * 0.88;
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: fillSize,
            height: fillSize,
            borderRadius: fillSize / 2,
            backgroundColor: Colors.light.selectcategory,
            opacity: 0.85,
          }}
        />
      </View>
    );
  }

  if (visual.variant === "solid") {
    const fillSize = size * (visual.scale ?? 1);
    return (
      <View style={wrapperStyle}>
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

  if (visual.variant === "completedToday") {
    const innerSize = Math.max(size - borderWidth * 2 - 2, size * 0.62);
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
              borderColor: Colors.light.white,
            },
          ]}
        >
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: Colors.light.white,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "menstruatingPlanned") {
    const innerSize = Math.max(size - borderWidth * 2 - 2, size * 0.62);
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
              borderColor: Colors.light.white,
            },
          ]}
        >
          <View
            style={{
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: Colors.light.red,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "menstruatingUnplanned") {
    const fillSize = size * (visual.scale ?? 0.78);
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
        {visual.showWarning ? (
          <FontAwesome
            name="warning"
            size={Math.max(size * 0.42, 8)}
            color={Colors.light.yellow}
          />
        ) : null}
      </View>
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
