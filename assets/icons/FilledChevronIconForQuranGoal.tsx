import * as React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

type Props = {
  color?: string;
  /** Visual height of the chevron; width scales as half of height. */
  size?: number;
  /** Path faces left by default; flip for the start (right-facing) thumb. */
  direction?: "left" | "right";
  style?: StyleProp<ViewStyle>;
};

export const FilledChevronIconForQuranGoal = ({
  color = Colors.light.green,
  size = 8,
  direction = "left",
  style,
}: Props) => (
  <Svg
    width={size / 2}
    height={size}
    viewBox="0 0 4 8"
    fill="none"
    style={[
      direction === "right" ? { transform: [{ scaleX: -1 }] } : null,
      style,
    ]}
  >
    <Path
      fill={color}
      d="m3.485.072-.044.045-3.262 3.4a.693.693 0 0 0-.179.48c0 .193.07.365.18.48l3.255 3.398.054.058A.286.286 0 0 0 3.671 8C3.852 8 4 7.815 4 7.585V.415C4 .185 3.852 0 3.67 0a.285.285 0 0 0-.185.072Z"
    />
  </Svg>
);
