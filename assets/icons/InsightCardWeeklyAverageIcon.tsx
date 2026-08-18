import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const InsightCardWeeklyAverageIcon = ({
  color = Colors.light.subtext,
    size = 24,

}:{ color?: string;
    size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
  >
    <Path
      fill={color}
      d="M18 6.076V8.09H0V4.06h18v2.015ZM10.54 11.1c.82 1.643 1.491 3 1.491 3.014 0 .02-1.026.029-3.014.029H6.003l1.505-3.015a246.63 246.63 0 0 1 1.523-3.014c.009 0 .686 1.343 1.509 2.986Z"
    />
  </Svg>
)

