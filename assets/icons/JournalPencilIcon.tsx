import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const SvgComponent = ({
  color = Colors.light.white,
  size = 23,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
  >
    <Path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a.996.996 0 0 0 0-1.41l-2.51-2.51a.996.996 0 0 0-1.41 0l-1.96 1.96 3.75 3.75 2.13-1.79Z"
      fill={color}
    />
  </Svg>
);

