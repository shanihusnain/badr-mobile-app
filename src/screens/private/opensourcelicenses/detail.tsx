import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { useGetAbout } from "@/src/api/queries/useGetAbout";
import type { AboutContentBlock } from "@/src/api/queries/useGetAbout";
import { openSourceLicensesStyles as styles } from "./style";

function renderBodyBlock(block: AboutContentBlock, index: number) {
  const type = String(block.type ?? "").toLowerCase();

  if (type === "heading" && block.text) {
    return (
      <Text key={`h-${index}`} style={styles.bodyHeading}>
        {block.text}
      </Text>
    );
  }

  if (type === "paragraph" && block.text) {
    return (
      <Text key={`p-${index}`} style={styles.bodyParagraph}>
        {block.text}
      </Text>
    );
  }

  if (type === "bullets" && Array.isArray(block.items)) {
    return (
      <View key={`b-${index}`}>
        {block.items.map((item, itemIndex) => (
          <Text key={`bi-${itemIndex}`} style={styles.bodyParagraph}>
            {`• ${item}`}
          </Text>
        ))}
      </View>
    );
  }

  return null;
}

export default function OpenSourceLicenseDetailScreen() {
  const { index: indexParam } = useLocalSearchParams<{ index?: string }>();
  const { data, isLoading } = useGetAbout();
  const licenses = data?.openSourceLicenses?.licenses ?? [];
  const index = Number.parseInt(String(indexParam ?? ""), 10);
  const license =
    Number.isFinite(index) && index >= 0 && index < licenses.length
      ? licenses[index]
      : null;

  const handleOpenUrl = useCallback(() => {
    const url = license?.url?.trim();
    if (!url) return;
    void Linking.openURL(url);
  }, [license?.url]);

  if (isLoading) {
    return (
      <BlackScreenWrapper>
        <View style={styles.loadingWrap}>
          <LoadingComponent size="large" />
        </View>
      </BlackScreenWrapper>
    );
  }

  if (!license) {
    return (
      <BlackScreenWrapper>
        <Text style={styles.emptyText}>License not found.</Text>
      </BlackScreenWrapper>
    );
  }

  return (
    <BlackScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.detailScroll}
      >
        <View style={styles.detailHeaderBlock}>
          <Text style={styles.licenseName}>{license.name}</Text>
          {license.version ? (
            <Text style={styles.licenseVersion}>{license.version}</Text>
          ) : null}
          {license.url ? (
            <Pressable onPress={handleOpenUrl} hitSlop={8}>
              <Text style={styles.licenseUrl}>{license.url}</Text>
            </Pressable>
          ) : null}
        </View>

        {license.heading ? (
          <Text style={styles.termsHeading}>{license.heading}</Text>
        ) : null}

        {(license.body ?? []).map(renderBodyBlock)}
      </ScrollView>
    </BlackScreenWrapper>
  );
}
