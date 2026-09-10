import Svg, { Path } from "react-native-svg";

export const HandIcon = ({
  width = 30,
  height = 30,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
      <Path fill="#fff" d="M0 30V0h30v30z" />
    </Svg>
  );
};
