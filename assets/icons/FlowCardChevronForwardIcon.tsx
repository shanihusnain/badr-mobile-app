import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const FlowCardChevronForwardIcon = ({
  Color = Colors.light.white,
  Size = 8,
}: {
  Color?: string;
  Size?: number;
}) => (
  // Square layout box; path is nudged right so the `>` optically centers
  // (glyph weight sits on the open left side of the chevron).
  <Svg
    width={Size}
    height={Size}
    viewBox="0 0 7 10"
    preserveAspectRatio="xMidYMid meet"
    fill="none"
  >
    <G transform="translate(0.75 0)">
      <Path
        fill={Color}
        d="M5.85 4.79 1.362 9.277l-1.06-1.06 3.428-3.429L.301 1.36 1.36.3l4.49 4.49Z"
      />
    </G>
  </Svg>
);
