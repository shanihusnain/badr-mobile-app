import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme"
export const SadaqahJariyahCloathIcon = ({ color = Colors.light.white, size = 30 }: { color?: string; size?: number }) => (
    <Svg

        width={size}
        height={size}
        fill="none"

    >
        <G clipPath="url(#a)">
            <Path
                fill={color}
                d="M10.433 1.777a.877.877 0 0 0-.235.05l-6.75 2.4a.882.882 0 0 0-.553.586l-2.86 9.903a.883.883 0 0 0 .847 1.127h4.953v11.496a.882.882 0 0 0 .879.886h16.57a.883.883 0 0 0 .88-.886V15.843h4.954a.882.882 0 0 0 .847-1.127l-2.862-9.903a.882.882 0 0 0-.552-.586l-6.75-2.4a.882.882 0 0 0-1.146.593A3.778 3.778 0 0 1 15 5.182a3.78 3.78 0 0 1-3.657-2.762.882.882 0 0 0-.91-.643Z"
            />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill={color} d="M0 0h30v30H0z" />
            </ClipPath>
        </Defs>
    </Svg>
)
