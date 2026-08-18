import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const InsightCardGoodDayIcon = ({
color = Colors.light.subtext, size = 18 }: { color?: string; size?: number }) => (


  <Svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
  >
    <G clipPath="url(#insight-card-good-day)">
      <Path
        fill={color}
        d="M9 .805A10.002 10.002 0 0 0 17.196 9 10.002 10.002 0 0 0 9 17.196 10.002 10.002 0 0 0 .805 9 10.002 10.002 0 0 0 9 .805Z"
      />
    </G>
    <Defs>
      <ClipPath id="insight-card-good-day">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

