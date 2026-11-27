import * as React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
};

export const TickIconWithGreenBg = ({ width = 12, height = 9 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 12 9" fill="none">
    <Path
      fill="#fff"
      d="M11.725.253a.854.854 0 0 0-1.212 0L4.15 6.623 1.48 3.94A.872.872 0 1 0 .266 5.196l3.28 3.28a.854.854 0 0 0 1.212 0l6.967-6.968a.853.853 0 0 0 0-1.255Z"
    />
  </Svg>
);
