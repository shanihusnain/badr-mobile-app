import { ClipPath } from "react-native-svg";

import Svg, { Defs, G, Path } from "react-native-svg";

export const HomeBondIcon = ({ color }: { color: string }) => {
  return (
    <Svg width={20} height={20} fill="none">
      <G fill={color} clipPath="url(#a)">
        <Path d="M19.787 9.214 10.413 1.09a.624.624 0 0 0-.818 0L6.25 3.984V2.812a1.25 1.25 0 1 0-2.5 0v3.34L.217 9.214a.626.626 0 0 0 .82.944L10 2.39l8.964 7.77a.627.627 0 0 0 .822-.946Z" />
        <Path d="M17.042 10.722 10.8 5.6a1.246 1.246 0 0 0-1.6 0l-6.242 5.12a1.25 1.25 0 0 0-.458.968v6.124a1.248 1.248 0 0 0 1.25 1.248h4.118V16a2.132 2.132 0 1 1 4.264 0v3.062h4.118a1.252 1.252 0 0 0 1.25-1.25v-6.124a1.24 1.24 0 0 0-.458-.966Z" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill={color} d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
