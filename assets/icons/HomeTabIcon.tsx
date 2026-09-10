import { Colors } from "@/constants/theme";
import Svg, { Path } from "react-native-svg";

export const HomeTabIcon = ({
  size = 21,
  color = Colors.light.white,
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} fill="none">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M.5 9.978 9.684.836a1.158 1.158 0 0 1 1.631 0L20.5 9.978M2.808 7.681v10.337c0 .634.517 1.149 1.154 1.149h4.23V14.19c0-.634.517-1.149 1.154-1.149h2.308c.637 0 1.154.515 1.154 1.149v4.977h4.23c.637 0 1.154-.515 1.154-1.149V7.681M6.654 19.167h8.461"
      />
    </Svg>
  );
};
