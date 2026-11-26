import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { calendarSettingStyles as styles } from "./style";
import { useRouter } from "expo-router";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import {
  calendarViewToApi,
  calendarViewToUi,
  useGetSettings,
} from "@/src/api/queries/useGetSettings";
import { useUpdateSettings } from "@/src/api/mutations/useUpdateSettings";

export default function CalendarSettingsScreen() {
  const router = useRouter();
  const { data, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [selectedView, setSelectedView] = useState<"gregorian" | "hijri">(
    "gregorian",
  );

  useEffect(() => {
    if (!data?.calendarView) return;
    setSelectedView(calendarViewToUi(data.calendarView));
  }, [data?.calendarView]);

  const handleSave = () => {
    updateSettings.mutate(
      { calendarView: calendarViewToApi(selectedView) },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  return (
    <BlackScreenWrapper>
      {isLoading && !data ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <LoadingComponent size="large" />
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <Pressable
              style={styles.optionRow}
              onPress={() => setSelectedView("gregorian")}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedView === "gregorian" && styles.radioOuterSelected,
                ]}
              >
                {selectedView === "gregorian" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.optionText}>Keep Gregorian view</Text>
            </Pressable>

            <Pressable
              style={styles.optionRow}
              onPress={() => setSelectedView("hijri")}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedView === "hijri" && styles.radioOuterSelected,
                ]}
              >
                {selectedView === "hijri" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.optionText}>Switch to Hijri view</Text>
            </Pressable>
          </View>

          <View style={styles.bottomContainer}>
            <SecondaryButton
              text="SAVE"
              onPress={handleSave}
              variant="green"
              disabled={updateSettings.isPending}
            />
            <View style={styles.infoContainer}>
              <Feather name="info" size={14} color={Colors.light.subtext} />
              <Text style={styles.infoText}>
                All calendar views and data analytics will update{"\n"}based on
                your selection.
              </Text>
            </View>
          </View>
        </>
      )}
    </BlackScreenWrapper>
  );
}
