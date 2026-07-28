import * as React from "react"
import Svg, { Circle, Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const TimeSpentMoreTabDashboardIcon = ({
  color = Colors.light.subtext,
  size = 24,
}: {
  color?: string
  size?: number
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <Path
      d="M12 12V8.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M12 12L15.2 14.4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path d="M12 2.5V4.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M12 19.7V21.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M2.5 12H4.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M19.7 12H21.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M5.4 5.4L6.6 6.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M17.4 17.4L18.6 18.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M5.4 18.6L6.6 17.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M17.4 6.6L18.6 5.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
)
