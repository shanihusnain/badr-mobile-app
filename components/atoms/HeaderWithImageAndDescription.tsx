import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ImageBackground, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import Header from "../Header";

type Props = {
  /** Small title shown in the top nav bar (e.g. "TAHIYYAT AL-WUDHU") */
  navTitle: string;
  /** Large bold hero title shown at the bottom of the image */
  heroTitle: string;
  /** Short description shown just below the hero title */
  description: string;
  imageSource?: ImageSource | any;
  onBackPress?: () => void;
  imageHeight?: number;
};

export const HeaderWithImageAndDescription = ({
  navTitle,
  heroTitle,
  description,
  imageSource,
  onBackPress,
  imageHeight = 360,
}: Props) => {
  return (
    <ImageBackground
      source={imageSource}
      style={[styles.imageBackground, { height: imageHeight }]}
      contentFit="cover"
    >
      {/* Dark gradient overlay: transparent top → blackBackground at bottom */}
      <LinearGradient
        colors={["rgba(8, 26, 47, 0.1)", "rgba(8, 26, 47, 0.6)", "#081A2F"]}
        locations={[0, 0.6, 1]}
        start={[0, 0]}
        end={[0, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Nav bar: back button + centered title */}
      <Header
        title={navTitle}
        backgroundColor="transparent"
        onBackPress={onBackPress}
        arrowBg={Colors.light.dullWhiteOpacity}
      />

      {/* Hero title + description pinned to the bottom of the image */}
      <View style={styles.textBlock}>
        <Text style={styles.heroTitle}>{heroTitle}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: 360,
    justifyContent: "space-between",
  },
  textBlock: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  heroTitle: {
    color: Colors.light.white,
    fontSize: 18,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 10,
  },
  description: {
    color: Colors.light.dullWhite,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
  },
});
