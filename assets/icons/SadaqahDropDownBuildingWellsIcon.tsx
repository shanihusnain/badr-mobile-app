import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const SadaqahDropDownBuildingWellsIcon = ({
  color = Colors.light.white,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        fillRule="evenodd"
        stroke="#fff"
        strokeWidth={0.5}
        d="M1.029 9.579h.709V1.195h1.988v1.408h8.319V1.195h1.988v1.408h1.173l.534 1.5h1.533v.605h-1.958l-.534-1.5h-.748v6.37h1.012v7.226H.728L.727 9.58h.302Zm6.554-4.501v-1.87H3.726v6.37h8.319v-6.37H8.187v1.87H9.52l-.48 2.78H6.73l-.479-2.78h1.332Zm1.219.605H6.969l.27 1.57h1.292l.27-1.57Zm-6.46 3.896h.78V1.8h-.78v7.778Zm10.307 0h.779V1.8h-.779v7.778Zm1.79.604H1.331V16.2H14.44v-6.016Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

