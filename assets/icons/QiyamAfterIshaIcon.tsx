import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

type QiyamAfterIshaIconProps = {
  color?: string;
  size?: number;
  /** Outline style for the when-pray logging step dropdown. */
  outline?: boolean;
};

export const QiyamAfterIshaIcon = ({
  color = Colors.light.white,
  size = 20,
  outline = false,
}: QiyamAfterIshaIconProps) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 18 18">
    <Path
      fill={outline ? "none" : color}
      stroke={outline ? color : undefined}
      strokeWidth={outline ? 1.1 : undefined}
      strokeLinejoin={outline ? "round" : undefined}
      d="M9.503 9.18a6.17 6.17 0 0 1 3.15-5.4 6.406 6.406 0 0 0-3.15-.81 6.476 6.476 0 0 0-6.48 6.48 6.476 6.476 0 0 0 6.48 6.48 6.347 6.347 0 0 0 3.6-1.098 6.236 6.236 0 0 1-3.6-5.652Z"
    />
    <Path
      fill={outline ? "none" : color}
      stroke={outline ? color : undefined}
      strokeWidth={outline ? 1.1 : undefined}
      strokeLinejoin={outline ? "round" : undefined}
      d="m14.44 9.126-1.637 1.044.486-1.872-1.476-1.224 1.907-.126.72-1.782.703 1.782 1.925.126-1.494 1.224.487 1.872-1.62-1.044ZM2.345 4.05l-.81.504.252-.918-.756-.612.972-.072.342-.882.36.882.954.072-.738.612.252.918-.828-.504ZM2.234 15.426l-.792.504.234-.9-.738-.612.954-.054.342-.864.342.864.936.054-.72.612.234.9-.792-.504Z"
    />
  </Svg>
);
