import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const HeadPhoneQuranListeningIcon = ({
  color = Colors.light.white,
  size = 25,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <G fill={color} clipPath="url(#headphoneQuranListeningClip)">
      <Path d="M4.05 9c.745 0 1.35.745 1.35 1.35v5.4a1.35 1.35 0 0 1-1.35 1.35c-.746 0-1.35-.745-1.35-1.35v-5.4C2.7 9.605 3.303 9 4.05 9ZM13.95 9c.745 0 1.35.745 1.35 1.35v5.4a1.35 1.35 0 0 1-1.35 1.35c-.746 0-1.35-.745-1.35-1.35v-5.4c0-.745.604-1.35 1.35-1.35ZM2.16 15.75c0 .062.004.123.01.185l-.872-.436a.723.723 0 0 1-.398-.644v-3.61c0-.273.155-.523.398-.645l.872-.436a2.01 2.01 0 0 0-.01.186v5.4ZM17.1 11.245v3.61a.722.722 0 0 1-.399.644l-.87.436c.005-.06.008-.122.008-.185v-5.4a2.02 2.02 0 0 0-.009-.186l.871.436a.723.723 0 0 1 .398.644Z" />
      <Path d="M16.2 8.1v1.647l-.586-.293a1.887 1.887 0 0 0-1.213-.938V8.1c0-1.49-.605-2.84-1.582-3.818A5.4 5.4 0 0 0 3.6 8.1v.416a1.885 1.885 0 0 0-1.213.938l-.587.293V8.1a7.18 7.18 0 0 1 2.11-5.09A7.2 7.2 0 0 1 16.2 8.1Z" />
    </G>
    <Defs>
      <ClipPath id="headphoneQuranListeningClip">
        <Path fill={color} d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
