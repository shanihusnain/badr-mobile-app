import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const HouseWithHeartIcon = ({
  color = Colors.light.white,
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    {/* Outline-only house and heart (transparent inside). */}
    <Path
      stroke={color}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.2 16.6V7.6L9 1.4l6.8 6.2v9M1 16.6h16"
    />
    <Path
      stroke={color}
      strokeWidth={1}
      strokeLinejoin="round"
      d="M9 14.6C6 13 5.2 11.3 5.2 10.2c0-1 .7-1.7 1.6-1.7.9 0 1.6.6 2.2 1.4.6-.8 1.3-1.4 2.2-1.4.9 0 1.6.7 1.6 1.7 0 1.1-.8 2.8-3.8 4.4Z"
    />
  </Svg>
);
