import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

type LeaderboardToggleRowProps = {
  label: string;
  enabled: boolean;
  canEnable?: boolean;
  onToggle: () => void;
};

const TRACK_WIDTH = 38;
const TRACK_HEIGHT = 14;
const THUMB_SIZE = 20;

export function LeaderboardToggleRow({
  label,
  enabled,
  canEnable = true,
  onToggle,
}: LeaderboardToggleRowProps) {
  const progress = useSharedValue(enabled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(enabled ? 1 : 0, { duration: 200 });
  }, [enabled, progress]);

  const handlePress = () => {
    if (!enabled && !canEnable) return;
    onToggle();
  };

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.light.unselectedSwtchTrack, Colors.light.green],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [0, TRACK_WIDTH - THUMB_SIZE],
        ),
      },
    ],
  }));

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.switchHitArea} pointerEvents="none">
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.darkgrey,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  label: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 13,
    textTransform: "uppercase",
  },
  switchHitArea: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.light.white,
    top: -(THUMB_SIZE - TRACK_HEIGHT) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
