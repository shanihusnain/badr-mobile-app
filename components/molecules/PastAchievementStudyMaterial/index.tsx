import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export type StudyMaterialItem = {
  id: number;
  thumbnail: string;
  type: "video" | "podcast" | "article";
  description: string;
};

export type PastAchievementStudyMaterialProps = {
  items: StudyMaterialItem[];
  isDetailed?: boolean;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
  title?: string;
};

const STUDY_CARD_WIDTH_RATIO = 0.42;
const STUDY_CARD_GAP = 10;

function getStudyTypeLabel(type: StudyMaterialItem["type"]): string {
  if (type === "video") return "VIDEO";
  if (type === "podcast") return "PODCAST";
  return "ARTICLE";
}

type StudyMaterialCardProps = {
  item: StudyMaterialItem;
  width: number;
};

function StudyMaterialCard({ item, width }: StudyMaterialCardProps) {
  return (
    <View style={[styles.studyCard, { width }]}>
      <View style={styles.studyThumbnailWrap}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.studyThumbnail}
          contentFit="cover"
        />
        <View style={styles.studyTypeBadge}>
          <Text style={styles.studyTypeBadgeText}>
            {getStudyTypeLabel(item.type)}
          </Text>
        </View>
      </View>
      <Text style={styles.studyDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </View>
  );
}

export function PastAchievementStudyMaterial({
  items,
  isDetailed = false,
  showSeeAll = true,
  onSeeAllPress,
  title,
}: PastAchievementStudyMaterialProps) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const studyCardWidth = screenWidth * STUDY_CARD_WIDTH_RATIO;
  const sectionTitle = title ?? t("progressLogging.studyMaterial");

  if (isDetailed || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TopSpace top={16} />
      <View style={styles.headerRow}>
        <Text style={styles.title}>{sectionTitle}</Text>
        {showSeeAll ? (
          <TouchableOpacity
            style={styles.seeAllRow}
            onPress={onSeeAllPress}
            activeOpacity={onSeeAllPress ? 0.7 : 1}
            disabled={!onSeeAllPress}
          >
            <Text style={styles.title}>See All</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={Colors.light.white}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <TopSpace top={16} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={[styles.listContent, { gap: STUDY_CARD_GAP }]}
        decelerationRate="fast"
        snapToInterval={studyCardWidth + STUDY_CARD_GAP}
        snapToAlignment="start"
        nestedScrollEnabled
      >
        {items.map((item) => (
          <StudyMaterialCard
            key={String(item.id)}
            item={item}
            width={studyCardWidth}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },
  listContent: {
    paddingRight: 4,
    alignItems: "flex-start",
  },
  studyCard: {
    padding: 8,
    paddingBottom: 12,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    gap: 8,
  },
  studyThumbnailWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  studyThumbnail: {
    width: "100%",
    height: "100%",
  },
  studyTypeBadge: {
    position: "absolute",
    right: 0,
    top: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  studyTypeBadgeText: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  studyDescription: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 16,
  },
});
