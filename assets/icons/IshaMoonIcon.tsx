import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const IshaMoonIcon = ({
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
      d="M13.86 5A10.046 10.046 0 0 0 5 14.957v.001c0 5.538 4.501 10.04 10.04 10.04a10.046 10.046 0 0 0 9.956-8.82.558.558 0 0 0-.861-.534 7.056 7.056 0 0 1-9.783-9.779.558.558 0 0 0-.491-.863Zm-.95 1.338c-.5 1.075-.844 2.217-.845 3.413 0 4.512 3.669 8.18 8.18 8.18 1.198 0 2.34-.344 3.417-.846-.969 3.938-4.475 6.792-8.623 6.796a8.915 8.915 0 0 1-8.924-8.923c.006-4.147 2.86-7.651 6.796-8.62Z"
    />
  </Svg>
)
