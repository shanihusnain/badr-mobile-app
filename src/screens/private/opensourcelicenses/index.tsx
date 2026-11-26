import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { useGetAbout } from "@/src/api/queries/useGetAbout";
import { openSourceLicensesStyles as styles } from "./style";

export default function OpenSourceLicensesScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useGetAbout();
  const licenses = data?.openSourceLicenses?.licenses ?? [];

  return (
    <BlackScreenWrapper>
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <LoadingComponent size="large" />
          </View>
        ) : isError || licenses.length === 0 ? (
          <Text style={styles.emptyText}>No licenses available.</Text>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {licenses.map((license, index) => (
              <Pressable
                key={`${license.label}-${index}`}
                style={({ pressed }) => [
                  styles.listItem,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/(private)/opensourcelicenses/[index]",
                    params: { index: String(index) },
                  })
                }
              >
                <Text style={styles.listItemText} numberOfLines={1}>
                  {license.label}
                </Text>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={Colors.light.white}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </BlackScreenWrapper>
  );
}
