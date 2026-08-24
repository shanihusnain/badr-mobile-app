import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const FiveDailyPrayersQadhaIcon = ({ color = Colors.light.white, size = 20, ...props }: { color?: string; size?: number }) => (
  <Svg
   
    width={size}
    height={size}
    fill="none"
  
  >
    <Path fill={color} d="M0 0h20v20H0z" />
  </Svg>
)

