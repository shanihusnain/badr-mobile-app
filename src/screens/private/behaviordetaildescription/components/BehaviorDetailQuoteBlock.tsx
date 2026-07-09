import { JournalBookIcon } from "@/assets/icons/JournalBookIcon";
import { Colors } from "@/constants/theme";
import { Text, View } from "react-native";
import type { BehaviorDetailQuote } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

type BehaviorDetailQuoteBlockProps = {
  quote: BehaviorDetailQuote;
};

export function BehaviorDetailQuoteBlock({ quote }: BehaviorDetailQuoteBlockProps) {
  return (
    <View style={styles.quoteBlock}>
      <JournalBookIcon color={Colors.light.green} size={18} />
      <View style={styles.quoteTextWrap}>
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteSource}>{quote.source}</Text>
      </View>
    </View>
  );
}
