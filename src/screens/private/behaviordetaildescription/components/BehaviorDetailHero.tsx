import { TaperedCircleBorder } from "@/components/atoms/TaperedCircleBorder";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { behaviorDetailStyles as styles } from "../styles";

const HERO_RING_SIZE = 112;

type BehaviorDetailHeroProps = {
  title: string;
  imageSource: Parameters<typeof ImageBackground>[0]["source"];
  height: number;
  periodCount?: number;
  showHeroRing?: boolean;
};

export function BehaviorDetailHero({
  title,
  imageSource,
  height,
  periodCount,
  showHeroRing = false,
}: BehaviorDetailHeroProps) {
  return (
    <ImageBackground
      source={imageSource}
      contentFit="cover"
      style={[styles.heroSticky, styles.heroImage, { height }]}
    >
      <LinearGradient
        colors={["rgba(8, 26, 47, 0.72)", "rgba(8, 26, 47, 0.2)", "transparent"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[
          "transparent",
          "rgba(8, 26, 47, 0.35)",
          "rgba(8, 26, 47, 0.82)",
          Colors.light.blackBackground,
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {showHeroRing && periodCount != null ? (
        <View style={styles.heroRingContainer}>
          <TaperedCircleBorder
            size={HERO_RING_SIZE}
            percentage="0"
            progressColor={Colors.light.white}
            borderColor="rgba(255, 255, 255, 0.35)"
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
