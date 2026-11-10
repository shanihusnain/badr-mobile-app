import { Colors } from "@/constants/theme";
import type { TeamTypingUser } from "@/src/realtime/useTeamTyping";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200";

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

type TypingBubbleProps = {
  users: TeamTypingUser[];
};

export function TypingBubble({ users }: TypingBubbleProps) {
  if (!users.length) return null;

  const primary = users[0];
  const avatarUri = primary.avatarUrl?.trim() || FALLBACK_AVATAR;

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: avatarUri }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
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
    gap: 5,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 58,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
});
