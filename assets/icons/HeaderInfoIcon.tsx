import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
export const HeaderInfoIcon = () => (
  <Svg width={23} height={23} fill="none">
    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        fillRule="evenodd"
        d="M12.227 16.38H9.299v-.488h.976v-7.33H9.3v-.488h2.928v7.818h.976v.489h-.976ZM11.25 6.7a1.343 1.343 0 1 1 .002-2.686A1.343 1.343 0 0 1 11.25 6.7Zm.002 15.788C5.065 22.488.031 17.446.031 11.25.031 5.053 5.065.012 11.253.012S22.475 5.053 22.475 11.25c0 6.196-5.034 11.238-11.222 11.238Zm0-21.5C5.603.989 1.007 5.593 1.007 11.25s4.596 10.26 10.246 10.26 10.246-4.602 10.246-10.26c0-5.658-4.596-10.261-10.246-10.261Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h22.5v22.5H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
