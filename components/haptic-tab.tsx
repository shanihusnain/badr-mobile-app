import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";

export function HapticTab({
  style,
  children,
  onPressIn,
  ...rest
}: BottomTabBarButtonProps) {
  // React Navigation passes focused via aria-selected (not accessibilityState).
  const focused = Boolean(rest["aria-selected"]);

  return (
    <PlatformPressable
      {...rest}
      style={[style, styles.button]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      {focused ? (
        <View style={styles.activeBarTrack} pointerEvents="none">
          <View style={styles.activeBar} />
        </View>
      ) : null}
      {children}
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: "visible",
  },
  activeBarTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  activeBar: {
    width: 21,
    height: 2,
    borderRadius: 19,
    backgroundColor: Colors.light.green,
  },
});
