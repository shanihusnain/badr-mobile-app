import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const SvgComponent = ({ color = Colors.light.white, size = 18 }: { color?: string; size?: number }) => (
  <Svg
   
    width={size}
    height={size}
    viewBox="0 0 17.824 16.71"
    fill="none"
  
  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="m8.51 4.477 6.157 5.877v5.597H2.354v-5.597l6.157-5.877ZM8.513 0l8.674 8.309-1.632 1.562-7.042-6.745-7.044 6.745-1.632-1.563L8.512 0Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h17.824v16.71H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

