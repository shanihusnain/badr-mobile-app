import { Text, View } from "react-native";
import type {
  BehaviorDetailQuote,
  BehaviorDetailRecommendation,
} from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";
import { BehaviorDetailQuoteBlock } from "./BehaviorDetailQuoteBlock";

type BehaviorDetailImpactCardProps = {
  title: string;
  body: string;
  quote?: BehaviorDetailQuote;
};

export function BehaviorDetailImpactCard({
  title,
  body,
  quote,
}: BehaviorDetailImpactCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {quote ? <BehaviorDetailQuoteBlock quote={quote} /> : null}
    </View>
  );
}

type BehaviorDetailRecommendationsCardProps = {
  title: string;
  intro: string;
  recommendations: BehaviorDetailRecommendation[];
  quote?: BehaviorDetailQuote;
  closing?: string;
};

export function BehaviorDetailRecommendationsCard({
  title,
  intro,
  recommendations,
  quote,
  closing,
}: BehaviorDetailRecommendationsCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{intro}</Text>
      <View style={styles.recommendationList}>
        {recommendations.map((item, index) => (
          <View key={`${index}-${item.text.slice(0, 12)}`} style={styles.recommendationRow}>
            <Text style={styles.recommendationBullet}>◆</Text>
            <Text style={styles.recommendationText}>{item.text}</Text>
          </View>
        ))}
      </View>
      {quote ? <BehaviorDetailQuoteBlock quote={quote} /> : null}
      {closing ? <Text style={styles.closingText}>{closing}</Text> : null}
    </View>
  );
}
