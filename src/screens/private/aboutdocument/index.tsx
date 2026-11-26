import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import {
  useGetAbout,
  type AboutContentBlock,
  type AboutPolicyDocument,
} from "@/src/api/queries/useGetAbout";
import { aboutDocumentStyles as styles } from "./style";

type DocumentKey = "privacy" | "terms";

function resolveDocument(
  key: DocumentKey | string | undefined,
  data: ReturnType<typeof useGetAbout>["data"],
): AboutPolicyDocument | null {
  if (!data) return null;
  if (key === "terms") return data.termsOfUse ?? null;
  return data.privacyPolicy ?? null;
}

function renderBodyBlock(block: AboutContentBlock, index: number) {
  const type = String(block.type ?? "").toLowerCase();
  const text = "text" in block ? block.text : undefined;
  const items = "items" in block ? block.items : undefined;

  if (type === "heading" && text) {
    return (
      <Text key={`h-${index}`} style={styles.bodyHeading}>
        {text}
      </Text>
    );
  }

  if (type === "paragraph" && text) {
    return (
      <Text key={`p-${index}`} style={styles.bodyParagraph}>
        {text}
      </Text>
    );
  }

  if (type === "bullets" && Array.isArray(items)) {
    return (
      <View key={`b-${index}`}>
        {items.map((item: string, itemIndex: number) => (
          <Text key={`bi-${itemIndex}`} style={styles.bodyParagraph}>
            {`• ${item}`}
          </Text>
        ))}
      </View>
    );
  }

  return null;
}

export default function AboutDocumentScreen() {
  const { document: documentParam } = useLocalSearchParams<{
    document?: string;
  }>();
  const documentKey = (documentParam ?? "privacy") as DocumentKey;
  const { data, isLoading } = useGetAbout();
  const document = useMemo(
    () => resolveDocument(documentKey, data),
    [data, documentKey],
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (isLoading && !data) {
    return (
      <BlackScreenWrapper>
        <View style={styles.loadingWrap}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  if (!document) {
    return (
      <BlackScreenWrapper>
        <Text style={styles.emptyText}>Document not available.</Text>
      </BlackScreenWrapper>
    );
  }

  return (
    <BlackScreenWrapper>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {document.intro ? (
          <Text style={styles.introText}>{document.intro}</Text>
        ) : null}

        {(document.sections ?? []).map((section, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <Pressable
              key={`${section.question}-${index}`}
              style={styles.sectionItem}
              onPress={() =>
                setExpandedIndex(isExpanded ? null : index)
              }
            >
              <View style={styles.sectionRow}>
                <Text style={styles.sectionQuestion}>{section.question}</Text>
                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.light.white}
                />
              </View>
              {isExpanded ? (
                <View style={styles.sectionBody}>
                  {(section.body ?? []).map(renderBodyBlock)}
                </View>
              ) : null}
            </Pressable>
          );
        })}

        {document.effectiveFrom ? (
          <Text style={styles.effectiveFrom}>{document.effectiveFrom}</Text>
        ) : null}
      </ScrollView>
    </BlackScreenWrapper>
  );
}
