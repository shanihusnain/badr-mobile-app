import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";
import type { WhiteDaysFastDayState } from "@/src/screens/private/goalprogressloggingscreen/whiteDaysFastsWeeklyData";

/** Same as prayer `ringInnerFuture` — upcoming empty day outline. */
const PRAYER_FUTURE_OUTLINE = {
  color: "rgba(255, 255, 255, 0.32)",
  borderWidth: 1,
} as const;

type RingVisual =
  | {
      variant: "outline";
      color: string;
      showWarning?: boolean;
      borderWidth?: number;
    }
  | {
      variant: "solid";
      color: string;
      /** Slightly smaller than outline diameter (design). */
      scale?: number;
    }
  | {
      variant: "solidWithBorder";
      fillColor: string;
      borderColor: string;
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


function getRingVisual(
  state: WhiteDaysFastDayState,
  isMenstruating: boolean,
  isWhiteDay: boolean,
  isToday: boolean,
  isFuture: boolean,
): RingVisual {
  if (isMenstruating && state !== "completed") {
    if (isWhiteDay) {
      return { variant: "menstruatingPlanned" };
    }
    return { variant: "menstruatingUnplanned", scale: 0.78 };
  }

  switch (state) {
    case "todayDisabled":
      // Match the other fasting dashboards: selected empty today uses a
      // soft grey fill with a subtle white ring border.
      return {
        variant: "solidWithBorder",
        fillColor: Colors.light.greybuttonBackground,
        borderColor: "rgba(255, 255, 255, 0.32)",
      };
    case "inactive":
      // Upcoming non–White Day — match prayer future outline.
      // Past non–White Day — solid muted grey.
      if (isFuture) {
        return {
          variant: "outline",
          color: PRAYER_FUTURE_OUTLINE.color,
          borderWidth: PRAYER_FUTURE_OUTLINE.borderWidth,
        };
      }
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.92,
      };
    case "planned":
      return { variant: "outline", color: Colors.light.white };
    case "plannedToday":
      // Actual today uses the selected empty-day style; future dates stay as
      // the standard outline ring used by the other goals.
      return isFuture
        ? { variant: "outline", color: Colors.light.white }
        : {
            variant: "solidWithBorder",
            fillColor: Colors.light.greybuttonBackground,
            borderColor: "rgba(255, 255, 255, 0.32)",
          };
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
      return {
        variant: "solid",
        color: Colors.light.selectcategory,
        scale: 0.92,
      };
  }
}

type Props = {
  size: number;
  state: WhiteDaysFastDayState;
  isMenstruating?: boolean;
  isWhiteDay?: boolean;
  isToday?: boolean;
  isFuture?: boolean;
};

export function WhiteDaysFastDayRing({
  size,
  state,
  isMenstruating = false,
  isWhiteDay = false,
  isToday = false,
  isFuture = false,
}: Props) {
  const visual = getRingVisual(
    state,
    isMenstruating,
    isWhiteDay,
    isToday,
    isFuture,
  );
  const borderWidth = 1.5;
  const outlineBorderWidth =
    visual.variant === "outline" && visual.borderWidth != null
      ? visual.borderWidth
      : borderWidth;
  const wrapperStyle = [styles.wrapper, { width: size + 4, height: size + 4 }];

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

  if (visual.variant === "solidWithBorder") {
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
            borderWidth: outlineBorderWidth,
            borderColor: visual.color,
          },
        ]}
      >
        {visual.showWarning ? (
          <FontAwesome
            name="warning"
            size={Math.max(size * 0.5, 9)}
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
