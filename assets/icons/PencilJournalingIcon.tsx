import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const PencilJournalingIcon = ({
    colors = Colors.light.white,
    size = 30,

} : {
  colors?: string;
  size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 30 30"
    fill="none"
  >
    <Path
      fill={colors}
      d="M6.25 23.75h1.781L20.25 11.531 18.469 9.75 6.25 21.969v1.781Zm-2.5 2.5v-5.313L20.25 4.47c.25-.23.526-.407.829-.532a2.47 2.47 0 0 1 .952-.187c.333 0 .656.063.969.188.313.124.584.312.813.562l1.718 1.75c.25.23.433.5.548.813a2.678 2.678 0 0 1 0 1.89 2.312 2.312 0 0 1-.548.828L9.063 26.25H3.75Zm15.594-15.594-.875-.906 1.781 1.781-.906-.875Z"
    />
  </Svg>
)

