import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"
export const InsightCardArrowReverseIcon = ({
  color = Colors.light.subtext,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} fill="none" viewBox="0 0 17 16">
    <Path
      fill={color}
      d="M9.274 14.898c-2.377 0-4.55-1.53-5.407-3.809a.957.957 0 0 0-1.249-.568 1 1 0 0 0-.553 1.283c1.142 3.037 4.04 5.078 7.21 5.078 4.26 0 7.725-3.56 7.725-7.938 0-4.377-3.466-7.938-7.726-7.938a7.61 7.61 0 0 0-5.115 1.99L2.255 1.038a.124.124 0 0 0-.213.091c.035 1.16.007 4.955 0 5.697 0 .072.056.127.126.127H7.71c.111 0 .167-.139.088-.22L5.533 4.408A5.698 5.698 0 0 1 9.274 2.99c3.195 0 5.795 2.671 5.795 5.954s-2.6 5.954-5.795 5.954Z"
    />
  </Svg>
);

