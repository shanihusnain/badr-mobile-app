import { Colors } from "@/constants/theme";
import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const ProfileInformationIcon = ({
  Color = Colors.light.subtext,
  size = 24,
}: {
  Color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} fill="none" stroke={Color} strokeWidth={0.0}>
    <Path
      fill={Color}
      stroke={Color}
      //strokeWidth={0.9}
      d="M15.71 12.71a6 6 0 1 0-7.42 0 10 10 0 0 0-6.22 8.18 1.006 1.006 0 0 0 2 .22 8 8 0 0 1 15.9 0 1 1 0 0 0 1 .89h.11a1 1 0 0 0 .88-1.1 10.001 10.001 0 0 0-6.25-8.19ZM12 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
    />
  </Svg>
);
