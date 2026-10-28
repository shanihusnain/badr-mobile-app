import type { BehaviorDetailContentBlock } from "@/src/api/queries/useGetJournalBehaviorDetils";
import { Text, View } from "react-native";
import { behaviorDetailStyles as styles } from "../styles";
import { BehaviorDetailQuoteBlock } from "./BehaviorDetailQuoteBlock";

function splitQuote(text: string): { text: string; source?: string } {
  const match = text.trim().match(/^(.*)\(([^)]+)\)\s*$/s);
  if (!match) return { text: text.trim() };
  return {
    text: match[1].trim(),
    source: match[2].trim(),
  };
}

function BehaviorDetailBlocks({
  blocks,
}: {
  blocks: BehaviorDetailContentBlock[];
}) {
  if (!blocks.length) return null;

  return (
    <View style={styles.blocksList}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        const type = (block.type ?? "").toUpperCase();

        if (type === "HEADING") {
          return (
            <Text key={key} style={styles.blockHeading}>
              {block.text}
            </Text>
          );
        }

        if (type === "BULLET") {
          return (
            <View key={key} style={styles.recommendationRow}>
              <Text style={styles.recommendationBullet}>◆</Text>
              <Text style={styles.recommendationText}>{block.text}</Text>
            </View>
          );
        }

        if (type === "HADITH" || type === "QURAN") {
          const quote = splitQuote(block.text);
          return <BehaviorDetailQuoteBlock key={key} quote={quote} />;
        }

        return (
          <Text key={key} style={styles.sectionBody}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

type BehaviorDetailImpactCardProps = {
  title: string;
  blocks: BehaviorDetailContentBlock[];
};

export function BehaviorDetailImpactCard({
  title,
  blocks,
}: BehaviorDetailImpactCardProps) {
  if (!title && !blocks.length) return null;

  return (
    <View style={styles.sectionCard}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <BehaviorDetailBlocks blocks={blocks} />
    </View>
  );
}

type BehaviorDetailRecommendationsCardProps = {
  title: string;
  blocks: BehaviorDetailContentBlock[];
};

export function BehaviorDetailRecommendationsCard({
  title,
  blocks,
}: BehaviorDetailRecommendationsCardProps) {
  if (!title && !blocks.length) return null;

  return (
    <View style={styles.sectionCard}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <BehaviorDetailBlocks blocks={blocks} />
    </View>
  );
}
