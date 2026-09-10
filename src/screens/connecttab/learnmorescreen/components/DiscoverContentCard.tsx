import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getDiscoverTypeLabel,
  type DiscoverContentItem,
} from "../mockData";

type DiscoverContentCardProps = {
  item: DiscoverContentItem;
  onPress?: (item: DiscoverContentItem) => void;
};

export function DiscoverContentCard({
  item,
  onPress,
}: DiscoverContentCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
    >
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
        />
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {getDiscoverTypeLabel(item.type)}
          </Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={3}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    padding: 8,
    paddingBottom: 12,
    gap: 8,
  },
  thumbnailWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    right: 0,
    top: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(8, 26, 47, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  title: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 16,
  },
});
