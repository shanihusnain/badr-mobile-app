import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "@/components/atoms/Tabs";
import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { useGetHomeFastingCalendar } from "@/src/api/queries/useGetHomeFastingCalendar";
import {
  toDateKey,
  startOfDay,
} from "@/src/screens/private/journalfilling/journalFillingDateUtils";
import {
  mapHomeFastingDaysToMarkers,
  normalizeFastingTabKey,
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
  const allTabs = [
    { key: "ALL", label: "ALL" },
    { key: "MISSED_RAMADAN", label: "MISSED RAMADAN FASTS" },
    { key: "MONDAY_THURSDAY", label: "MONDAY AND THURSDAY FASTS" },
    { key: "WHITE_DAYS", label: "WHITE DAYS FASTS" },
    { key: "PROPHET_DAWOOD", label: "DAWOOD FASTS" },
  ];
  const [selectedTab, setSelectedTab] = useState(allTabs.at(0));

  const [selectedView, setSelectedView] = useState<"PLANNED" | "PROGRESS">(
    "PROGRESS",
  );
  console.log("selectedTab", selectedTab);
  const [showLegendCard, setShowLegendCard] = useState(true);
  const [showInfoBannerVisible, setShowInfoBannerVisible] =
    useState(showInfoBanner);

  const { data: fastingCalendar } = useGetHomeFastingCalendar(
    selectedTab?.key ?? "ALL",
    selectedView,
    queryDate,
  );
  console.log("fasting calendar data coming from back end", fastingCalendar);
  const tabs = useMemo(
    () => resolveHomeFastingTabs(fastingCalendar?.tabs),
    [fastingCalendar?.tabs],
  );
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
      mapHomeFastingDaysToMarkers(
        fastingCalendar?.days,
        selectedTab?.key ?? "ALL",
      ),
    [fastingCalendar?.days, selectedTab],
  );
  const legendEntries = useMemo(
    () => resolveFastingLegendEntries(fastingCalendar?.days, selectedTab?.key),
    [fastingCalendar?.days, selectedTab?.key],
  );

  const resolvedTitle = title ?? labels.title;
  const trackVariant = viewKeyToTrackVariant(selectedView);
  const selectedTabLabel =
    tabs.find((tab) => tab.key === selectedTab?.key)?.label ??
    selectedTab?.label;
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
    if (!tabs.some((tab) => tab.key === selectedTab?.key) && tabs[0]) {
      // console.log("useEffect ran again");
      // setSelectedTab(tabs[0]);
    }
  }, [tabs, selectedTab]);

  useEffect(() => {
    if (!views.some((view) => view.key === selectedView) && views[0]) {
      setSelectedView(normalizeFastingViewKey(views[0].key));
    }
  }, [views, selectedView]);

  return (
    <View style={styles.fastingCalendarSection}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <FastingCalenderDashboardIcon size={32} />
        <Text style={styles.dashboardText}>{resolvedTitle}</Text>
      </View>
      <TopSpace top={16} />
      {showInfoBannerVisible ? (
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
      ) : null}
      <ScrollView
        horizontal
        style={styles.fastingCalendarTabsScroll}
        contentContainerStyle={styles.categoryFilterContent}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {allTabs.map((tab) => (
          <Tabs
            key={tab.key}
            label={tab.label}
            onPress={() => setSelectedTab(tab)}
            selectedTab={selectedTab?.label ?? "ALL"}
            bgColor={Colors.light.blackBackground}
          />
        ))}
      </ScrollView>
      <TopSpace top={16} />
      <FastingGoalTotalCard
        label={labels.goalLabel}
        count={labels.goalValue}
        unit={labels.goalUnit}
      />
      <TopSpace top={16} />
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
