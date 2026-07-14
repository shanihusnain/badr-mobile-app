import * as React from "react"
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg"
import { Colors } from "@/constants/theme";




export const DashBoardHandHeartIcon = ({
color = Colors.light.white,
size = 23,


} : {
color?: string;
size?: number;}
) => (
  <Svg
    
    width={size}
    height={size}
    fill="none"

  >
    <Path
      fill="url(#a)"
      d="M21.306 15.868a11.23 11.23 0 0 1-2.335.406c-.46.053-.94.106-1.424.179-.456.065-.936.158-1.404.248-.769.176-1.552.285-2.34.324h-2.63a.411.411 0 0 1-.356-.203.402.402 0 0 1 0-.406.411.411 0 0 1 .355-.203h2.631c.736-.04 1.466-.144 2.184-.308.435-.085.878-.167 1.318-.236.242-.21.3-.268.3-.47a.928.928 0 0 0 0-.106 1.026 1.026 0 0 0-.53-.812h-.041a.262.262 0 0 1-.07-.025l-.066-.044h-.115a.414.414 0 0 0-.107 0h-3.398c-1.88 0-4.728-.467-6.567-1.782-1.108-.813-4.926-.67-6.711-.524v6.017c1.08 0 2.73.134 6.025 1.153 3.296 1.019 5.439 1.173 7.122.572.455-.166 1.375-.406 2.536-.715 2.052-.543 6.875-1.822 7.224-2.48.07-.154.169-.438 0-.6-.168-.163-.763-.285-1.6.015Z"
    />
    <Path
      fill="url(#b)"
      d="M13.614.002c-.776 0-1.525.277-2.11.78a3.244 3.244 0 0 0-4.446.206 3.169 3.169 0 0 0-.89 2.201c0 1.535 3.407 7.369 5.336 7.369 1.929 0 5.336-5.834 5.336-7.365a3.178 3.178 0 0 0-.947-2.255 3.249 3.249 0 0 0-2.28-.936Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={11.5}
        x2={11.5}
        y1={11.793}
        y2={20}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={11.504}
        x2={11.504}
        y1={0}
        y2={10.558}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#00EAD2" />
        <Stop offset={1} stopColor="#00B0E8" />
      </LinearGradient>
    </Defs>
  </Svg>
)
