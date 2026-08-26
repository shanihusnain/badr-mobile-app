import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const FlowCardChevronBackIcon = ({
  Color = Colors.light.white,
  Size = 7,
}: {
  Color?: string;
  Size?: number;
}) => (
  <Svg width={Size} height={(Size / 7) * 10} fill="none" viewBox="0 0 7 10">
    <Path
      fill={Color}
      d="M.302 4.79 4.79.3l1.06 1.06-3.428 3.43 3.429 3.428-1.061 1.06L.301 4.79Z"
    />
  </Svg>
);
