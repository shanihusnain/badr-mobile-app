import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

interface TaperedCircleBorderProps {
  percentage?: string;
  size?: number;
  borderColor?: string;
  children?: React.ReactNode;
}

export const TaperedCircleBorder: React.FC<TaperedCircleBorderProps> = ({
  percentage,
  size = 70,
  borderColor = Colors.light.calendarBg,
  children,
}) => {
  // Outer circle: cx=40, cy=40, R=35
  // Inner circle: cx=40, cy=38.5 (offset by 1.5 upwards), r=32.5
  // Tapered ring path (clockwise outer, evenodd/counter-clockwise inner)
  // Top thickness: 1px, Bottom thickness: 4px
  const pathD = "M 40,5 a 35,35 0 1,0 0,70 a 35,35 0 1,0 0,-70 M 40,6 a 32.5,32.5 0 1,0 0,65 a 32.5,32.5 0 1,0 0,-65";

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        {/* Tapered Ring Border in the same border color */}
        <Path
          d={pathD}
          fill={borderColor}
          fillRule="evenodd"
        />
      </Svg>

      {/* Percentage Text or Custom Children centered inside */}
      <View style={styles.textContainer} pointerEvents="none">
        {children ? children : <Text style={styles.percentageText}>{percentage}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  percentageText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.bold,
  },
});
