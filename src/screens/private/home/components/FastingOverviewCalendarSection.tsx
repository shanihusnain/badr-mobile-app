import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "@/components/atoms/Tabs";
import { Colors } from "@/constants/theme";
import { useGetHomeFastingCalendar } from "@/src/api/queries/useGetHomeFastingCalendar";
import {
  toDateKey,
  startOfDay,
} from "@/src/screens/private/journalfilling/journalFillingDateUtils";
import {
  mapHomeFastingDaysToMarkers,
  normalizeFastingViewKey,
  resolveHomeFastingCalendarLabels,
  resolveHomeFastingTabs,
  resolveHomeFastingViews,
  resolveHomeFastingWindow,
  viewKeyToTrackVariant,
} from "../mapHomeFastingCalendar";
import { styles } from "../styles";
import { FastingCalendarTrack } from "./FastingCalendarTrack";
import { FastingGoalTotalCard } from "./FastingGoalTotalCard";
import { FastingCalenderDashboardIcon } from "@/assets/icons/FastingCalenderDashboardIcon";
import { resolveFastingLegendEntries } from "../fastingLegend";

export type FastingTrackTab = {
  label: string;
  variant: "planned" | "progress";
};

/** @deprecated Prefer API `views`; kept for overview screen callers. */
export const HOME_FASTING_TRACK_TABS: FastingTrackTab[] = [
  { label: "Planned", variant: "planned" },
  { label: "Planned vs. Progress", variant: "progress" },
];

export const OVERVIEW_FASTING_TRACK_TABS: FastingTrackTab[] = [
  { label: "Planned", variant: "planned" },
  { label: "Progress", variant: "progress" },
];

type Props = {
  /** @deprecated API supplies views; ignored when fetching home fasting calendar. */
  trackTabs?: FastingTrackTab[];
  title?: string;
  showInfoBanner?: boolean;
  /** YYYY-MM-DD — defaults to today. */
  date?: string;
};

export function FastingOverviewCalendarSection({
  title,
  showInfoBanner = true,
  date,
}: Props) {
  const { t } = useTypedTranslation();
  const todayKey = useMemo(() => toDateKey(startOfDay(new Date())), []);
  const queryDate = date?.trim() || todayKey;
  const [selectedTabKey, setSelectedTabKey] = useState("ALL");

  const [selectedView, setSelectedView] = useState<"PLANNED" | "PROGRESS">(
    "PROGRESS",
  );
  const [showLegendCard, setShowLegendCard] = useState(true);
  const [showInfoBannerVisible, setShowInfoBannerVisible] =
    useState(showInfoBanner);

  const { data: fastingCalendar } = useGetHomeFastingCalendar(
    selectedTabKey,
    selectedView,
    queryDate,
  );
  // Persist last API tab list so a tab switch doesn't briefly fall back to
  // ALL-only and get reset by the sync effect.
  const [optedTabs, setOptedTabs] = useState(() =>
    resolveHomeFastingTabs(undefined),
  );
  useEffect(() => {
    if (
      Array.isArray(fastingCalendar?.tabs) &&
      fastingCalendar.tabs.length > 0
    ) {
      setOptedTabs(resolveHomeFastingTabs(fastingCalendar.tabs));
    }
  }, [fastingCalendar?.tabs]);

  const tabs = optedTabs;
  const selectedTab =
    tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0] ?? null;
  const views = useMemo(
    () => resolveHomeFastingViews(fastingCalendar?.views),
    [fastingCalendar?.views],
  );
  const labels = useMemo(
    () => resolveHomeFastingCalendarLabels(fastingCalendar),
    [fastingCalendar],
  );
  const window = useMemo(
    () => resolveHomeFastingWindow(fastingCalendar?.days),
    [fastingCalendar?.days],
  );
  const markers = useMemo(
    () =>
      mapHomeFastingDaysToMarkers(fastingCalendar?.days, selectedTabKey),
    [fastingCalendar?.days, selectedTabKey],
  );
  const legendEntries = useMemo(
    () => resolveFastingLegendEntries(fastingCalendar?.days, selectedTabKey),
    [fastingCalendar?.days, selectedTabKey],
  );

  const resolvedTitle = title ?? labels.title;
  const trackVariant = viewKeyToTrackVariant(selectedView);
  const selectedViewLabel =
    views.find((view) => view.key === selectedView)?.label ?? selectedView;

  useEffect(() => {
    if (fastingCalendar?.introDismissed) {
      setShowInfoBannerVisible(false);
    }
  }, [fastingCalendar?.introDismissed]);

  useEffect(() => {
    setShowLegendCard(!(fastingCalendar?.legendDismissed ?? false));
  }, [selectedView, fastingCalendar?.legendDismissed]);

  useEffect(() => {
    // Only auto-correct once we know the user's opted tabs (more than ALL).
    const hasOptedGoalTabs = tabs.some((tab) => tab.key !== "ALL");
    if (
      hasOptedGoalTabs &&
      !tabs.some((tab) => tab.key === selectedTabKey) &&
      tabs[0]
    ) {
      setSelectedTabKey(tabs[0].key);
    }
  }, [tabs, selectedTabKey]);

  useEffect(() => {
    if (!views.some((view) => view.key === selectedView) && views[0]) {
      setSelectedView(normalizeFastingViewKey(views[0].key));
    }
  }, [views, selectedView]);

  return (
    <View style={styles.fastingCalendarSection}>
      <View style={styles.fastingCalendarSectionHeader}>
        <FastingCalenderDashboardIcon size={32} />
        <Text style={styles.dashboardText}>{resolvedTitle}</Text>
      </View>
      {/* {showInfoBannerVisible ? (
        <View style={styles.fastingInfoBanner}>
          <Text style={styles.fastingInfoBannerText}>
            {labels.description || t("homeScreen.fastingInfoBanner")}
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
      ) : null} */}
      <ScrollView
        horizontal
        style={styles.fastingCalendarTabsScroll}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {tabs.map((tab) => (
          <Tabs
            key={tab.key}
            label={tab.label}
            onPress={() => setSelectedTabKey(tab.key)}
            selectedTab={selectedTab?.label ?? tabs[0]?.label ?? "ALL"}
            bgColor={Colors.light.blackBackground}
          />
        ))}
      </ScrollView>
      <FastingGoalTotalCard
        label={labels.goalLabel}
        count={labels.goalValue}
        unit={labels.goalUnit}
      />
      <ScrollView
        horizontal
        style={styles.fastingCalendarTabsScroll}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {views.map((view) => (
          <Tabs
            key={view.key}
            label={view.label}
            onPress={() => setSelectedView(normalizeFastingViewKey(view.key))}
            selectedTab={selectedViewLabel}
            bgColor={Colors.light.blackBackground}
          />
        ))}
      </ScrollView>
      <FastingCalendarTrack
        variant={trackVariant}
        showLegendCard={showLegendCard}
        onCloseLegendCard={() => setShowLegendCard(false)}
        markers={markers}
        legendEntries={legendEntries}
        windowStartDate={window?.startDate}
        windowEndDate={window?.endDate}
        rangeLabel={labels.rangeLabel}
        hijriRangeLabel={labels.hijriRangeLabel}
        completedLabel={labels.completedLabel}
        completedCount={labels.completedValue}
        completedUnit={labels.completedUnit}
        footnote={labels.footnote}
        hasCalendar={Boolean(window)}
      />
    </View>
  );
}
