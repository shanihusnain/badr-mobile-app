import { Colors } from "@/constants/theme"
import * as React from "react"
import Svg, { Path } from "react-native-svg"





export const ChangePasswordIcon = ({
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
        <Path
            fill={color}
            stroke={color}
            strokeWidth={0.4}
            d="M12 2.2A4.8 4.8 0 0 1 16.8 7v2.2h.2a2.8 2.8 0 0 1 2.8 2.8v7a2.8 2.8 0 0 1-2.8 2.8H7A2.8 2.8 0 0 1 4.2 19v-7A2.8 2.8 0 0 1 7 9.2h.2V7A4.8 4.8 0 0 1 12 2.2Zm-5 8.6A1.2 1.2 0 0 0 5.8 12v7A1.2 1.2 0 0 0 7 20.2h10a1.2 1.2 0 0 0 1.2-1.2v-7a1.2 1.2 0 0 0-1.2-1.2H7Zm5-7A3.2 3.2 0 0 0 8.8 7v2.2h6.4V7A3.2 3.2 0 0 0 12 3.8Z"
        />
    </Svg>
)