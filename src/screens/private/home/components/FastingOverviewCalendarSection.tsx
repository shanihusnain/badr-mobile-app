import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "@/components/atoms/Tabs";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import {
  FASTING_CALENDAR_FILTER_TABS,
  type FastingCalendarFilterTab,
} from "../fastingCalendar";
import { PLANNED_FASTS } from "../plannedFasts";
import { styles } from "../styles";
import { FastingCalendarTrack } from "./FastingCalendarTrack";
import { FastingGoalTotalCard } from "./FastingGoalTotalCard";

export type FastingTrackTab = {
  label: string;
  variant: "planned" | "progress";
};

export const HOME_FASTING_TRACK_TABS: FastingTrackTab[] = [
  { label: "Planned", variant: "planned" },
  { label: "Planned vs. Progress", variant: "progress" },
];

export const OVERVIEW_FASTING_TRACK_TABS: FastingTrackTab[] = [
  { label: "Planned", variant: "planned" },
  { label: "Progress", variant: "progress" },
];

function getFastingTrackTabTranslationKey(label: string): any {
  if (label === "Planned") return "homeScreen.fastingTabPlanned";
  if (label === "Planned vs. Progress" || label === "Progress") return "homeScreen.fastingTabProgress";
  return label;
}

function getFastingFilterTranslationKey(label: string): any {
  const map: Record<string, string> = {
    "All": "homeScreen.fastingFilter_All",
    "Missed Ramadan Fasts": "homeScreen.fastingFilter_MissedRamadanFasts",
    "Monday & Thursday Fasts": "homeScreen.fastingFilter_MondayThursdayFasts",
    "Dawood Fasts": "homeScreen.fastingFilter_DawoodFasts",
    "White Days Fasts": "homeScreen.fastingFilter_WhiteDaysFasts",
  };
  return map[label] ?? label;
}

type Props = {
  trackTabs: FastingTrackTab[];
  title?: string;
  showInfoBanner?: boolean;
};

export function FastingOverviewCalendarSection({
  trackTabs,
  title,
  showInfoBanner = true,
}: Props) {
  const { t } = useTypedTranslation();
  const resolvedTitle = title ?? t("homeScreen.yourFastingCalendar");
  const [filterTab, setFilterTab] =
    useState<FastingCalendarFilterTab>("All");
  const [selectedTrackLabel, setSelectedTrackLabel] = useState(
    trackTabs[0]?.label ?? "Planned",
  );
  const [showLegendCard, setShowLegendCard] = useState(true);
  const [showInfoBannerVisible, setShowInfoBannerVisible] =
    useState(showInfoBanner);

  const selectedTrack =
    trackTabs.find((tab) => tab.label === selectedTrackLabel) ?? trackTabs[0];

  useEffect(() => {
    setShowLegendCard(true);
  }, [selectedTrackLabel]);

  if (!selectedTrack) return null;

  return (
    <View style={styles.fastingCalendarSection}>
      <Text style={styles.dashboardText}>{resolvedTitle}</Text>
      <TopSpace top={16} />
      {showInfoBannerVisible ? (
        <View style={styles.fastingInfoBanner}>
          <Text style={styles.fastingInfoBannerText}>
            {t("homeScreen.fastingInfoBanner")}
          </Text>
          <TouchableOpacity
            style={styles.fastingInfoBannerClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            onPress={() => setShowInfoBannerVisible(false)}
          >
            <Ionicons name="close" size={18} color={Colors.light.white} />
          </TouchableOpacity>
        </View>
      ) : null}
      <ScrollView
        horizontal
        style={styles.fastingCalendarTabsScroll}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {FASTING_CALENDAR_FILTER_TABS.map((label) => (
          <Tabs
            key={label}
            label={t(getFastingFilterTranslationKey(label))}
            onPress={() => setFilterTab(label)}
            selectedTab={t(getFastingFilterTranslationKey(filterTab))}
            bgColor={Colors.light.blackBackground}
          />
        ))}
      </ScrollView>
      <TopSpace top={16} />
      <FastingGoalTotalCard label={t("homeScreen.fastingGoalTotal")} count={PLANNED_FASTS.goalTotal} />
      <TopSpace top={16} />
      <ScrollView
        horizontal
        style={styles.fastingCalendarTabsScroll}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {trackTabs.map(({ label }) => (
          <Tabs
            key={label}
            label={t(getFastingTrackTabTranslationKey(label))}
            onPress={() => setSelectedTrackLabel(label)}
            selectedTab={t(getFastingTrackTabTranslationKey(selectedTrackLabel))}
            bgColor={Colors.light.blackBackground}
          />
        ))}
      </ScrollView>
      <FastingCalendarTrack
        variant={selectedTrack.variant}
        filterTab={filterTab}
        showLegendCard={showLegendCard}
        onCloseLegendCard={() => setShowLegendCard(false)}
      />
    </View>
  );
}
