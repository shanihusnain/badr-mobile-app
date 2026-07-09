import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const ServiceIcon = ({
  color = Colors.light.subtext,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg 
  width={size} 
  height={size} 
  fill="none">
    <Path
      fill={color}
      stroke={color}
      strokeWidth={0.5}
      d="M12 3.25A9.75 9.75 0 0 1 21.75 13v7a.75.75 0 0 1-.75.75h-3A2.75 2.75 0 0 1 15.25 18v-2A2.75 2.75 0 0 1 18 13.25h2.25V13a8.25 8.25 0 1 0-16.5 0v.25H6A2.75 2.75 0 0 1 8.75 16v2A2.75 2.75 0 0 1 6 20.75H3a.75.75 0 0 1-.75-.75v-7A9.75 9.75 0 0 1 12 3.25Zm-8.25 16H6A1.25 1.25 0 0 0 7.25 18v-2A1.25 1.25 0 0 0 6 14.75H3.75v4.5ZM18 14.75A1.25 1.25 0 0 0 16.75 16v2A1.25 1.25 0 0 0 18 19.25h2.25v-4.5H18Z"
    />
  </Svg>
)
