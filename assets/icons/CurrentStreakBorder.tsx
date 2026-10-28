import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Blur,
  Canvas,
  FillType,
  Path as SkiaPath,
  Skia,
} from "@shopify/react-native-skia";

/** Original paths are authored in a 14×14 box (center 6.624). */
const BOLT_PATH =
  "m7.398 2.505-.671 3.718 2.43.008-3.308 5.04.671-4.09-2.43-.009 3.308-4.667Zm0-.627c-.016 0-.032 0-.048.002a.482.482 0 0 0-.257.104.61.61 0 0 0-.155.16l-3.332 4.65a.652.652 0 0 0-.05.651c.101.21.306.343.53.344l1.716.014-.54 3.353a.634.634 0 0 0 .351.691.569.569 0 0 0 .236.051c.187 0 .34-.092.456-.259L9.64 6.6a.653.653 0 0 0 .05-.65.595.595 0 0 0-.53-.345l-1.716-.003.534-2.948a.645.645 0 0 0 .017-.148c0-.34-.256-.616-.577-.627H7.4Z";

const RING_PATH =
  "M6.624 12.983a6.094 6.094 0 1 0 0-12.189 6.094 6.094 0 0 0 0 12.189Zm0 .53a6.624 6.624 0 1 0 0-13.248 6.624 6.624 0 0 0 0 13.247Z";

/** Match LongestStreakBorder so both badges share the same visual diameter. */
const ARTBOARD = 22;
/** Shift 14×14 artwork so its ring center (6.624) lands on 10.624 like Longest. */
const CONTENT_OFFSET = 4;
const GLOW_PAD_VB = 8;
const DEFAULT_GLOW = "#FFAA00";

const GLOW_LAYER_STYLE = [
  { opacity: 0.45, blur: 3.2 },
  { opacity: 0.7, blur: 2 },
  { opacity: 0.95, blur: 1.1 },
] as const;

function makeScaledPath(d: string, scale: number, padPx: number, evenOdd = false) {
  const path = Skia.Path.MakeFromSVGString(d);
  if (!path) return null;
  const builder = Skia.PathBuilder.MakeFromPath(path)
    .transform(Skia.Matrix().translate(CONTENT_OFFSET, CONTENT_OFFSET))
    .transform(Skia.Matrix().scale(scale, scale))
    .transform(Skia.Matrix().translate(padPx, padPx));
  if (evenOdd) {
    builder.setFillType(FillType.EvenOdd);
  }
  return builder.build();
}

export const CurrentStreakBorder = ({
  size = 22,
  glowColor = DEFAULT_GLOW,
}: {
  size?: number;
  /** Bloom tint — same color used by the illuminated ring. Core stays white. */
  glowColor?: string;
}) => {
  const padPx = (size / ARTBOARD) * GLOW_PAD_VB;
  const canvasSize = size + padPx * 2;
  const scale = size / ARTBOARD;

  const { boltPath, ringPath } = useMemo(() => {
    return {
      boltPath: makeScaledPath(BOLT_PATH, scale, padPx),
      ringPath: makeScaledPath(RING_PATH, scale, padPx, true),
    };
  }, [padPx, scale]);

  if (!boltPath || !ringPath) return null;

  const paths = [boltPath, ringPath];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Canvas
        opaque={false}
        style={{
          position: "absolute",
          top: -padPx,
          left: -padPx,
          width: canvasSize,
          height: canvasSize,
        }}
        pointerEvents="none"
      >
        {GLOW_LAYER_STYLE.map((layer) =>
          paths.map((path, index) => (
            <SkiaPath
              key={`current-streak-glow-${layer.blur}-${index}`}
              path={path}
              color={glowColor}
              opacity={layer.opacity}
              style="fill"
            >
              <Blur blur={layer.blur * scale} mode="decal" />
            </SkiaPath>
          )),
        )}
        {paths.map((path, index) => (
          <SkiaPath
            key={`current-streak-core-${index}`}
            path={path}
            color="#FFFFFF"
            style="fill"
          />
        ))}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: "visible",
  },
});
