import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { MondayThursdayFastDayState } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsWeeklyData";

type RingVisual = {
  variant: "outline" | "solid";
  color: string;
  opacity?: number;
  showWarning?: boolean;
};

function getRingVisual(state: MondayThursdayFastDayState): RingVisual {
  switch (state) {
    case "inactive":
      return { variant: "outline", color: Colors.light.graylightshade };
    case "today":
      return { variant: "outline", color: Colors.light.white };
    case "todayDisabled":
      return { variant: "outline", color: Colors.light.grey, opacity: 0.45 };
    case "planned":
      return { variant: "outline", color: Colors.light.green };
    case "missed":
      return {
        variant: "outline",
        color: Colors.light.green,
        showWarning: true,
      };
    case "completed":
      return { variant: "solid", color: Colors.light.green };
    case "goalAchieved":
      return {
        variant: "outline",
        color: Colors.light.calendarBg,
        opacity: 0.55,
      };
    default:
      return { variant: "outline", color: Colors.light.dullWhiteOpacity };
  }
}

type Props = {
  size: number;
  state: MondayThursdayFastDayState;
};

export function MondayThursdayFastDayRing({ size, state }: Props) {
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
            backgroundColor: visual.color,
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size + 4,
          height: size + 4,
          opacity: visual.opacity,
        },
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
