import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const BestdayStarIcon = ({
  Size = 20,
}: {
  Size?: number;
}) => (
  <Svg width={Size} height={Size} viewBox="0 0 20 20" fill="none">
    <Path
      fill="#E4D27E"
      d="M9.997.894A11.114 11.114 0 0 0 19.103 10a11.114 11.114 0 0 0-9.106 9.106A11.113 11.113 0 0 0 .89 10 11.113 11.113 0 0 0 9.997.894Z"
    />
  </Svg>
);
