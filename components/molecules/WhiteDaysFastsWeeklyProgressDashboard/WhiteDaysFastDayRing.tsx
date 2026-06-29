import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { WhiteDaysFastDayState } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";

type RingVisual = {
  variant: "outline" | "solid";
  color: string;
  showWarning?: boolean;
};

function getRingVisual(state: WhiteDaysFastDayState): RingVisual {
  switch (state) {
    case "inactive":
      return { variant: "outline", color: Colors.light.graylightshade };
    case "upcoming":
    case "today":
      return { variant: "outline", color: Colors.light.white };
    case "completed":
      return { variant: "solid", color: Colors.light.white };
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
};

export function WhiteDaysFastDayRing({ size, state }: Props) {
  const visual = getRingVisual(state);
  const borderWidth = 1.5;

  if (visual.variant === "solid") {
    return (
      <View style={[styles.wrapper, { width: size + 4, height: size + 4 }]}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: visual.color,
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: size + 4, height: size + 4 }]}>
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
