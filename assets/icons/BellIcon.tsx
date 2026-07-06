import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const BellIcon = ({
  width = 23,
  height = 26,
  color = Colors.light.white,
}: {
  width: number;
  height: number;
  color: string;
}) => {
  return (
    <Svg width={width} height={height} fill="none">
      <Path
        fill={color}
        d="M11.2 0a9.6 9.6 0 0 0-9.6 9.6v5.738l-1.132 1.13A1.6 1.6 0 0 0 1.6 19.2h19.2a1.6 1.6 0 0 0 1.13-2.731l-1.13-1.131V9.6A9.6 9.6 0 0 0 11.2 0Zm0 25.6a4.8 4.8 0 0 1-4.8-4.8H16a4.8 4.8 0 0 1-4.8 4.8Z"
      />
    </Svg>
  );
};
