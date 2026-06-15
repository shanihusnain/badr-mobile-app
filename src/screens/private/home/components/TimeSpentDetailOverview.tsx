import { TopSpace } from "@/components/atoms/TopSpace";
import { Tabs } from "@/components/atoms/Tabs";
import { Colors } from "@/constants/theme";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import {
  TIME_SPENT_TABS,
  buildCategoryBreakdown,
  buildCycleWeeklyChartData,
  buildWeeklyChartData,
  formatTotalTime,
  getPeriodRangeLabel,
  getSummaryText,
  type TimeSpentPeriod,
  type TimeSpentTab,
} from "../timeSpentData";
import { styles } from "../styles";
import { TimeSpentCategoryRow } from "./TimeSpentCategoryRow";
import { TimeSpentChartBlock } from "./TimeSpentChartBlock";

export function TimeSpentDetailOverview() {
  const { t, i18n } = useTypedTranslation();
  const [selectedTab, setSelectedTab] = useState<TimeSpentTab>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<TimeSpentPeriod>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [cycleOffset, setCycleOffset] = useState(0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  const chartData = useMemo(
    () =>
      selectedPeriod === "week"
        ? buildWeeklyChartData(weekOffset, selectedTab)
        : buildCycleWeeklyChartData(cycleOffset, selectedTab),
    [selectedPeriod, weekOffset, cycleOffset, selectedTab],
  );

  useEffect(() => {
    setSelectedBarIndex(null);
  }, [selectedPeriod, weekOffset, cycleOffset, selectedTab]);

  const totalHours = useMemo(
    () => chartData.reduce((sum, item) => sum + item.hours, 0),
    [chartData],
  );

  const displayHours =
    selectedBarIndex !== null
      ? (chartData[selectedBarIndex]?.hours ?? 0)
      : totalHours;

  const categoryRows = useMemo(
    () =>
      buildCategoryBreakdown(
        selectedTab,
        displayHours,
        selectedBarIndex,
        selectedPeriod,
      ),
    [selectedTab, displayHours, selectedBarIndex, selectedPeriod],
  );

  const periodRangeLabel = useMemo(
    () => getPeriodRangeLabel(selectedPeriod, weekOffset, cycleOffset),
    [selectedPeriod, weekOffset, cycleOffset],
  );

  const summaryText = useMemo(() => {
    const formatted = formatTotalTime(totalHours);
    if (selectedPeriod === "week") {
      return t("homeScreen.timeSpentWeekSummary").replace("{{time}}", formatted);
    }
    return t("homeScreen.timeSpentMonthSummary").replace("{{time}}", formatted);
  }, [selectedPeriod, totalHours, t]);

  const yMax =
    selectedPeriod === "week"
      ? 15
      : Math.max(
          15,
          Math.ceil(Math.max(...chartData.map((item) => item.hours), 0)),
        );

  const yTicks =
    selectedPeriod === "week"
      ? [0, 5, 10, 15]
      : Array.from({ length: 4 }, (_, index) => Math.round((yMax / 3) * index));

  const handleBarPress = useCallback((index: number) => {
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const onPreviousPeriod = () => {
    if (selectedPeriod === "week") {
      setWeekOffset((current) => current - 1);
      return;
    }
    setCycleOffset((current) => current - 1);
  };

  const onNextPeriod = () => {
    if (selectedPeriod === "week") {
      setWeekOffset((current) => current + 1);
      return;
    }
    setCycleOffset((current) => current + 1);
  };

  return (
    <View>
      <View style={styles.timeSpentDetailPercentRow}>
        <Text style={styles.timeSpentPercentText}>30%</Text>
        <View style={styles.timeSpentPeriodToggle}>
          {(["week", "month"] as const).map((period) => {
            const isSelected = selectedPeriod === period;

            return (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.timeSpentPeriodButton,
                  isSelected
                    ? styles.timeSpentPeriodButtonSelected
                    : styles.timeSpentPeriodButtonUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.timeSpentPeriodButtonText,
                    isSelected
                      ? styles.timeSpentPeriodButtonTextSelected
                      : styles.timeSpentPeriodButtonTextUnselected,
                  ]}
                >
                  {period === "week" ? t("homeScreen.timeSpent_toggle_W") : t("homeScreen.timeSpent_toggle_M")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TopSpace top={12} />
      <View style={styles.timeSpentDetailSummaryBox}>
        <Text style={styles.timeSpentDetailSummaryText}>{summaryText}</Text>
      </View>

      <TopSpace top={16} />
      <ScrollView
        horizontal
        style={styles.timeSpentDetailTabsScroll}
        contentContainerStyle={styles.timeSpentDetailTabsContent}
        showsHorizontalScrollIndicator={false}
      >
        {TIME_SPENT_TABS.map((tab) => {
          let translatedTabLabel = tab;
          if (tab === "All") translatedTabLabel = t("homeScreen.filterAll");
          else if (tab === "Prayer") translatedTabLabel = t("homeScreen.filterPrayer");
          else if (tab === "Quran") translatedTabLabel = t("homeScreen.filterQuran");
          else if (tab === "Fasting") translatedTabLabel = t("homeScreen.filterFasting");
          else if (tab === "Sadaqah") translatedTabLabel = t("homeScreen.filterSadaqah");

          return (
            <Tabs
              key={tab}
              label={translatedTabLabel}
              selectedTab={selectedTab === tab ? translatedTabLabel : selectedTab}
              onPress={() => setSelectedTab(tab)}
              bgColor={Colors.light.blackBackground}
            />
          );
        })}
      </ScrollView>

      <TopSpace top={16} />
      <View style={styles.timeSpentNavRowContainer}>
        <View
          style={[
            styles.timeSpentNavSection,
            styles.timeSpentNavSectionExpanded,
          ]}
        >
          <View style={styles.timeSpentNavRow}>
            <Pressable onPress={onPreviousPeriod} hitSlop={8}>
              <Entypo
                name={i18n.language === "ar" ? "chevron-right" : "chevron-left"}
                size={18}
                color={Colors.light.white}
              />
            </Pressable>
            <Text style={styles.timeSpentNavLabel}>{periodRangeLabel}</Text>
            <Pressable onPress={onNextPeriod} hitSlop={8}>
              <Entypo
                name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
                size={18}
                color={Colors.light.white}
              />
            </Pressable>
          </View>
          <View style={styles.timeSpentTotalBlock}>
            <Text style={styles.timeSpentTotalCaption}>{t("homeScreen.timeSpentTitle")}</Text>
            <Text style={styles.timeSpentTotalValue}>
              {formatTotalTime(displayHours)}
            </Text>
          </View>
        </View>
      </View>

      <TimeSpentChartBlock
        chartData={chartData}
        selectedPeriod={selectedPeriod}
        selectedBarIndex={selectedBarIndex}
        onBarPress={handleBarPress}
        chartKey={`${selectedTab}-${selectedPeriod}-${weekOffset}-${cycleOffset}`}
        yMax={yMax}
        yTicks={yTicks}
      />

      <View style={styles.timeSpentDisclaimerRow}>
        <AntDesign
          name="info-circle"
          size={14}
          color={Colors.light.grey}
          style={styles.timeSpentDisclaimerIcon}
        />
        <Text style={styles.timeSpentDisclaimerText}>
          {t("homeScreen.timeSpentDisclaimer")}
        </Text>
      </View>

      <TopSpace top={24} />
      <View style={styles.timeSpentCategoryList}>
        {categoryRows.map((category) => (
          <TimeSpentCategoryRow
            key={category.label}
            label={category.label}
            percent={category.percent}
            timeLabel={category.timeLabel}
            progressPercent={category.progressPercent}
          />
        ))}
      </View>
      <TopSpace top={16} />
    </View>
  );
}
