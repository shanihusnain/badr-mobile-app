import React from "react";
import Svg, { Path } from "react-native-svg";

export const StarSparkleIcon = ({
  color = "#FFD24D",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => {
  const half = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l1.9 4.3L18 8l-4 1.1L12 14l-2-4.9L6 8l4.1-1.7L12 2z"
        fill={color}
      />
    </Svg>
  );
};

export default StarSparkleIcon;
