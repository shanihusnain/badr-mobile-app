import * as React from "react";
import Svg, { G, Path, Circle, Defs, ClipPath } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const MonthlyGoalPlannerPlanIcon = ({
  color = Colors.light.green,
  size = 32,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Rocket body */}
    <Path
      d="M16 3C16 3 10 8 10 16H22C22 8 16 3 16 3Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Rocket window */}
    <Circle
      cx="16"
      cy="13"
      r="2"
      stroke={color}
      strokeWidth={1.5}
    />
    {/* Left fin */}
    <Path
      d="M10 16L7 20H10"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right fin */}
    <Path
      d="M22 16L25 20H22"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Exhaust */}
    <Path
      d="M13 20C13 20 13.5 23 16 24C18.5 23 19 20 19 20"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Moon */}
    <Path
      d="M24 5C24 5 22 6 22 8C22 10 24 11 24 11C26 10 27 8 26 6C25.5 5.2 24 5 24 5Z"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Stars */}
    <Path
      d="M8 6L8.5 7L9 6L8.5 5L8 6Z"
      fill={color}
    />
    <Path
      d="M6 10L6.3 10.7L7 11L6.3 11.3L6 12L5.7 11.3L5 11L5.7 10.7L6 10Z"
      fill={color}
    />
  </Svg>
);
