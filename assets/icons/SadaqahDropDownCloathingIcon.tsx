import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const SadaqahDropDownCloathingIcon = ({
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
        strokeWidth={0.4}
        d="M14.372 2.097a.344.344 0 0 0-.364-.07l-.034.013a12.005 12.005 0 0 1-8.942 0l-.044-.017a.324.324 0 0 0-.351.074L1.223 5.579A.776.776 0 0 0 1 6.13c0 .207.079.4.223.548L2.921 8.41a.75.75 0 0 0 1.074 0l.89-.91v7.726c0 .427.34.774.76.774h7.71a.767.767 0 0 0 .76-.774V7.5l.89.909a.75.75 0 0 0 1.073 0l1.699-1.733A.776.776 0 0 0 18 6.128a.776.776 0 0 0-.223-.549l-3.414-3.482h.009Zm2.952 4.11-1.698 1.732a.106.106 0 0 1-.153 0l-1.448-1.477a.32.32 0 0 0-.355-.071.336.336 0 0 0-.202.308v8.527a.11.11 0 0 1-.108.11H5.65a.11.11 0 0 1-.108-.11V6.699a.333.333 0 0 0-.327-.334.322.322 0 0 0-.23.097L3.539 7.94a.106.106 0 0 1-.153 0L1.687 6.206a.111.111 0 0 1 0-.156l3.262-3.329a12.626 12.626 0 0 0 9.113 0l3.262 3.33a.111.111 0 0 1 0 .155Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)


