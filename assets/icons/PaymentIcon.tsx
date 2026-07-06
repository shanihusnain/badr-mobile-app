import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const PaymentIcon = ({
  color = Colors.light.subtext,
  size = 20,
}: {
  color?: string;
  size?: number;
}) => (


  <Svg
    width={size} height={size} fill="none">
    <Path
      fill={color}
      stroke={color}
      strokeWidth={0.5}
      d="M3 .25h14A2.75 2.75 0 0 1 19.75 3v9A2.75 2.75 0 0 1 17 14.75H3A2.75 2.75 0 0 1 .25 12V3A2.75 2.75 0 0 1 3 .25ZM1.75 12A1.25 1.25 0 0 0 3 13.25h14A1.25 1.25 0 0 0 18.25 12V5.75H1.75V12ZM5 8.25h3a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5Zm-2-6.5A1.25 1.25 0 0 0 1.75 3v1.25h16.5V3A1.25 1.25 0 0 0 17 1.75H3Z"
    />
  </Svg>
)

