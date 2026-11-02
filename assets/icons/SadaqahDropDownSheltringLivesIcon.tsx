import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const SadaqahDropDownSheltringLivesIcon = ({
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
        stroke="#fff"
        strokeWidth={0.7}
        d="m8.75 5.277 6.206 5.741v5.538H2.544v-5.538l6.206-5.74Zm0 .37-5.93 5.485v5.156h11.86v-5.155L8.75 5.647ZM8.75 1l8.75 8.122-1.808 1.677-6.941-6.443L1.808 10.8 0 9.122 8.75 1Zm0 .37L.398 9.122l1.41 1.308L8.75 3.986l6.94 6.443 1.41-1.307L8.75 1.37Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

