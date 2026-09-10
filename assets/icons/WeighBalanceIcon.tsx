import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
export const WeighBalanceIcon = () => (
  <Svg width={14} height={14} fill="none">
    <Path fill="url(#a)" d="M0 4.724v1.567h14V3.158H0v1.566Z" />
    <Path
      fill="url(#b)"
      d="M5.8 8.633a192.299 192.299 0 0 0-1.16 2.345c0 .015.798.022 2.345.022H9.33L8.158 8.656A191.726 191.726 0 0 0 6.974 6.31c-.007 0-.533 1.045-1.173 2.322Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={7}
        x2={7}
        y1={3.158}
        y2={6.291}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00ECD2" />
        <Stop offset={1} stopColor="#00AFE9" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={6.985}
        x2={6.985}
        y1={6.311}
        y2={11}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00ECD2" />
        <Stop offset={1} stopColor="#00AFE9" />
      </LinearGradient>
    </Defs>
  </Svg>
);
