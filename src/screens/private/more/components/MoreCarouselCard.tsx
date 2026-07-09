import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { moreCarouselStyles as styles, width } from "../style";

type CarouselItem = {
  title: string;
  description: string;
  route?: string;
};

type MoreCarouselCardProps = {
  item: CarouselItem;
  onPress: () => void;
  cardWidth?: number;
};

export default function MoreCarouselCard({
  item,
  onPress,
  cardWidth = width,
}: MoreCarouselCardProps) {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.8}
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
    </TouchableOpacity>
  );
}
