import Svg, { Path, Rect } from "react-native-svg";

export const CheckBox = () => {
  return (
    <Svg width={28} height={28} fill="none">
      <Rect width={28} height={28} fill="#1DBF73" rx={4} />
      <Path
        fill="#fff"
        d="M19.592 10.008a.833.833 0 0 0-1.184 0L12.2 16.225l-2.608-2.617a.852.852 0 0 0-1.184 1.225l3.2 3.2a.832.832 0 0 0 1.184 0l6.8-6.8a.833.833 0 0 0 0-1.225Z"
      />
    </Svg>
  );
};
