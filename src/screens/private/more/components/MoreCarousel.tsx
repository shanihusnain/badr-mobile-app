import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { moreCarouselStyles as styles, width } from "../style";
import { useRouter } from "expo-router";

type CarouselItem = {
  title: string;
  description: string;
  route?: string;
};

const CAROUSEL_DATA: CarouselItem[] = [
  {
    title: "EXTEND MEMBERSHIP",
    description: "Save up to 15% per month by purchasing an extended pre-paid period.",
    route: "/(private)/membershipextension",
  },
  {
    title: "GIVE THE GIFT OF BADR",
    description: "Get 1 month free when you give the gift of a Badr membership.",
    route: "/(private)/giftnewmember",
  },
  {
    title: "JOIN OUR ONLINE COMMUNITY",
    description: "Connect with others and grow together.",
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
              <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
                <Feather name="chevron-right" size={24} color={Colors.light.white} />
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
