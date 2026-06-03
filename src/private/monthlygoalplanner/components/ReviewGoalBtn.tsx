import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const ReviewGoalBtn = ({
  reviewItem,
  reviewExpanded,
  handleReviewItemPress,
}: {
  reviewItem: { id: string; name: string; label: string };
  reviewExpanded: string | null;
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
          name={
            reviewExpanded === reviewItem?.name ? "chevron-up" : "chevron-down"
          }
          size={24}
          color={Colors.light.white}
        />
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  reviewHeader: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 6,
    marginBottom: 10,
  },
  reviewHeaderPressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewHeaderText: {
    fontSize: 16,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    flex: 1,
  },
});
