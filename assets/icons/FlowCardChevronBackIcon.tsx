import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const FlowCardChevronBackIcon = ({
  Color = Colors.light.white,
  Size = 8,
}: {
  Color?: string;
  Size?: number;
}) => (
  // Square layout box so the button can center the icon evenly;
  // path stays centered inside via preserveAspectRatio.
  <Svg
    width={Size}
    height={Size}
    viewBox="0 0 7 10"
    preserveAspectRatio="xMidYMid meet"
    fill="none"
  >
    <Path
      fill={Color}
      d="M.302 4.79 4.79.3l1.06 1.06-3.428 3.43 3.429 3.428-1.061 1.06L.301 4.79Z"
    />
  </Svg>
);
