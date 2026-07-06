import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/theme";

export const DocumentLockIcon = ({
    color = Colors.light.white,
    size = 19,
}: {
    color?: string;
    size?: number;
}) => {
    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
            <Path
                fill={color}
                stroke={color}
                strokeWidth={0.2}
                d="m20.827 5.53-5.29-1.762V.24l5.29 5.29Z"
            />
            <Path
                fill={color}
                stroke={color}
                strokeWidth={0.2}
                d="M14.38.1v.76H2.86v22.28h17.48V6.82h.76V23.9h-19V.1h12.28Z"
            />
            <Path
                fill={color}
                stroke={color}
                strokeWidth={0.2}
                d="M11.596 6.818a3.74 3.74 0 0 1 3.74 3.74v2.021h.96v7.48h-9.4v-7.48h.96v-2.02a3.74 3.74 0 0 1 3.74-3.74Zm0 1.721a2.02 2.02 0 0 0-2.02 2.02v2.02h4.04v-2.02c0-1.114-.906-2.02-2.02-2.02Z"
            />
        </Svg>
    );
};