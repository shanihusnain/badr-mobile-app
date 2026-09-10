import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";

export const UpComingDuhrIcon = ({ color = Colors.light.white, size = 16 }: { color?: string; size?: number }) => (
  <Svg
   
    width={size}
    height={size}
    fill="none"
   
  >
    <G clipPath="url(#a)">
      <Path
        fill={color}
        d="m2.909 12.526-.566.565a.4.4 0 0 0 .566.566l.565-.566a.4.4 0 0 0-.565-.565ZM8 1.6a.4.4 0 0 0 .4-.4V.4a.4.4 0 0 0-.8 0v.8c0 .221.18.4.4.4ZM2.909 3.474a.399.399 0 0 0 .565 0 .4.4 0 0 0 0-.565l-.565-.566a.4.4 0 0 0-.566.566l.566.565ZM1.2 7.6H.4a.4.4 0 0 0 0 .8h.8a.4.4 0 0 0 0-.8ZM8 14.4a.4.4 0 0 0-.4.4v.8a.4.4 0 0 0 .8 0v-.8a.4.4 0 0 0-.4-.4ZM8 3.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6ZM8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.6-4.4h-.8a.4.4 0 0 0 0 .8h.8a.4.4 0 0 0 0-.8Zm-2.509-5.257-.565.566a.4.4 0 0 0 .565.565l.566-.565.006-.006a.4.4 0 0 0-.572-.56Zm0 10.183a.4.4 0 0 0-.565.565l.565.566a.398.398 0 0 0 .566 0 .4.4 0 0 0 0-.566l-.566-.565Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill={color} d="M0 0h16v16H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

