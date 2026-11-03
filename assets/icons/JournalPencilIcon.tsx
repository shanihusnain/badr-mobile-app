import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const SvgComponent = ({
  color = Colors.light.white,
  size = 23,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    preserveAspectRatio="xMidYMid meet"
  >
    <Path
      d="M3 17.3L13.7 6.6L17.4 10.3L6.7 21H3V17.3ZM14.9 3.9L17.1 6.1L18.9 4.3C19.2 4 19.7 4 20 4.3L19.7 4.6L19.9 4.8L20.6 5.5C20.9 5.8 20.9 6.3 20.6 6.6L19.3 7.9L17.3 5.9L14.9 3.9Z"
      fill={color}
    />
    <Path
      d="M3 17.3L6.7 21H3V17.3Z"
      fill={color}
      opacity={0.85}
    />
    <Path
      d="M14.9 3.9L17.4 6.4L20.6 3.2L18.1 0.7L14.9 3.9Z"
      fill={color}
      opacity={0.85}
    />
  </Svg>
);

