import { Colors } from "@/constants/theme";
import * as React from "react"
import Svg, { Path } from "react-native-svg"




export const GiftIcon = ({
   
     Color = Colors.light.subtext,
    size = 24





}: {
    Color?: string;
    size?: number;
  }) => (
  <Svg
    width={size}
    height={size}
    fill="none"

  >
    <Path
      fill={Color}
      stroke={Color}
      strokeWidth={0.6}
      d="M13.85 2.364a3.19 3.19 0 0 1 3.842 2.896l.008.239a3.151 3.151 0 0 1-.32 1.369l-.21.431H18a2.7 2.7 0 0 1 2.7 2.7v2a.7.7 0 0 1-.7.7h-1.3V19a2.701 2.701 0 0 1-2.7 2.7H8A2.7 2.7 0 0 1 5.3 19v-6.3H4a.7.7 0 0 1-.7-.7v-2A2.7 2.7 0 0 1 6 7.3h.83l-.21-.431a3.15 3.15 0 0 1-.314-1.192L6.3 5.5a3.191 3.191 0 0 1 5.484-2.23l.216.223.216-.224a3.19 3.19 0 0 1 1.635-.904ZM6.7 19A1.302 1.302 0 0 0 8 20.3h3.3v-7.6H6.7V19Zm6 1.3H16a1.3 1.3 0 0 0 1.3-1.3v-6.3h-4.6v7.6ZM6 8.7A1.3 1.3 0 0 0 4.7 10v1.3h6.6V8.7H6Zm6.7 2.6h6.6V10A1.3 1.3 0 0 0 18 8.7h-5.3v2.6ZM10.19 3.837A1.801 1.801 0 0 0 8.5 6.997a1.8 1.8 0 0 0 1 .303h1.8V5.5a1.8 1.8 0 0 0-1.112-1.663Zm4.663-.102a1.802 1.802 0 0 0-1.85.765 1.8 1.8 0 0 0-.302 1v1.8h1.8a1.8 1.8 0 0 0 .352-3.565Z"
    />
  </Svg>
)
