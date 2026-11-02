import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { Colors } from "@/constants/theme";
export const SadaqahDropDownKnowledgeIcon = ({
  color = Colors.light.white,
  size = 24,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
  >

    <G clipPath="url(#a)">
      <Path
        fill="#fff"
        stroke="#fff"
        strokeWidth={0.3}
        d="M8.773 4.4c-2.73 0-4.95 2.22-4.95 4.95a4.91 4.91 0 0 0 2.474 4.288v1.487A2.478 2.478 0 0 0 8.772 17.6a2.477 2.477 0 0 0 2.474-2.475v-1.487a4.91 4.91 0 0 0 2.475-4.288c0-2.73-2.22-4.95-4.95-4.95h.002Zm1.684 8.412a.55.55 0 0 0-.31.495v1.818c0 .758-.616 1.376-1.375 1.376a1.377 1.377 0 0 1-1.375-1.376v-1.818a.55.55 0 0 0-.31-.495A3.822 3.822 0 0 1 4.92 9.35a3.855 3.855 0 0 1 3.85-3.85 3.855 3.855 0 0 1 3.85 3.85c0 1.487-.83 2.813-2.165 3.463h.001ZM3.911 5.038a.548.548 0 0 1-.389-.16l-1.36-1.362a.55.55 0 1 1 .777-.777l1.36 1.36a.55.55 0 0 1-.388.94Zm4.312-2.563V.55a.55.55 0 1 1 1.1 0v1.925a.55.55 0 1 1-1.1 0Zm7.161 1.041-1.361 1.361a.548.548 0 0 1-.778 0 .55.55 0 0 1 0-.777l1.362-1.361a.55.55 0 1 1 .777.777Zm-3.883 5.49a.55.55 0 1 1-1.09.137 1.644 1.644 0 0 0-1.43-1.43.55.55 0 1 1 .135-1.092 2.745 2.745 0 0 1 2.386 2.386Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h18v18H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)

