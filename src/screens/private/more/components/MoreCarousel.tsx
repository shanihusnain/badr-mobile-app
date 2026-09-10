import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, ImageSourcePropType } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { moreCarouselStyles as styles, width } from "../style";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import extendedMembershipImage from "@/assets/images/extendedmembershipcoursal.png";
import giftOfBadrImage from "@/assets/images/giftofbadarcoursal.png";
import joinonlinecommunityImage from "@/assets/images/joinonlinecommunitycoursal.png";
import { Image } from "expo-image";

type CarouselItem = {
  title: string;
  description: string;
  route?: string;
  image?: ImageSourcePropType; // ← Add your image here, e.g. require('@/assets/icons/your-image.png')
};

const CAROUSEL_DATA: CarouselItem[] = [
  {
    title: "EXTEND MEMBERSHIP",
    description:
      "Save up to 15% per month by purchasing an extended pre-paid period.",
    route: "/(private)/membershipextension",
    image: extendedMembershipImage,
  },
  {
    title: "GIVE THE GIFT OF BADR",
    description:
      "Get 1 month free when you give the gift of a Badr membership.",
    route: "/(private)/giftnewmember",
    image: giftOfBadrImage,
  },
  {
    title: "JOIN OUR ONLINE COMMUNITY",
    description: "Connect with others and grow together.",
    image: joinonlinecommunityImage,
  },
];

export default function MoreCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const handleCardPress = (item: CarouselItem) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
      >
        {CAROUSEL_DATA.map((item, index) => (
          <Pressable
            key={index}
            style={[styles.cardContainer, { width }]}
            onPress={() => handleCardPress(item)}
          >
            <View style={styles.card}>
              {item.image && (
                <View style={styles.cardImageContainer}>
                  <Image
                    source={item.image}
                    style={styles.cardImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["rgba(8, 26, 47, 0)", "rgba(8, 26, 47, 0.8)", "rgba(8, 26, 47, 1)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.bottomGradient}
                  />
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={Colors.light.white}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dotContainer}>
        {CAROUSEL_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
