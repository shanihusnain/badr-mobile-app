import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const InBoxArrow = ({
    color = Colors.light.subtext,
    size = 24,
}: {
    color?: string;
    size?: number;
}) => (
    <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
    >
        <Path
            fill={color}
            stroke={color}
            strokeWidth={0.4}
            d="M19.8 19.404H15.16V17.89h3.084V1.715H1.754v16.173h3.085v1.514H.2V.2h19.6v19.204Zm-9.841.316L5.756 15.6l1.097-1.076 1.989 1.952.34.333V6.912h1.553v9.897l.341-.333 1.99-1.952 1.097 1.075-4.204 4.12Z"
        />
    </Svg>
)

