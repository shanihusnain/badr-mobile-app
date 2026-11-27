import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { ms } from "@/src/utils/responsive";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const ReviewGoalBtn = ({
  reviewItem,
  reviewExpanded,
  handleReviewItemPress,
}: {
  reviewItem: { id: string; name: string; label: string };
  /** True when this category section is expanded. */
  reviewExpanded: boolean;
  handleReviewItemPress: (item: {
    id: string;
    name: string;
    label: string;
  }) => void;
}) => {
  return (
    <View style={styles.reviewHeader} key={reviewItem?.id}>
      <Pressable
        onPress={() => handleReviewItemPress(reviewItem)}
        style={styles.reviewHeaderPressable}
      >
        <Text style={styles.reviewHeaderText}>{reviewItem.label}</Text>
        <Feather
          name={reviewExpanded ? "chevron-up" : "chevron-down"}
          size={ms(24)}
          color={Colors.light.white}
        />
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  reviewHeader: {
    paddingHorizontal: ms(15),
    paddingVertical: ms(8),
    backgroundColor: Colors.light.calendarBg,
    borderRadius: ms(6),
  },
  reviewHeaderPressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewHeaderText: {
    fontSize: ms(16),
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    flex: 1,
    letterSpacing: 0.1,
    lineHeight: ms(20),
  },
});
