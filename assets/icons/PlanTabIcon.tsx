import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const PlanTabIcon = ({
  size = 20,
  color = Colors.light.white,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={1.333}
        d="M.667 10.002V4.4h4.2v-.934a2.8 2.8 0 1 1 5.602 0v.934h4.2V10h1.867a2.8 2.8 0 0 1 0 5.602H14.67v3.734H.667v-3.734h1.867a2.8 2.8 0 1 0 0-5.601H.667Z"
      />
    </Svg>
  );
};
