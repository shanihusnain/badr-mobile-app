import Svg, { Path } from "react-native-svg";

export const ChevronLeft = ({
  size = 24,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        fill={color}
        d="m13.576 5.576-6 6-.425.424.425.424 6 6 .424.424.849-.848-.425-.424L8.848 12l5.576-5.576.425-.424L14 5.15l-.424.425Z"
      />
    </Svg>
  );
};
