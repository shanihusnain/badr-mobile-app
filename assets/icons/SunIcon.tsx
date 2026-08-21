import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
export const SunIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} fill="none">
    <G clipPath="url(#a)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M7.402 12.6v-1.35a.435.435 0 0 0-.87 0v1.35a.435.435 0 0 0 .87 0Zm2.308-2.307.956.956a.435.435 0 0 0 .615-.615l-.956-.956a.435.435 0 0 0-.615.615Zm-6.442.956.956-.956a.435.435 0 0 0-.614-.615l-.956.956a.435.435 0 0 0 .614.615ZM6.956 3.91A3.068 3.068 0 0 0 3.89 6.977a3.068 3.068 0 0 0 3.066 3.066 3.068 3.068 0 0 0 3.066-3.066 3.068 3.068 0 0 0-3.066-3.066Zm4.325 3.46h1.351a.435.435 0 0 0 0-.87h-1.351a.435.435 0 0 0 0 .87Zm-9.98 0h1.353a.435.435 0 0 0 0-.87H1.302a.435.435 0 0 0 0 .87Zm1.353-4.134.956.956a.435.435 0 0 0 .614-.615l-.956-.955a.434.434 0 1 0-.614.614Zm7.67.956.957-.956a.435.435 0 0 0-.615-.614l-.956.955a.434.434 0 1 0 .615.615Zm-2.922-1.57V1.27a.435.435 0 0 0-.87 0v1.352a.435.435 0 0 0 .87 0Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h13.905v13.905H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
