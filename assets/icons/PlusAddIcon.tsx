import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const PlusAddIcon = ({
  size = 32,
  color = Colors.light.white,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        fill={color}
        d="M16 2.666a13.333 13.333 0 1 0 0 26.667 13.333 13.333 0 0 0 0-26.667Zm0 24a10.666 10.666 0 1 1 0-21.332 10.666 10.666 0 0 1 0 21.332Zm5.333-12h-4v-4a1.333 1.333 0 1 0-2.667 0v4h-4a1.333 1.333 0 1 0 0 2.667h4v4a1.333 1.333 0 0 0 2.667 0v-4h4a1.333 1.333 0 1 0 0-2.667Z"
      />
    </Svg>
  );
};
