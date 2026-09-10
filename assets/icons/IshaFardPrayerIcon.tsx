import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const IshaFardPrayerIcon = ({
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
            d="M8.86 0A10.046 10.046 0 0 0 0 9.958c0 5.538 4.501 10.04 10.04 10.04a10.046 10.046 0 0 0 9.956-8.82.558.558 0 0 0-.861-.534A7.056 7.056 0 0 1 9.352.864.558.558 0 0 0 8.86.002Zm-.95 1.338c-.5 1.075-.844 2.217-.845 3.413 0 4.512 3.669 8.18 8.18 8.18 1.198 0 2.34-.344 3.417-.846-.969 3.938-4.475 6.792-8.623 6.796a8.915 8.915 0 0 1-8.924-8.923c.006-4.147 2.86-7.651 6.796-8.62Z"
        />
    </Svg>
)

