import * as React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  Blur,
  Canvas,
  Circle as SkiaCircle,
} from "@shopify/react-native-skia";
import { Colors } from "@/constants/theme";

const SIZE = 95;
const CX = 47.5;
const CY = 47.337;
const RING_R = 21.75;

const GLOW_LAYERS = [
  { opacity: 0.22, blur: 10, strokeWidth: 8 },
  { opacity: 0.35, blur: 6, strokeWidth: 5 },
  { opacity: 0.55, blur: 3, strokeWidth: 2.5 },
] as const;

const RING_PATH =
  "M26.15 47.337c.119 15.165 15.451 25.455 29.455 19.689 9.316-3.802 14.753-13.969 12.773-23.861-1.296-6.924-6.223-12.993-12.677-15.75-.293-.118-.687-.29-.98-.393l-.498-.174c-.38-.142-.87-.275-1.26-.393-.164-.052-.596-.146-.77-.19-.147-.034-.367-.091-.515-.116-13.173-2.739-25.565 7.797-25.528 21.188Zm-.65 0C25.47 35.176 35.41 25.433 47.479 25.5c13.81-.075 24.285 12.522 21.6 26.148-1.588 8.611-8.712 15.795-17.294 17.413-13.571 2.757-26.407-7.818-26.283-21.724Z";

function SoftGoldenRingGlow() {
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {GLOW_LAYERS.map((layer) => (
        <SkiaCircle
          key={`fab-glow-${layer.blur}`}
          cx={CX}
          cy={CY}
          r={RING_R}
          color={Colors.light.golden}
          style="stroke"
          strokeWidth={layer.strokeWidth}
          opacity={layer.opacity}
        >
          <Blur blur={layer.blur} mode="decal" />
        </SkiaCircle>
      ))}
    </Canvas>
  );
}

export const HomeScreenGlowyMinusIcon = () => (
  <View style={styles.wrap}>
    <SoftGoldenRingGlow />
    <Svg width={SIZE} height={SIZE} fill="none" style={styles.icon}>
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={3}
        d="M56.5 47.5h-18"
      />
      <Path fill="#fff" d={RING_PATH} />
      <Path stroke="#fff" d={RING_PATH} />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    overflow: "visible",
  },
  icon: {
    ...StyleSheet.absoluteFillObject,
  },
});
