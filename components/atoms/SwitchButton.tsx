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

interface SwitchProps {
  value: SharedValue<boolean>;
  onPress: () => void;
  style?: object;
  duration?: number;
  trackColors?: { on: string; off: string };
}

// ── Dimensions ────────────────────────────────────────────────────────────────

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 20;
const THUMB_SIZE = 28;
const THUMB_OFFSET = (THUMB_SIZE - TRACK_HEIGHT) / 2;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE;

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
}: SwitchProps) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

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
    const translateAmount = isRtl ? -TRAVEL : TRAVEL;
    return {
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, translateAmount]) },
      ],
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.track, style, trackAnimatedStyle]}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </Pressable>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
    // overflow visible so thumb can protrude
    overflow: "visible",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.light.white,
    position: "absolute",
    top: -THUMB_OFFSET,
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
