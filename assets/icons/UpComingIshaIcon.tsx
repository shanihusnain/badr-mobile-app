import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const UpComingIshaIcon = ({ color = Colors.light.white, size = 14 }: { color?: string; size?: number }) => (
  <Svg
    width={size}
    height={size}
    fill="none"
  >
    <Path
      fill={color}
      d="M5.958 0A6.754 6.754 0 0 0 0 6.694a6.756 6.756 0 0 0 6.75 6.75 6.754 6.754 0 0 0 6.694-5.93.375.375 0 0 0-.579-.358A4.744 4.744 0 0 1 6.287.581a.375.375 0 0 0-.33-.58Zm-.64.9c-.336.723-.567 1.49-.568 2.294 0 3.034 2.467 5.5 5.5 5.5.805 0 1.574-.231 2.297-.569-.65 2.648-3.008 4.567-5.797 4.57-3.318 0-6-2.682-6-6C.754 3.907 2.672 1.55 5.319.9Z"
    />
  </Svg>
)

