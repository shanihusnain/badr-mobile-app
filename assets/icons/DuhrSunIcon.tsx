import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const DuhrSunIcon = ({
    color = Colors.light.white,
    size = 20,
  } : {
    color?: string;
    size?: number;
  }) => (

  <Svg
  
    width={size}
    height={size}
    fill="none"

  >
    <Path
      fill={color}
      d="m8.636 20.657-.707.707a.5.5 0 1 0 .707.707l.707-.707a.5.5 0 0 0-.707-.707ZM15 7a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-1 0v1a.5.5 0 0 0 .5.5ZM8.636 9.343a.498.498 0 0 0 .707 0 .5.5 0 0 0 0-.707l-.707-.707a.5.5 0 0 0-.707.707l.707.707ZM6.5 14.5h-1a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1ZM15 23a.5.5 0 0 0-.5.5v1a.5.5 0 1 0 1 0v-1a.5.5 0 0 0-.5-.5Zm0-14a6 6 0 0 0 0 12 6.007 6.007 0 0 0 6-6 6 6 0 0 0-6-6Zm0 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm9.5-5.5h-1a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1Zm-3.136-6.571-.707.707a.5.5 0 0 0 .707.707l.707-.707.007-.007a.5.5 0 0 0-.714-.7Zm0 12.728a.5.5 0 0 0-.707.707l.707.707a.498.498 0 0 0 .707 0 .5.5 0 0 0 0-.707l-.707-.707Z"
    />
  </Svg>
)

