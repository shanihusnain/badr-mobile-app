import Svg, { Circle } from "react-native-svg";

export const DotsWithCircle = ({
  size = 30,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => {
  const scale = size / 19;
  const cx = 9.5 * scale;
  const cy = 9.5 * scale;
  const r = 9 * scale;
  const dotR = 1.35 * scale;
  const gap = 3.2 * scale;

  return (
    <Svg width={size} height={size} fill="none">
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={1.2 * scale}
      />
      <Circle cx={cx - gap} cy={cy} r={dotR} fill={color} />
      <Circle cx={cx} cy={cy} r={dotR} fill={color} />
      <Circle cx={cx + gap} cy={cy} r={dotR} fill={color} />
    </Svg>
  );
};
