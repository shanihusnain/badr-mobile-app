import React, { memo, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/theme";

type JournalFillingTopGradientProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

function JournalFillingTopGradientComponent({
  children,
  style,
}: JournalFillingTopGradientProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[
          Colors.light.journalFillingGradientGlow,
          Colors.light.journalFillingGradientGlow,
          Colors.light.blackBackground,
        ]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          Colors.light.blackBackground,
          "transparent",
          Colors.light.blackBackground,
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 1, y: 0.3 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", Colors.light.blackBackground]}
        locations={[0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.light.blackBackground,
    overflow: "hidden",
  },
  content: {
    zIndex: 1,
  },
});

export const JournalFillingTopGradient = memo(
  JournalFillingTopGradientComponent,
);
