import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const TutorialClockIcon = ({
  color = Colors.light.white,
  size = 14,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Circle cx="7" cy="7" r="5.25" stroke={color} strokeWidth="1.2" />
    <Path
      d="M7 4.25V7L9 8.25"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
