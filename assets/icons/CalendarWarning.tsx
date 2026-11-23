import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
export const CalendarWarning = () => (
  <Svg width={8} height={8} fill="none">
    <G clipPath="url(#a)">
      <Path
        fill="#E0A739"
        d="M7.63 5.303 5.207 1.108c-.666-1.154-1.756-1.154-2.422 0L.362 5.303c-.666 1.154-.12 2.098 1.212 2.098h4.845c1.332 0 1.877-.944 1.211-2.098Zm-3.666.824a.617.617 0 1 1 0-1.234.617.617 0 0 1 0 1.234Zm.64-2.247a.64.64 0 0 1-1.28 0V2.783a.64.64 0 0 1 1.28 0V3.88Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h8v8H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
