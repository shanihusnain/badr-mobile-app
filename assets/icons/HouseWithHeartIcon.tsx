import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const HouseWithHeartIcon = ({
  color = Colors.light.white,
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    {/* Filled house with heart cut out (evenodd). */}
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.18.627a.281.281 0 0 0-.36 0L.665 7.406a.281.281 0 0 0 .18.497h1.26v8.972H.844a.281.281 0 1 0 0 .563h16.188a.281.281 0 1 0 0-.563h-1.135V7.903h1.26a.28.28 0 0 0 .18-.498L9.18.627ZM7.118 7.648c-.676 0-1.253.232-1.67.671-.426.45-.65 1.097-.612 1.776.067 1.236.824 3.033 4.042 4.577a.284.284 0 0 0 .244 0c3.219-1.545 3.975-3.342 4.042-4.578.037-.678-.186-1.325-.612-1.775-.416-.439-.993-.67-1.67-.67-.96 0-1.559.481-1.882.951-.323-.47-.922-.952-1.882-.952Z"
    />
  </Svg>
);
