import { Colors } from "@/constants/theme";
import type { TeamTypingUser } from "@/src/realtime/useTeamTyping";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200";

/** WhatsApp-style bouncing dot */
function Dot({ delay }: { delay: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -4,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.45,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(120),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.dot, { opacity, transform: [{ translateY }] }]}
    />
  );
}

type TypingBubbleProps = {
  users: TeamTypingUser[];
};

export function TypingBubble({ users }: TypingBubbleProps) {
  if (!users.length) return null;

  const primary = users[0];
  const avatarUri = primary.avatarUrl?.trim() || FALLBACK_AVATAR;

  return (
    <View style={styles.row} accessibilityLabel="Someone is typing">
      <Image
        source={{ uri: avatarUri }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "92%",
    paddingBottom: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.darkgrey,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 58,
    minHeight: 36,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
});
