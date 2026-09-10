import * as React from "react";
import Svg, { Path } from "react-native-svg";
export const WhiteTick = () => (
  <Svg width={7} height={5} fill="none">
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeOpacity={0.9}
      strokeWidth={1.2}
      d="m.6 2.722 1.414 1.414L5.549.6"
    />
  </Svg>
);
