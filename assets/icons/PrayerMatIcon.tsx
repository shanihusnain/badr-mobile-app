import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
export const PrayerMatIcon = () => (
  <Svg width={23} height={22} fill="none">
    <Path
      fill="url(#a)"
      d="M21.521 8.969a.477.477 0 0 0 0-.955h-.954V6.296h.954a.477.477 0 0 0 0-.954h-1.087a.95.95 0 0 0-.822-.478H8.142c.007.108.015.214.015.322v1.587h8.444c.22 0 .4.149.458.358.167.602.64 1.074 1.24 1.241.21.058.359.24.359.459v7.34c0 .22-.148.401-.358.459a1.786 1.786 0 0 0-1.241 1.24.475.475 0 0 1-.459.359H7.957a4.152 4.152 0 0 1-1.27 1.909h12.925a.95.95 0 0 0 .823-.478h1.087a.477.477 0 0 0 0-.954h-.955v-1.718h.955a.477.477 0 0 0 0-.955h-.955v-1.718h.955a.477.477 0 0 0 0-.955h-.955v-1.718h.955a.477.477 0 0 0 0-.955h-.955V8.97h.954Z"
    />
    <Path
      fill="url(#b)"
      d="M16.321 14.321c.327-.724.655-1.18.902-1.45a.546.546 0 0 0 0-.74c-.247-.269-.575-.725-.902-1.45-.49-1.074-1.326-2.475-5.3-2.475H8.156v8.591h2.865c3.974 0 4.81-1.4 5.3-2.475Z"
    />
    <Path
      fill="url(#c)"
      d="M4.103 12.978c1.245 0 2.358.563 3.102 1.446V5.186C7.205 3.426 5.816 2 4.103 2 2.389 2 1 3.427 1 5.186v9.237a4.049 4.049 0 0 1 3.103-1.446v.001Z"
    />
    <Path
      fill="url(#d)"
      d="M4.103 13.933a3.103 3.103 0 1 0 0 6.205 3.103 3.103 0 0 0 0-6.205Zm0 5.13a2.028 2.028 0 1 1-.001-4.056 2.028 2.028 0 0 1 0 4.057Z"
    />
    <Path
      fill="url(#e)"
      d="M5.058 17.036c0 1.272-1.91 1.272-1.91 0 0-1.273 1.91-1.273 1.91 0Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={14.343}
        x2={14.343}
        y1={4.864}
        y2={20.138}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={12.762}
        x2={12.762}
        y1={8.206}
        y2={16.797}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={4.103}
        x2={4.103}
        y1={2}
        y2={14.424}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={4.103}
        x2={4.103}
        y1={13.933}
        y2={20.138}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={4.103}
        x2={4.103}
        y1={16.081}
        y2={17.99}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
    </Defs>
  </Svg>
);
