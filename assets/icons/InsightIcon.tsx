import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";


export const InsightIcon = ({
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
        stroke={color}
        strokeWidth={0.4}
    // {...props}
    >
        <Path
            fill={color}
            d="m22.606 4.514-.694.694-3.12-3.12.694-.694a2.206 2.206 0 1 1 3.12 3.12ZM7.92 16.346l1.425 1.425L20.708 6.412l.938-.937V5.47L20.22 4.05 7.92 16.346Zm-.266-.266 12.3-12.297V3.78l-1.428-1.425-.938.938L6.23 14.655l1.425 1.425Zm-2.276 2.542 3.585-.7-1.44-1.445-1.444-1.44-.701 3.585Zm15.278 3.113a1.143 1.143 0 0 1-1.144 1.14H2.265a1.139 1.139 0 0 1-1.14-1.14V4.488a1.143 1.143 0 0 1 1.14-1.144h14.742l.375-.375H2.265A1.519 1.519 0 0 0 .75 4.49v17.246a1.516 1.516 0 0 0 1.515 1.515h17.247a1.519 1.519 0 0 0 1.519-1.515V6.618l-.375.375v14.742Z"
        />
    </Svg>
)
