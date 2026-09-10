import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const CheckIcon = ({
  size = 28,
  color = Colors.light.white,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path
        fill={color}
        d="M19.725 9.753a.854.854 0 0 0-1.212 0l-6.362 6.37L9.48 13.44a.873.873 0 0 0-1.213 1.256l3.28 3.279a.855.855 0 0 0 1.212 0l6.967-6.968a.854.854 0 0 0 0-1.255Z"
      />
    </Svg>
  );
};
