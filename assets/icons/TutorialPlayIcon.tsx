import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const TutorialPlayIcon = ({
  color = Colors.light.white,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      d="M8.2 5.35c0-.92.98-1.5 1.78-1.05l10.05 5.65c.82.46.82 1.64 0 2.1L9.98 17.7c-.8.45-1.78-.13-1.78-1.05V5.35Z"
    />
  </Svg>
);
