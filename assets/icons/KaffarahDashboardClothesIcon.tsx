import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

/** Solid t-shirt silhouette for Kaffarah 7-day rings (not outline). */
export const KaffarahDashboardClothesIcon = ({
  color = Colors.light.white,
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      fill={color}
      d="M6.2 2.4c.55 1.15 1.85 1.9 3.8 1.9s3.25-.75 3.8-1.9l2.35 2.2 2.35 2.35-2.55 2.45V17.2c0 .55-.45 1-1 1H6.05c-.55 0-1-.45-1-1V9.4L2.5 6.95 4.85 4.6 6.2 2.4Z"
    />
  </Svg>
);
