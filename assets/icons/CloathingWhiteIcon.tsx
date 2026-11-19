import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const SvgComponent = ({ color = Colors.light.white, size = 16 }: { color?: string; size?: number }) => (
  <Svg
 
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
   
  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        d="M5.564.948a.468.468 0 0 0-.125.027l-3.6 1.28a.47.47 0 0 0-.295.313L.02 7.848a.47.47 0 0 0 .452.602h2.64v6.131a.47.47 0 0 0 .47.473h8.837a.47.47 0 0 0 .47-.473V8.45h2.641a.47.47 0 0 0 .452-.601l-1.526-5.281a.47.47 0 0 0-.295-.313l-3.6-1.28a.47.47 0 0 0-.61.316A2.015 2.015 0 0 1 8 2.764a2.016 2.016 0 0 1-1.95-1.473.47.47 0 0 0-.486-.343Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h16v16H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

