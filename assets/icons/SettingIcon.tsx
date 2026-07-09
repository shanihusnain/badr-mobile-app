import { Colors } from "@/constants/theme"
import * as React from "react"
import Svg, { Path } from "react-native-svg"





export const SettingIcon = ({
    size = 24,
    Color = Colors.light.subtext,
}: {
    size?: number;
    Color?: string;




}) => (
   <Svg
 
    width={size}
    height={size}
    fill="none"
   
  >
    <Path
      fill={Color}
      stroke={Color}
      strokeWidth={0.5}
      d="M11.756 15.774a1.25 1.25 0 1 0 .488 2.453 1.25 1.25 0 0 0-.488-2.453Zm7-6a1.25 1.25 0 1 0 .487 2.452 1.25 1.25 0 0 0-.487-2.452Zm-14-2a1.25 1.25 0 1 0 .487 2.451 1.25 1.25 0 0 0-.487-2.45Zm6.494 11.87-.165-.059a2.75 2.75 0 0 1 0-5.17l.165-.06V3a.75.75 0 0 1 1.5 0v11.355l.165.06a2.751 2.751 0 0 1 0 5.17l-.165.06V21a.75.75 0 0 1-1.5 0v-1.355Zm7-6-.165-.059a2.75 2.75 0 0 1 0-5.17l.165-.06V3a.75.75 0 0 1 1.5 0v5.355l.165.06a2.75 2.75 0 0 1 0 5.17l-.165.06V21a.75.75 0 0 1-1.5 0v-7.355Zm-14-2-.165-.059a2.75 2.75 0 0 1 0-5.17l.165-.06V3a.75.75 0 0 1 1.5 0v3.355l.165.06a2.751 2.751 0 0 1 0 5.17l-.165.06V21a.75.75 0 0 1-1.5 0v-9.355Z"
    />
  </Svg>
)
