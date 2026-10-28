import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

/** Solid bowl + chopsticks silhouette for Kaffarah 7-day rings (not outline). */
export const KaffarahDashboardMealsIcon = ({
  color = Colors.light.white,
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    {/* Chopsticks */}
    <Path
      fill={color}
      d="M6.4 1.6c.35-.25.85-.15 1.1.2l.9 1.25c.08.12.1.26.06.4L7.8 6.1c-.15.5-.7.75-1.15.5-.4-.22-.55-.72-.35-1.12l.55-1.1-.85-1.2c-.25-.35-.15-.85.2-1.1.07-.05.13-.08.2-.08Zm5.7 0c.35-.25.85-.15 1.1.2l.9 1.25c.08.12.1.26.06.4L13.5 6.1c-.15.5-.7.75-1.15.5-.4-.22-.55-.72-.35-1.12l.55-1.1-.85-1.2c-.25-.35-.15-.85.2-1.1.07-.05.13-.08.2-.08Z"
    />
    {/* Bowl */}
    <Path
      fill={color}
      d="M2.8 8.2c0-.55.45-1 1-1h12.4c.55 0 1 .45 1 1 0 .2-.05.4-.15.55l-1.05 4.2A3.6 3.6 0 0 1 12.5 16H7.5a3.6 3.6 0 0 1-3.5-3.05l-1.05-4.2A1 1 0 0 1 2.8 8.2Zm3.4 8.3h7.4c.45 0 .8.35.8.8s-.35.8-.8.8H6.2c-.45 0-.8-.35-.8-.8s.35-.8.8-.8Z"
    />
  </Svg>
);
