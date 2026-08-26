import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const FlowCardChevronForwardIcon = ({
  Color = Colors.light.white,
  Size = 7,
}: {
  Color?: string;
  Size?: number;
}) => (
  <Svg width={Size} height={(Size / 7) * 10} fill="none" viewBox="0 0 7 10">
    <Path
      fill={Color}
      d="M5.85 4.79 1.362 9.277l-1.06-1.06 3.428-3.429L.301 1.36 1.36.3l4.49 4.49Z"
    />
  </Svg>
);
