import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme"
export const DhuharFardPrayerIcon = ({
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
            d="M17.523 8.508a.492.492 0 0 1 .012-.058c-.016.005-.034.011-.054.015l.041.043Zm-9.047-.001.027-.027c-.012-.001-.024-.001-.034-.003l.007.03Zm.03 9.022-.03-.03c-.001.012-.005.023-.007.034l.037-.004Zm9.024.004-.008-.033-.026.026.034.007Z"
        />
    </Svg>
)

