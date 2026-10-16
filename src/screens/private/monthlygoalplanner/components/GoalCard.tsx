import { Colors } from "@/constants/theme";
import { View, Text, StyleSheet, Platform } from "react-native";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { rfs, ms } from "@/src/utils/responsive";

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
        <TopSpace top={ms(12)} />
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 8,
    height: ms(185),
    paddingVertical: ms(15),
    paddingHorizontal: ms(12),
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: ms(16),
    marginTop: ms(5),
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: Colors.light.white,
    fontSize: rfs(18),
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    lineHeight: rfs(22),
  },
  description: {
    color: Colors.light.white,
    fontSize: rfs(14),
    fontFamily: fonts.primary.regular,
    lineHeight: rfs(21),
    fontWeight: "400",
    letterSpacing: 0.1,
  },
});
