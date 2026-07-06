import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const CrossIcon = ({
  color = Colors.light.white,
  width = 15,
  height = 15,
}: {
  color?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Svg width={30} height={30} fill="none">
      <Path
        fill="#fff"
        d="m16.76 14.994 5.37-5.358a1.254 1.254 0 0 0-1.773-1.774L15 13.233l-5.357-5.37a1.254 1.254 0 1 0-1.774 1.773l5.37 5.358-5.37 5.358a1.25 1.25 0 0 0 0 1.774 1.25 1.25 0 0 0 1.774 0L15 16.756l5.357 5.37a1.25 1.25 0 0 0 1.774 0 1.248 1.248 0 0 0 0-1.774l-5.37-5.358Z"
      />
    </Svg>
  );
};
