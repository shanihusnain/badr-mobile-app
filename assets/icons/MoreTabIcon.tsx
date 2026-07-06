import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const MoreTabIcon = ({
  size = 20,
  color = Colors.light.white,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M10 18.75A8.75 8.75 0 0 0 18.75 10 8.75 8.75 0 0 0 10 1.25 8.75 8.75 0 0 0 1.25 10 8.75 8.75 0 0 0 10 18.75ZM10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10Z"
        clipRule="evenodd"
      />
      <Path
        fill={color}
        fillRule="evenodd"
        d="M8.75 5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Zm0 5a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM10 16.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
