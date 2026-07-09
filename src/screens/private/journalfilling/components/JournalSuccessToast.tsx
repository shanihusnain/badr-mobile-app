import React, { memo, useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

type JournalSuccessToastProps = {
  visible: boolean;
  message: string;
};

function JournalSuccessToastComponent({
  visible,
  message,
}: JournalSuccessToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [message, opacity, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 120,
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 20,
  },
  text: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    textAlign: "center",
  },
});

export const JournalSuccessToast = memo(JournalSuccessToastComponent);
