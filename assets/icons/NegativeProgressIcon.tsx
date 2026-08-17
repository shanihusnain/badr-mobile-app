import Svg, { Path } from "react-native-svg";

export const NegativeProgressIcon = () => {
  return (
    <Svg width={8} height={5} fill="none">
      <Path
        fill="#fff"
        fillOpacity={0.5}
        d="m.073.579.045.05 3.401 3.667a.652.652 0 0 0 .48.202.66.66 0 0 0 .48-.202l3.4-3.66.057-.062A.346.346 0 0 0 8.003.37c0-.204-.185-.37-.415-.37H.415C.185 0 0 .166 0 .37 0 .448.028.52.073.58Z"
      />
    </Svg>
  );
};
