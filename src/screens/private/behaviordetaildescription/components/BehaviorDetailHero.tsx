import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { behaviorDetailStyles as styles } from "../styles";

const HERO_RING_SIZE = 100;

type BehaviorDetailHeroProps = {
  title: string;
  imageSource: Parameters<typeof ImageBackground>[0]["source"] | null;
  /** expo-image BlurHash while a remote hero URI is loading. */
  blurhash?: string | null;
  showImage?: boolean;
  height: number;
  periodCount?: number;
  showHeroRing?: boolean;
};

export function BehaviorDetailHero({
  title,
  imageSource,
  blurhash = null,
  showImage = true,
  height,
  periodCount,
  showHeroRing = false,
}: BehaviorDetailHeroProps) {
  const trimmedBlurhash = blurhash?.trim() || null;

  return (
    <ImageBackground
      source={showImage ? imageSource : null}
      placeholder={
        trimmedBlurhash ? { blurhash: trimmedBlurhash } : undefined
      }
      placeholderContentFit="cover"
      transition={300}
      contentFit="cover"
      style={[styles.heroSticky, styles.heroImage, { height }]}
    >
      <LinearGradient
        colors={[
          "rgba(8, 26, 47, 0.25)",
          "rgba(8, 26, 47, 0.01)",
          "transparent",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "transparent",
          "rgba(8, 26, 47, 0.02)",
          "rgba(8, 26, 47, 0.28)",
          Colors.light.blackBackground,
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {showHeroRing && periodCount != null ? (
        <View style={styles.heroRingContainer}>
          <TaperedCircleBorder
            size={HERO_RING_SIZE}
            percentage={`${periodCount}%`}
            progressColor={Colors.light.white}
            borderColor="rgba(255, 255, 255, 0.35)"
            variant="illuminated"
            showCompleteCheckIcon={false}
          >
            <Text style={styles.heroRingCount}>{periodCount}</Text>
          </TaperedCircleBorder>
        </View>
      ) : null}

      <View style={styles.heroTextContainer}>
        <Text style={styles.heroTitle}>{title}</Text>
      </View>
    </ImageBackground>
  );
}
