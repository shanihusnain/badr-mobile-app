import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { ProphetDawoodFastDayState } from "@/src/screens/private/goalprogressloggingscreen/prophetDawoodFastsWeeklyData";

type RingVisual = {
  variant: "outline" | "solid";
  borderColor: string;
  backgroundColor: string;
  opacity?: number;
  showWarning?: boolean;
};

function getRingVisual(state: ProphetDawoodFastDayState): RingVisual {
  switch (state) {
    case "inactive":
      return {
        variant: "outline",
        borderColor: Colors.light.grey,
        backgroundColor: "transparent",
      };
    case "upcoming":
      return {
        variant: "outline",
        borderColor: Colors.light.ringDawood,
        backgroundColor: "transparent",
      };
    case "today":
    case "completed":
      return {
        variant: "solid",
        borderColor: Colors.light.ringDawood,
        backgroundColor: Colors.light.ringDawood,
      };
    case "todayDisabled":
      return {
        variant: "outline",
        borderColor: Colors.light.grey,
        backgroundColor: "transparent",
        opacity: 0.45,
      };
    case "missed":
      return {
        variant: "outline",
        borderColor: Colors.light.ringDawood,
        backgroundColor: "transparent",
        showWarning: true,
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
};

export function ProphetDawoodFastDayRing({ size, state }: Props) {
  const visual = getRingVisual(state);
  const borderWidth = 1.5;

  if (visual.variant === "solid") {
    return (
      <View
        style={[
          styles.wrapper,
          { width: size + 4, height: size + 4, opacity: visual.opacity },
        ]}
      >
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

  return (
    <View
      style={[
        styles.wrapper,
        { width: size + 4, height: size + 4, opacity: visual.opacity },
      ]}
    >
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
