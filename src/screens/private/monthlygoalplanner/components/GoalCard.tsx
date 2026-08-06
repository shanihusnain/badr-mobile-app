import { Colors } from "@/constants/theme";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";

export type GoalCardData = {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
};

type Props = {
  item: GoalCardData;
  /** Pass the computed card width from the parent so nothing is hardcoded */
  cardWidth: number;
};

export const GoalCard = ({ item, cardWidth }: Props) => {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <TopSpace top={12} />
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: Colors.light.white,
    fontSize: 18,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  description: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
    fontWeight: "400",
  },
});
