import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const FlowCardDuhrIcon = ({ color = Colors.light.white, size = 20 }: { color?: string; size?: number }) => (
    <Svg
  
    width={size}
    height={size}
    fill="none"

  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M7.495 12.6v-1.35a.435.435 0 0 0-.869 0v1.35a.435.435 0 0 0 .87 0Zm2.31-2.307.955.956a.435.435 0 0 0 .614-.615l-.956-.956a.435.435 0 0 0-.614.615Zm-6.443.956.956-.956a.435.435 0 0 0-.614-.615l-.956.956a.435.435 0 0 0 .614.615ZM7.05 3.91a3.068 3.068 0 0 0-3.066 3.066 3.068 3.068 0 0 0 3.066 3.066 3.068 3.068 0 0 0 3.066-3.066A3.068 3.068 0 0 0 7.05 3.911Zm4.324 3.46h1.352a.435.435 0 0 0 0-.87h-1.352a.435.435 0 0 0 0 .87Zm-9.979 0h1.352a.435.435 0 0 0 0-.87H1.395a.435.435 0 0 0 0 .87Zm1.353-4.134.956.956a.435.435 0 0 0 .614-.615l-.956-.955a.434.434 0 1 0-.614.614Zm7.67.956.957-.956a.435.435 0 0 0-.615-.614l-.956.955a.434.434 0 1 0 .614.615Zm-2.923-1.57V1.27a.435.435 0 0 0-.869 0v1.352a.435.435 0 0 0 .87 0Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M.094 0h13.905v13.905H.094z" />
      </ClipPath>
    </Defs>
  </Svg>
)

