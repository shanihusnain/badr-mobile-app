import PrimaryButton from "@/components/atoms/Primary-button";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { Colors } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createTeamStyles as styles } from "../styles";
import type { TeamBanner } from "../teamBannerMockData";

const HEADER_HEIGHT = 100;
const CIRCLE_SIZE = 200;

type ChooseCircularImageStepProps = {
  initialItems: TeamBanner[];
  swipeHintText: string;
  onNext: (uri: string) => void;
  /** Optional hero image behind the transparent header (steps 03/04). */
  headerImage?: ImageSourcePropType;
};

export function ChooseCircularImageStep({
  initialItems,
  swipeHintText,
  onNext,
  headerImage,
}: ChooseCircularImageStepProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [items, setItems] = useState<TeamBanner[]>(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedItem = items[activeIndex] ?? items[0];
  const carouselHeight = CIRCLE_SIZE + 8;

  const handleUpload = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const uploaded: TeamBanner = {
      id: `upload-${Date.now()}`,
      uri: result.assets[0].uri,
    };

    setItems((current) => [uploaded, ...current]);
    setActiveIndex(0);
  }, []);

  return (
    <View style={styles.screen}>
      {headerImage ? (
        <ImageBackground
          source={headerImage}
          style={headerStyles.heroImage}
          contentFit="cover"
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "rgba(8, 26, 47, 0.35)",
              "rgba(8, 26, 47, 0.75)",
              Colors.light.blackBackground,
            ]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </ImageBackground>
      ) : null}

      <View
        style={[
          styles.bannerContent,
          {
            paddingTop: headerImage ? HEADER_HEIGHT + 24 : HEADER_HEIGHT + 12,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View style={styles.bannerBody}>
          <View style={styles.carouselWrap}>
            <Carousel
              key={items[0]?.id}
              width={windowWidth}
              height={carouselHeight}
              style={{ width: windowWidth }}
              data={items}
              loop
              defaultIndex={0}
              pagingEnabled
              snapEnabled
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.72,
                parallaxScrollingOffset: windowWidth * 0.62,
              }}
              onSnapToItem={setActiveIndex}
              renderItem={({ item, index }) => {
                const isActive = index === activeIndex;

                return (
                  <View
                    style={{
                      width: windowWidth,
                      height: carouselHeight,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={[
                        styles.bannerCircle,
                        {
                          width: CIRCLE_SIZE,
                          height: CIRCLE_SIZE,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.bannerImage}
                        contentFit="cover"
                      />
                      {!isActive ? (
                        <View style={styles.bannerDimOverlay} />
                      ) : null}
                    </View>
                  </View>
                );
              }}
            />
          </View>

          <View style={styles.swipeHintRow}>
            <View style={styles.swipeChevrons}>
              {[0.28, 0.55, 1].map((opacity, i) => (
                <Ionicons
                  key={`left-${i}`}
                  name="chevron-back"
                  size={16}
                  color={Colors.light.white}
                  style={{ opacity }}
                />
              ))}
            </View>

            <View style={styles.swipeCenter}>
              <View style={styles.swipeArrows}>
                <Ionicons
                  name="arrow-back"
                  size={11}
                  color={Colors.light.white}
                />
                <Ionicons
                  name="arrow-forward"
                  size={11}
                  color={Colors.light.white}
                />
              </View>
              <MaterialCommunityIcons
                name="hand-pointing-up"
                size={30}
                color={Colors.light.white}
              />
            </View>

            <View style={styles.swipeChevrons}>
              {[1, 0.55, 0.28].map((opacity, i) => (
                <Ionicons
                  key={`right-${i}`}
                  name="chevron-forward"
                  size={16}
                  color={Colors.light.white}
                  style={{ opacity }}
                />
              ))}
            </View>
          </View>

          <Text style={styles.swipeHintText}>{swipeHintText}</Text>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <SecondaryButton
            text="UPLOAD YOUR OWN"
            onPress={handleUpload}
            variant="green"
          />
        </View>

        <View style={styles.bannerFooter}>
          <PrimaryButton text="NEXT" onPress={() => onNext(selectedItem.uri)} />
        </View>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "38%",
  },
});
