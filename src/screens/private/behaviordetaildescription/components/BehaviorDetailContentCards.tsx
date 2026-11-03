import { fonts } from "@/assets/fonts";
import type { BehaviorDetailContentBlock } from "@/src/api/queries/useGetJournalBehaviorDetils";
import React from "react";
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

function renderParsedContent(content: string) {
  if (!content) return "";
  const regex = /(\*\*.*?\*\*|\*.*?\*|\bSurah\s+[A-Za-z'-]+(?:\s+[A-Za-z'-]+)?)/gi;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      return (
        <Text
          key={index}
          style={{
            fontWeight: "600",
            fontFamily: fonts.primary.semiBold,
          }}
        >
          {text}
        </Text>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      const text = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={{
            fontStyle: "italic",
            fontFamily: fonts.primary.regularItalic,
          }}
        >
          {text}
        </Text>
      );
    }
    if (/^Surah\s+[A-Za-z'-]+/i.test(part)) {
      return (
        <Text
          key={index}
          style={{
            fontWeight: "600",
            fontFamily: fonts.primary.semiBold,
          }}
        >
          {part}
        </Text>
      );
    }
    return part;
  });
}

function isHeadingType(type: string): boolean {
  return (
    type === "HEADING" ||
    type === "SUBHEADING" ||
    type === "HEADER" ||
    type === "TITLE" ||
    type === "BULLET" ||
    type === "BULLET_POINT" ||
    type === "LIST_ITEM" ||
    type === "STEP" ||
    type === "RECOMMENDATION"
  );
}

function BehaviorDetailBlocks({
  blocks,
}: {
  blocks: BehaviorDetailContentBlock[];
}) {
  if (!blocks || !blocks.length) return null;

  return (
    <View style={styles.blocksList}>
      {blocks.map((block: any, index) => {
        if (!block) return null;

        if (typeof block === "string") {
          return (
            <Text key={`str-${index}`} style={styles.sectionBody}>
              {renderParsedContent(block)}
            </Text>
          );
        }

        const type = String(block.type ?? "").toUpperCase();
        const headingText = String(
          block.heading ??
            block.title ??
            (isHeadingType(type) ? (block.text ?? block.content ?? "") : "")
        ).trim();
        const bodyText = String(
          block.text ??
            block.content ??
            block.description ??
            block.body ??
            block.value ??
            ""
        ).trim();

        // 1. Hadith or Quran quote block
        if (type === "HADITH" || type === "QURAN") {
          const rawText = bodyText || headingText;
          const quote = splitQuote(rawText);
          if (block.source && !quote.source) {
            quote.source = block.source;
          }
          return (
            <BehaviorDetailQuoteBlock
              key={`quote-${index}`}
              quote={quote}
              type={type}
            />
          );
        }

        // 2. Heading / Bullet block
        if (isHeadingType(type)) {
          const title = headingText || bodyText;
          return (
            <View key={`heading-${index}`} style={styles.blockHeadingRow}>
              <Text style={styles.blockHeadingBullet}>✦</Text>
              <Text style={styles.blockHeadingText}>{renderParsedContent(title)}</Text>
            </View>
          );
        }

        // 3. Block containing both a heading and body text
        if (headingText && bodyText && headingText !== bodyText) {
          return (
            <View key={`compound-${index}`} style={styles.compoundBlock}>
              <View style={styles.blockHeadingRow}>
                <Text style={styles.blockHeadingBullet}>✦</Text>
                <Text style={styles.blockHeadingText}>{renderParsedContent(headingText)}</Text>
              </View>
              <Text style={styles.sectionBody}>{renderParsedContent(bodyText)}</Text>
            </View>
          );
        }

        // 4. Block with only heading
        if (headingText && !bodyText) {
          return (
            <View key={`heading-only-${index}`} style={styles.blockHeadingRow}>
              <Text style={styles.blockHeadingBullet}>✦</Text>
              <Text style={styles.blockHeadingText}>{renderParsedContent(headingText)}</Text>
            </View>
          );
        }

        // 5. Regular paragraph text
        if (bodyText) {
          return (
            <Text key={`body-${index}`} style={styles.sectionBody}>
              {renderParsedContent(bodyText)}
            </Text>
          );
        }

        return null;
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
