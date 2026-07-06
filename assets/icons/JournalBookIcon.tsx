import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";




export const JournalBookIcon = ({
    color = Colors.light.subtext,
    size = 24,
}: {
    color?: string;
    size?: number;
}) => (
    <Svg
        width={size}
        height={size}
        fill="none"
    >
        <G clipPath="url(#a)">
            <Path
                fill={color}
                stroke={color}
                strokeWidth={0.35}
                d="M19.185.675c.17 0 .334.067.454.186a.63.63 0 0 1 .186.448V23.69a.63.63 0 0 1-.186.448.645.645 0 0 1-.445.185H5.956c-1.539-.005-2.781-1.242-2.781-2.764V3.433A2.77 2.77 0 0 1 5.67.689l.285-.014h13.229ZM5.955 20.059c-.35 0-.685.122-.952.341l-.11.1c-.282.28-.44.662-.438 1.059v.074l.004.003c.039.79.693 1.417 1.496 1.422h12.59v-3H5.955Zm0-18.118a1.498 1.498 0 0 0-1.5 1.49v15.78l.253-.127a2.78 2.78 0 0 1 1.247-.293h12.59V1.941h-2.173v4.35a.632.632 0 0 1-.304.538.645.645 0 0 1-.623.028l-1.308-.649-.077-.038-.079.038-1.27.63h-.002l-.036.02a.646.646 0 0 1-.624-.029.632.632 0 0 1-.303-.538v-4.35h-5.79Zm7.071 3.324.253-.126.494-.244c.18-.09.391-.09.573 0l.493.244.253.126V1.94h-2.066v3.324Z"
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M0 0h24v24H0z" />
            </ClipPath>
        </Defs>
    </Svg>
)
