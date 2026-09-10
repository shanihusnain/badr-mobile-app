import * as React from "react";
import Svg, { Rect } from "react-native-svg";

export const CheckCircleOutlineIcon = ({
  size = 20,
}: {
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect width={20} height={20} fill="#fff" />
  </Svg>
);
