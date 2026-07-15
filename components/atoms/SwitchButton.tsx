import { Colors } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

// ── Types ─────────────────────────────────────────────────────────────────────

type SwitchSize = "default" | "small";

interface SwitchProps {
  value: SharedValue<boolean>;
  onPress: () => void;
  style?: object;
  duration?: number;
  trackColors?: { on: string; off: string };
  thumbColors?: { on: string; off: string };
  size?: SwitchSize;
}

const SWITCH_DIMENSIONS: Record<
  SwitchSize,
  { trackWidth: number; trackHeight: number; thumbSize: number }
> = {
  default: { trackWidth: 50, trackHeight: 20, thumbSize: 28 },
  small: { trackWidth: 38, trackHeight: 14, thumbSize: 20 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const SwitchButton = ({
  value,
  onPress,
  style,
  duration = 300,
  trackColors = {
    on: Colors.light.green,
    off: Colors.light.unselectedSwtchTrack,
  },
  thumbColors = {
    on: Colors.light.white,
    off: Colors.light.white,
  },
  size = "default",
}: SwitchProps) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { trackWidth, trackHeight, thumbSize } = SWITCH_DIMENSIONS[size];
  const thumbOffset = (thumbSize - trackHeight) / 2;
  const travel = trackWidth - thumbSize;

  // Smooth 0 → 1 progress driven by the boolean shared value
  const progress = useDerivedValue(() =>
    withTiming(value.value ? 1 : 0, { duration }),
  );

  const trackAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [trackColors.off, trackColors.on],
    ),
  }));

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    // In RTL, the track's default layout places the thumb on the physical right (start).
    // A negative translateX moves it to the left (ON state).
    const translateAmount = isRtl ? -travel : travel;
    return {
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, translateAmount]) },
      ],
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [thumbColors.off, thumbColors.on],
      ),
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
          },
          style,
          trackAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              top: -thumbOffset,
            },
            thumbAnimatedStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  track: {
    justifyContent: "center",
    overflow: "visible",
  },
  thumb: {
    position: "absolute",
    shadowColor: Colors.light.blackBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
