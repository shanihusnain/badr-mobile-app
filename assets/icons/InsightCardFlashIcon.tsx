import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const InsightCardFlashIcon = ({
color = Colors.light.subtext, size = 18 }: { color?: string; size?: number }) => (


  <Svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
  >
    <G clipPath="url(#insight-card-flash)">
      <Path
        fill={color}
        stroke={color}
        strokeWidth={0.437}
        d="M2.992 19.219c.08.003.134-.04.139-.043l.028-.026a.45.45 0 0 0 .01-.011l.003-.002v-.002l.003-.002.005-.007.02-.025.075-.096.291-.368 1.063-1.35 3.487-4.426 4.933-6.264.277-.352-.447-.003-1.191-.006a76.217 76.217 0 0 1-.855-.007l.013-.027.377-.802 1.234-2.608L13.685.188l.375-.793.102-.217.027-.058.007-.016.006-.013.004-.009.004-.013a.413.413 0 0 0 .009-.06.383.383 0 0 0-.07-.16.389.389 0 0 0-.057-.038.256.256 0 0 0-.042-.016l-.026-.004-.014-.001h-.017l-.042-.002h-.15a548.895 548.895 0 0 0-2.349-.006H8.765l-.059.124-2.622 5.54v.001L3.463 9.99l-.147.31.342.002 1.365.01 1.048.01-1.562 4.096-1.5 3.93a50.395 50.395 0 0 0-.217.585l-.006.023a.223.223 0 0 0-.004.027c0 .008-.003.041.009.082a.22.22 0 0 0 .201.155ZM13.798-1.075l-.005.012v-.002l.005-.01Z"
      />
    </G>
    <Defs>
      <ClipPath id="insight-card-flash">
        <Path fill="#fff" d="M18 0H0v18h18z" />
      </ClipPath>
    </Defs>
  </Svg>
)

