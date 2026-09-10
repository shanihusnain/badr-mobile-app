import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";


export const FeelingSickIcon = ({
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
            fillRule="evenodd"
            d="M11.93 2.19a4.167 4.167 0 1 0 0 8.334 4.167 4.167 0 0 0 0-8.334ZM6.571 6.358a5.358 5.358 0 1 1 10.715 0 5.358 5.358 0 0 1-10.715 0Z"
            clipRule="evenodd"
        />
        <Path
            fill={color}
            fillRule="evenodd"
            d="M3 19.454a8.93 8.93 0 0 1 17.859 0v1.022c0 .67-.465 1.25-1.117 1.398l-2.24.505a25.335 25.335 0 0 1-11.145 0l-2.24-.505A1.433 1.433 0 0 1 3 20.476v-1.022Zm8.93-7.739a7.738 7.738 0 0 0-7.739 7.739v1.022c0 .113.078.211.189.237l2.24.504c3.496.79 7.123.79 10.62 0l2.24-.504a.243.243 0 0 0 .188-.237v-1.022a7.738 7.738 0 0 0-7.738-7.739Z"
            clipRule="evenodd"
        />
        <Path
            fill={color}
            fillRule="evenodd"
            d="M12.525 17.074c0-.33.267-.597.596-.597h3.572a.596.596 0 0 1 0 1.192H13.12a.596.596 0 0 1-.596-.595Z"
            clipRule="evenodd"
        />
        <Path
            fill={color}
            fillRule="evenodd"
            d="M14.907 14.691c.328 0 .595.267.595.596v3.572a.595.595 0 0 1-1.192 0v-3.572c0-.329.267-.596.597-.596Z"
            clipRule="evenodd"
        />
    </Svg>
)
