import * as React from "react"
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"
import { Colors } from "@/constants/theme"



export const FastingDashboardIcon = ({
color = Colors.light.white,
size = 20,

} : {
  color?: string;
  size?: number;
}) => (
  <Svg

    width={size}
    height={size}
    fill="none"
  
  >
    <Path
      fill="url(#a)"
      fillRule="evenodd"
      d="M20 5a5 5 0 1 0-10 0 5 5 0 0 0 10 0Zm-6.195-2.138a.668.668 0 0 0-.943.943L14.058 5l-1.196 1.195a.668.668 0 0 0 .943.943L15 5.943l1.195 1.195a.668.668 0 0 0 .944-.943L15.943 5l1.196-1.195a.668.668 0 0 0-.944-.943L15 4.058l-1.195-1.196Z"
      clipRule="evenodd"
    />
    <Path
      fill="url(#b)"
      d="m9.134 6.266-.054.62c-.782-.002-1.671-.175-2.793-.393l-.382-.074c-1.653-.318-3.164-.28-4.337.253l-.174-2.005H9.01c.025-.46.102-.907.225-1.334H.667a.669.669 0 0 0-.665.724l.333 3.828c0 .004 0 .008.002.013l.893 10.275A2 2 0 0 0 3.222 20h3.089a4.467 4.467 0 0 1-1.644-3.467v-.467c0-.441.175-.866.488-1.178.129-.13.291-.22.466-.263a.999.999 0 0 1 .048-.71c.247-.537.632-1 1.113-1.338a3.345 3.345 0 0 1 1.725-2.451 3.34 3.34 0 0 1 1.68-1.543 5.965 5.965 0 0 1-1.053-2.317Z"
    />
    <Path
      fill="url(#c)"
      d="M9.266 10.877c.264-.733.882-1.299 1.65-1.481A5.983 5.983 0 0 0 15 11c.476 0 .94-.056 1.385-.16l.015.037a2.345 2.345 0 0 1 1.52 2.296c.516.231.932.646 1.168 1.16H6.578a2.34 2.34 0 0 1 1.168-1.16l-.001-.093c0-1.007.629-1.872 1.521-2.203Z"
    />
    <Path
      fill="url(#d)"
      d="M5.862 15.595a.667.667 0 0 0-.195.472v.466A3.46 3.46 0 0 0 9.12 20h7.428A3.46 3.46 0 0 0 20 16.533v-.466a.667.667 0 0 0-.195-.472H5.862Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={15}
        x2={15}
        y1={0}
        y2={10}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor={color} />
        <Stop offset={1} stopColor={color} />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={5.094}
        x2={5.094}
        y1={3.333}
        y2={20}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor={color} />
        <Stop offset={1} stopColor={color} />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={12.833}
        x2={12.833}
        y1={9.396}
        y2={14.333}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor={color} />
        <Stop offset={1} stopColor={color} />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={12.834}
        x2={12.834}
        y1={15.595}
        y2={20}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor={color} />
        <Stop offset={1} stopColor={color} />
      </LinearGradient>
    </Defs>
  </Svg>
)
