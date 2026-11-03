import { HadeethBookIcon } from "@/assets/icons/HadeethBookIcon";
import { QuranImageIcon } from "@/assets/icons/QuranImageIcon";
import { Colors } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BehaviorDetailQuote } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

type BehaviorDetailQuoteBlockProps = {
  quote: BehaviorDetailQuote | string;
  type?: string;
};

export function BehaviorDetailQuoteBlock({
  quote,
  type,
}: BehaviorDetailQuoteBlockProps) {
  const quoteText = (typeof quote === "string" ? quote : quote.text || "").trim();
  const sourceText = typeof quote === "object" ? quote.source?.trim() : undefined;
  const content =
    sourceText && !quoteText.includes(sourceText)
      ? `${quoteText} (${sourceText})`
      : quoteText;

  const isQuran =
    String(type ?? "").toUpperCase() === "QURAN" ||
    /\b\d+:\d+\b/.test(content) ||
    /quran/i.test(content) ||
    /surah/i.test(content) ||
    (typeof quote === "object" && quote.source
      ? /quran|surah|\d+:\d+/i.test(quote.source)
      : false);

  const gap = 8;
  const iconSize = 28;
  const iconMarginTop = 1;
  const flatStyle = StyleSheet.flatten(styles.quoteText) || {};
  const lineHeight =
    typeof flatStyle.lineHeight === "number" ? flatStyle.lineHeight : 20;
  const linesBeside = Math.max(1, Math.ceil(iconSize / lineHeight));

  const [rowWidth, setRowWidth] = useState(0);
  const [splitAt, setSplitAt] = useState<number | null>(null);
  const measureWidth =
    rowWidth > 0 ? Math.max(1, rowWidth - iconSize - gap) : 0;

  useEffect(() => {
    setSplitAt(null);
  }, [content, measureWidth, linesBeside]);

  const beside =
    splitAt === null
      ? content
      : content.slice(0, splitAt).replace(/\s+$/, "");
  const below =
    splitAt !== null && splitAt < content.length
      ? content.slice(splitAt).replace(/^\s+/, "")
      : "";

  return (
    <View
      style={{ width: "100%", marginTop: 2 }}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next > 0 && next !== rowWidth) setRowWidth(next);
      }}
    >
      {measureWidth > 0 && splitAt === null ? (
        <Text
          pointerEvents="none"
          style={[
            styles.quoteText,
            isQuran ? styles.quoteTextQuran : styles.quoteTextHadith,
            {
              position: "absolute",
              opacity: 0,
              width: measureWidth,
            },
          ]}
          onTextLayout={(e) => {
            const { lines } = e.nativeEvent;
            if (!lines?.length) {
              setSplitAt(content.length);
              return;
            }
            if (lines.length <= linesBeside) {
              setSplitAt(content.length);
              return;
            }
            let count = 0;
            for (let i = 0; i < linesBeside; i++) {
              count += lines[i]?.text?.length ?? 0;
            }
            setSplitAt(Math.min(count, content.length));
          }}
        >
          {content}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <View
          style={{
            marginTop: iconMarginTop,
            marginRight: gap,
          }}
        >
          {isQuran ? (
            <QuranImageIcon color={Colors.light.green} size={iconSize} />
          ) : (
            <HadeethBookIcon color={Colors.light.green} size={iconSize} />
          )}
        </View>
        <Text style={[styles.quoteText, isQuran ? styles.quoteTextQuran : styles.quoteTextHadith, { flex: 1 }]}>{beside}</Text>
      </View>

      {below ? (
        <Text style={[styles.quoteText, isQuran ? styles.quoteTextQuran : styles.quoteTextHadith, { width: "100%" }]}>{below}</Text>
      ) : null}
    </View>
  );
}
