import * as React from "react"
import Svg, { Mask, Path } from "react-native-svg"
import { Colors } from "@/constants/theme";




export const CalendarIcon = ({
    color = Colors.light.white,
    size = 20,
}: {
    color?: string;
    size?: number;
}) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
        >
            <Mask id="a" fill="#fff">
                <Path d="M10 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0-4a1 1 0 1 0 0-2.002A1 1 0 0 0 15 14Zm-5 0a1 1 0 1 0 0-2.002A1 1 0 0 0 10 14Zm7-12h-1V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H3a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Zm1 17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9h16v9Zm0-11H2V5a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V4h8v1a1 1 0 0 0 2 0V4h1a1 1 0 0 1 1 1v3ZM5 14a1 1 0 1 0 0-2.001A1 1 0 0 0 5 14Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
            </Mask>
            <Path
                fill={color}
                d="M10 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0-4a1 1 0 1 0 0-2.002A1 1 0 0 0 15 14Zm-5 0a1 1 0 1 0 0-2.002A1 1 0 0 0 10 14Zm7-12h-1V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H3a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Zm1 17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9h16v9Zm0-11H2V5a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V4h8v1a1 1 0 0 0 2 0V4h1a1 1 0 0 1 1 1v3ZM5 14a1 1 0 1 0 0-2.001A1 1 0 0 0 5 14Zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                mask="url(#a)"
            />
        </Svg>
    );
};
