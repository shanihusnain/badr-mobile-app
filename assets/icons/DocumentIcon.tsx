import { width } from "@/src/screens/private/more/style";
import * as React from "react"
import Svg, { Path } from "react-native-svg"
export const DocumentIcon = ({

    color,
    width,
    height,
}: {
    color?: string;
    width?: number;
    height?: number;
}) => (
    <Svg
        width={width}
        height={height}
        fill="none"
    >
        <Path
            fill="#A0A0A0"
            stroke={color}
            strokeWidth={0.5}
            d="M3.173.25h13.385a2.914 2.914 0 0 1 2.922 2.923v17.654a2.914 2.914 0 0 1-2.922 2.923H3.173A2.914 2.914 0 0 1 .25 20.827V3.173A2.914 2.914 0 0 1 3.173.25Zm0 1.23c-.946 0-1.692.747-1.693 1.693v17.654c0 .946.747 1.692 1.693 1.692h13.385c.945 0 1.692-.746 1.692-1.692V3.173c0-.914-.744-1.693-1.692-1.693H3.173Z"
        />
        <Path
            fill="#A0A0A0"
            stroke={color}
            strokeWidth={0.5}
            d="M4.47 7.953h4.472a.6.6 0 0 1 .615.615.6.6 0 0 1-.615.616H4.47a.618.618 0 0 1-.615-.616.6.6 0 0 1 .615-.615ZM4.328 12.338h9.605a.6.6 0 0 1 .616.615.6.6 0 0 1-.616.615H4.328a.6.6 0 0 1-.616-.615.6.6 0 0 1 .616-.615ZM4.328 16.72h9.605a.6.6 0 0 1 .616.616.6.6 0 0 1-.616.615H4.328a.6.6 0 0 1-.616-.615.6.6 0 0 1 .616-.615Z"
        />
    </Svg>
)