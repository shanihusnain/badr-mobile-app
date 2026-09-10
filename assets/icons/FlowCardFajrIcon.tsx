import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const FlowCardFajrIcon = ({ color = Colors.light.white, size = 20 }: { color?: string; size?: number }) => (
  <Svg
    width={size}
    height={size}
    fill="none"
 
  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M2.368 9.267A4.622 4.622 0 0 1 3.708 6.4a4.621 4.621 0 0 1 3.278-1.358A4.62 4.62 0 0 1 10.263 6.4a4.62 4.62 0 0 1 1.34 2.866h3.754a.411.411 0 1 1 0 .823H-1.386a.412.412 0 0 1 0-.823h3.753ZM1.132 4.406a.411.411 0 1 1 .581-.582l1.423 1.423a.411.411 0 1 1-.581.582L1.132 4.406Zm11.126-.582a.412.412 0 0 1 .583.582l-1.423 1.423a.411.411 0 1 1-.582-.582l1.423-1.423ZM6.574 1.81a.412.412 0 1 1 .823 0v2.013a.412.412 0 0 1-.823 0V1.81Zm6.328 9.987a.411.411 0 0 1 0 .824H1.07a.412.412 0 0 1 0-.824h11.832Z"
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
