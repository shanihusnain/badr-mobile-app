import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { ProphetDawoodFastDayState } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";

type RingVisual = {
  variant: "outline" | "solid" | "menstruating";
  borderColor: string;
  backgroundColor: string;
  opacity?: number;
  showWarning?: boolean;
  blur?: boolean;
};

function getRingVisual(
  state: ProphetDawoodFastDayState,
  isMenstruating: boolean,
): RingVisual {
  // Menstruating overrides fill: blue ring + red inner (planned or not).
  if (isMenstruating && state !== "goalAchieved") {
    return {
      variant: "menstruating",
      borderColor: Colors.light.ringDawood,
      backgroundColor: Colors.light.red,
    };
  }

  switch (state) {
    case "future":
      return {
        variant: "outline",
        borderColor: Colors.light.grey,
        backgroundColor: "transparent",
      };
    case "today":
    case "todayDisabled":
      return {
        variant: "outline",
        borderColor: Colors.light.grey,
        backgroundColor: "transparent",
      };
    case "pastNeutral":
      return {
        variant: "solid",
        borderColor: "rgba(255, 255, 255, 0.18)",
        backgroundColor: "rgba(255, 255, 255, 0.18)",
      };
    case "planned":
    case "plannedToday":
      return {
        variant: "outline",
        borderColor: Colors.light.ringDawood,
        backgroundColor: "transparent",
      };
    case "completed":
      return {
        variant: "solid",
        borderColor: Colors.light.ringDawood,
        backgroundColor: Colors.light.ringDawood,
      };
    case "missed":
      return {
        variant: "outline",
        borderColor: Colors.light.ringDawood,
        backgroundColor: "transparent",
        showWarning: true,
      };
    case "goalAchieved":
      return {
        variant: "outline",
        borderColor: Colors.light.calendarBg,
        backgroundColor: "transparent",
        opacity: 0.35,
        blur: true,
      };
    default:
      return {
        variant: "outline",
        borderColor: Colors.light.grey,
        backgroundColor: "transparent",
      };
  }
}

type Props = {
  size: number;
  state: ProphetDawoodFastDayState;
  isMenstruating?: boolean;
};

export function ProphetDawoodFastDayRing({
  size,
  state,
  isMenstruating = false,
}: Props) {
  const visual = getRingVisual(state, isMenstruating);
  const borderWidth = 1.5;
  const wrapperStyle = [
    styles.wrapper,
    {
      width: size + 4,
      height: size + 4,
      opacity: visual.opacity,
    },
  ];

  if (visual.variant === "solid") {
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: visual.backgroundColor,
            borderWidth,
            borderColor: visual.borderColor,
          }}
        />
      </View>
    );
  }

  if (visual.variant === "menstruating") {
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
              backgroundColor: visual.backgroundColor,
            }}
          />
        </View>
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
            borderColor: visual.borderColor,
            backgroundColor: visual.backgroundColor,
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
