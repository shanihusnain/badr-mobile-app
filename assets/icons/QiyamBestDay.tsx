import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

type QiyamBestDayIconProps = {
  size?: number;
  color?: string;
};

/** Gold moon + stars for After Isha best-day cells on the Qiyam dashboard. */
export const QiyamBestDayIcon = ({
  size = 20,
  color = Colors.light.qiyamIconGold,
}: QiyamBestDayIconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
    <Path
      fill={color}
      d="M10.56 10.2c0-2.58 1.4-4.82 3.5-6-1.04-.58-2.22-.9-3.5-.9-3.98 0-7.2 3.22-7.2 7.2s3.22 7.2 7.2 7.2c1.48 0 2.86-.44 4-1.22-2.36-1.1-4-3.5-4-6.28Z"
    />
    <Path
      fill={color}
      d="m16.045 10.14-1.82 1.16.54-2.08-1.64-1.36 2.12-.14.8-1.98.78 1.98 2.14.14-1.66 1.36.54 2.08-1.8-1.16ZM2.6 4.5l-.9.56.28-1.02-.84-.68 1.08-.08.38-.98.4.98 1.06.08-.82.68.28 1.02-.92-.56ZM2.48 17.14l-.88.56.26-1-.82-.68 1.06-.06.38-.96.38.96 1.04.06-.8.68.26 1-.88-.56Z"
    />
  </Svg>
);
