import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Blur,
  Canvas,
  FillType,
  Path as SkiaPath,
  Skia,
} from "@shopify/react-native-skia";

const THUMBS_PATH =
  "M11.378 5.894a.333.333 0 0 1 .35-.153l.056.012a1.7 1.7 0 0 1 .635.277c.19.134.349.306.466.504a1.613 1.613 0 0 1 .146 1.321l-.275.84h.493c1.146 0 1.956 1.096 1.593 2.158l-.676 1.979a1.378 1.378 0 0 1-.513.68c-.24.169-.527.26-.823.26h-2.293a1.98 1.98 0 0 1-1.225-.423.746.746 0 0 1-.28.308.773.773 0 0 1-.406.114h-.975a.768.768 0 0 1-.536-.216.732.732 0 0 1-.222-.524V9.436c0-.41.34-.74.758-.74h2.024a.11.11 0 0 0 .094-.054l1.61-2.748ZM9.385 12.57l.296.253c.237.202.541.314.856.314h2.293c.16 0 .314-.05.444-.14.129-.09.225-.22.276-.367l.675-1.978a.981.981 0 0 0-.141-.905 1.022 1.022 0 0 0-.366-.307 1.05 1.05 0 0 0-.47-.11h-.937a.332.332 0 0 1-.263-.13.313.313 0 0 1-.047-.284l.411-1.254a.982.982 0 0 0-.048-.733 1.02 1.02 0 0 0-.547-.505l-1.483 2.533a.75.75 0 0 1-.278.273.773.773 0 0 1-.38.1h-.291v3.24Zm-.65-3.24H7.65a.11.11 0 0 0-.077.03.104.104 0 0 0-.031.076v3.595c0 .058.048.106.108.106h.975a.11.11 0 0 0 .077-.031.104.104 0 0 0 .032-.075V9.33Z";

const RING_PATH =
  "M10.624 16.718a6.094 6.094 0 1 0 0-12.188 6.094 6.094 0 0 0 0 12.188Zm0 .53a6.624 6.624 0 1 0 0-13.247 6.624 6.624 0 0 0 0 13.247Z";

const ARTBOARD = 22;
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
    .transform(Skia.Matrix().scale(scale, scale))
    .transform(Skia.Matrix().translate(padPx, padPx));
  if (evenOdd) {
    builder.setFillType(FillType.EvenOdd);
  }
  return builder.build();
}

export const LongestStreakBorder = ({
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

  const { thumbsPath, ringPath } = useMemo(() => {
    return {
      thumbsPath: makeScaledPath(THUMBS_PATH, scale, padPx),
      ringPath: makeScaledPath(RING_PATH, scale, padPx, true),
    };
  }, [padPx, scale]);

  if (!thumbsPath || !ringPath) return null;

  const paths = [thumbsPath, ringPath];

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
              key={`longest-streak-glow-${layer.blur}-${index}`}
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
            key={`longest-streak-core-${index}`}
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
