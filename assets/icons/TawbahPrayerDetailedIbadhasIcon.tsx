import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const TawbahPrayerDetailedIbadhasIcon = ({ color = Colors.light.white, size = 20 }: { color?: string; size?: number }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
  >
    <Path
      fill={color}
      d="M14.191 2c-1.799 0-3.367.987-4.191 2.447A4.808 4.808 0 0 0 5.808 2 4.803 4.803 0 0 0 1 6.798C1 12.999 7.021 17.413 10 18c2.979-.587 9-5 9-11.202A4.804 4.804 0 0 0 14.191 2Zm2.418 5.66a.412.412 0 0 1-.292.705.412.412 0 0 1-.292-.121l-1.362-1.358-1.36 1.358a.413.413 0 0 1-.586-.583l1.362-1.359-1.362-1.358a.414.414 0 0 1 .585-.583l1.361 1.358 1.361-1.358a.414.414 0 0 1 .585.583l-1.361 1.358 1.361 1.359Z"
    />
  </Svg>
)

