import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme"

export const SponsringOrphanWhiteIcon = ({

    color = Colors.light.white,
    size = 16,
  }: {
    color?: string
    size?: number
  }) => (
    <Svg
      
      width={size}
      height={size}
      viewBox="0 0 16 16"
    
    >
    <G fill={color} fillRule="evenodd" clipPath="url(#a)" clipRule="evenodd">
      <Path d="M4.484-.006c1.15 0 2.07.928 2.07 2.081a2.075 2.075 0 0 1-4.147 0c0-1.152.927-2.08 2.077-2.08ZM2.951 5.914h2.89l4.18 5.465-.414.38-3.455-3.91-.497.435.842.953v6.266c0 .275-.215.49-.49.49H3.67c-.264 0-.463-.217-.49-.524l-.717-9.085c-.017-.237.218-.47.49-.47ZM12.289 10.178h1.614c.077 0 .148.066.144.11l-.42 5.195c-.005.12-.075.167-.138.166h-1.332a.136.136 0 0 1-.137-.138l-.007-3.71.386-.262-.372-.553-1.939 1.32-.041-.049 2.242-2.08ZM13.03 5.906c.588 0 1.045.465 1.045 1.047 0 .582-.457 1.047-1.045 1.047a1.036 1.036 0 0 1-1.038-1.047c0-.582.459-1.047 1.038-1.047Z" />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h16v16H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

