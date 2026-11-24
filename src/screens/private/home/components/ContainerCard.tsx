import { Colors } from "@/constants/theme";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "@/assets/fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export type ContainerCardData = {
  id: number;
  title: string;
  content: string;
  highlightedTexts: string[];
};

type Props = {
  item: ContainerCardData;
  cardWidth: number;
  renderTextWithHighlight: (
    text: string,
    highlightedTexts: string[],
  ) => Array<{ text: string; highlighted: boolean }>;
};

export const ContainerCard = ({
  item,
  cardWidth,
  renderTextWithHighlight,
}: Props) => {
  const textParts = renderTextWithHighlight(
    item.content,
    item.highlightedTexts,
  );

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Nested Text so highlights wrap like one paragraph (not flex chunks). */}
      <Text style={styles.content}>
        {textParts.map((part, index) => (
          <Text
            key={index}
            style={part.highlighted ? styles.highlightedText : undefined}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.welcomeCardHome,
    borderRadius: 16,
    padding: wp(3),
    justifyContent: "center",
    minHeight: 160,
  },
  title: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    marginBottom: hp(1.2),
    lineHeight: 20,
  },
  content: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  highlightedText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.bold,
    fontWeight: "700",
  },
});
