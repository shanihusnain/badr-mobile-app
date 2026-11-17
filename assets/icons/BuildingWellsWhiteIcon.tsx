import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const BuildingWellsWhiteIcon = ({
    color = Colors.light.white,
    size = 14,
  }: {
    color?: string
    size?: number
  }) => (
  <Svg
  
    width={size}
    height={size}
   
  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M12.525 7.995H0v5.847h12.524V7.995Zm-2.31-.543h1.345l.001-5.79h.871l.51 1.447h1.467v-.543h-1.09l-.51-1.448h-1.248V-.096h-1.345v1.213H2.309V-.096H.964v7.548h1.345v-5.79h3.685v2H4.91l.397 2.1h1.91l.398-2.1H6.53v-2h3.685v5.79Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h14v14H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

