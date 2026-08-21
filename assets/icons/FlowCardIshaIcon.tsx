import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const FlowCardIshaIcon = ({ color = Colors.light.white, size = 20, ...props }: { color?: string; size?: number }) => (
  <Svg
 
    width={size}
    height={size}
    fill="none"

  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        d="M6.609.7a4.72 4.72 0 0 0-1.48 3.764 4.536 4.536 0 0 0 1.236 2.891 4.598 4.598 0 0 0 3.451 1.53 4.7 4.7 0 0 0 3.487-1.479A6.306 6.306 0 1 1 6.61.7Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h14v14H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

