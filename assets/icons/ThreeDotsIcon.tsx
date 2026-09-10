import Svg, { Circle } from "react-native-svg";

export const ThreeDotsIcon = ({
  size = 18,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={18} height={4} fill="none">
      <Circle cx={2} cy={2} r={2} fill={color} />
      <Circle cx={9} cy={2} r={2} fill={color} />
      <Circle cx={16} cy={2} r={2} fill={color} />
    </Svg>
  );
};
