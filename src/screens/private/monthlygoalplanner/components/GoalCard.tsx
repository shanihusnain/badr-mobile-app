import { Colors } from "@/constants/theme";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";

export type GoalCardData = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  item: GoalCardData;
  /** Pass the computed card width from the parent so nothing is hardcoded */
  cardWidth: number;
};

export const GoalCard = ({ item, cardWidth }: Props) => {
  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <Text style={styles.title}>{item.title}</Text>
      <TopSpace top={16} />
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    minHeight: 180,
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
