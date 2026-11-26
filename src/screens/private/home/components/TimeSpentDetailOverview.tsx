import { TopSpace } from "@/components/atoms/TopSpace";
import { Tabs } from "@/components/atoms/Tabs";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
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
  transformBackendChartData,
  transformBackendRows,
  type TimeSpentPeriod,
  type TimeSpentTab,
} from "../timeSpentData";
import { styles } from "../styles";
import { TimeSpentCategoryRow } from "./TimeSpentCategoryRow";
import { TimeSpentChartBlock } from "./TimeSpentChartBlock";
import { useGetHomeScreenTimeSpent } from "@/src/api/queries/useGetHomeScreenTimeSpent";
import { ExclamationWithcircle } from "@/assets/icons";

const TAB_TO_CATEGORY: Record<TimeSpentTab, string> = {
  All: "ALL",
  Prayer: "PRAYER",
  Quran: "QURAN",
  Fasting: "FASTING",
  Sadaqah: "SADAQAH",
};

type Props = {
  selectedDate?: string;
};

export function TimeSpentDetailOverview({ selectedDate = "" }: Props) {
  const { t, i18n } = useTypedTranslation();
  const [selectedTab, setSelectedTab] = useState<TimeSpentTab>("All");
  const [selectedPeriod, setSelectedPeriod] = useState<TimeSpentPeriod>("week");
  const [currentEndDate, setCurrentEndDate] = useState<string>(selectedDate);
  const [weekOffset, setWeekOffset] = useState(0);
  const [cycleOffset, setCycleOffset] = useState(0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    setCurrentEndDate(selectedDate);
  }, [selectedDate]);

  const {
    data: timeSpentData,
    isLoading,
    isFetching,
  } = useGetHomeScreenTimeSpent({
    period: selectedPeriod === "week" ? "W" : "M",
    category: TAB_TO_CATEGORY[selectedTab] ?? "ALL",
    endDate: currentEndDate || selectedDate,
  });

  const isChartLoading = isLoading || isFetching;

  const chartData = useMemo(() => {
    if (isChartLoading) return [];
    if (timeSpentData?.bars && timeSpentData.bars.length > 0) {
      return transformBackendChartData(timeSpentData.bars, selectedPeriod);
    }
    return selectedPeriod === "week"
      ? buildWeeklyChartData(weekOffset, selectedTab)
      : buildCycleWeeklyChartData(cycleOffset, selectedTab);
  }, [
    isChartLoading,
    timeSpentData?.bars,
    selectedPeriod,
    weekOffset,
    cycleOffset,
    selectedTab,
  ]);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [selectedPeriod, currentEndDate, weekOffset, cycleOffset, selectedTab]);

  const totalHours = useMemo(
    () =>
      timeSpentData?.totalMinutes != null
        ? timeSpentData.totalMinutes / 60
        : chartData.reduce((sum, item) => sum + item.hours, 0),
    [timeSpentData?.totalMinutes, chartData],
  );

  const displayHours =
    selectedBarIndex !== null
      ? (chartData[selectedBarIndex]?.hours ?? 0)
      : totalHours;

  const categoryRows = useMemo(() => {
    if (timeSpentData?.rows && timeSpentData.rows.length > 0) {
      return transformBackendRows(
        timeSpentData.rows,
        selectedBarIndex !== null ? displayHours : null,
      );
    }
    return buildCategoryBreakdown(
      selectedTab,
      displayHours,
      selectedBarIndex,
      selectedPeriod,
    );
  }, [
    timeSpentData?.rows,
    selectedTab,
    displayHours,
    selectedBarIndex,
    selectedPeriod,
  ]);

  const periodRangeLabel = useMemo(
    () => getPeriodRangeLabel(selectedPeriod, weekOffset, cycleOffset),
    [selectedPeriod, weekOffset, cycleOffset],
  );

  const summaryText = useMemo(() => {
    if (timeSpentData?.description) {
      return timeSpentData.description;
    }
    const formatted = formatTotalTime(totalHours);
    if (selectedPeriod === "week") {
      return t("homeScreen.timeSpentWeekSummary").replace(
        "{{time}}",
        formatted,
      );
    }
    return t("homeScreen.timeSpentMonthSummary").replace("{{time}}", formatted);
  }, [timeSpentData?.description, selectedPeriod, totalHours, t]);

  const showDeltaChip = Boolean(timeSpentData?.badge?.label);
  const deltaIsPositive = timeSpentData?.badge?.direction === "UP";

  const showChartHint =
    !isChartLoading &&
    !hintDismissed &&
    selectedBarIndex === null &&
    Boolean(chartData.length);

  const maxBarHours = Math.max(...chartData.map((item) => item.hours), 0);
  const yMax = Math.max(15, Math.ceil(maxBarHours / 5) * 5);
  const yTicks = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

  const handleBarPress = useCallback((index: number) => {
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  const canGoPrevious = Boolean(
    timeSpentData?.navigation?.previousEndDate != null,
  );
  const canGoNext = Boolean(timeSpentData?.navigation?.nextEndDate != null);

  const onPreviousPeriod = () => {
    if (timeSpentData?.navigation?.previousEndDate) {
      setCurrentEndDate(timeSpentData.navigation.previousEndDate);
      setSelectedBarIndex(null);
    } else if (selectedPeriod === "week") {
      setWeekOffset((current) => current - 1);
    } else {
      setCycleOffset((current) => current - 1);
    }
  };

  const onNextPeriod = () => {
    if (timeSpentData?.navigation?.nextEndDate) {
      setCurrentEndDate(timeSpentData.navigation.nextEndDate);
      setSelectedBarIndex(null);
    } else if (selectedPeriod === "week") {
      setWeekOffset((current) => current + 1);
    } else {
      setCycleOffset((current) => current + 1);
    }
  };

  const handlePeriodChange = (period: TimeSpentPeriod) => {
    setSelectedPeriod(period);
    setCurrentEndDate(selectedDate);
    setSelectedBarIndex(null);
  };

  return (
    <View>
      <View style={styles.timeSpentDetailPercentRow}>
        <View style={styles.timeSpentPercentBlock}>
          <Text style={styles.timeSpentPercentText}>
            {timeSpentData?.percentLabel ?? "0%"}
          </Text>
          <View style={styles.deltaSlot}>
            {showDeltaChip ? (
              <View style={styles.deltaBadge}>
                <AntDesign
                  name={deltaIsPositive ? "caret-up" : "caret-down"}
                  size={14}
                  color={
                    deltaIsPositive
                      ? Colors.light.green
                      : Colors.light.graylightshade
                  }
                />
                <Text style={styles.deltaText} numberOfLines={1}>
                  {timeSpentData?.badge.label}
                </Text>
              </View>
            ) : (
              <View style={styles.deltaBadgePlaceholder} />
            )}
          </View>
        </View>
        <View style={styles.timeSpentPeriodToggle}>
          {(["week", "month"] as const).map((period) => {
            const isSelected = selectedPeriod === period;

            return (
              <Pressable
                key={period}
                onPress={() => handlePeriodChange(period)}
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
                  {period === "week"
                    ? t("homeScreen.timeSpent_toggle_W")
                    : t("homeScreen.timeSpent_toggle_M")}
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
          let translatedTabLabel: string = tab;
          if (tab === "All") translatedTabLabel = t("homeScreen.filterAll");
          else if (tab === "Prayer")
            translatedTabLabel = t("homeScreen.filterPrayer");
          else if (tab === "Quran")
            translatedTabLabel = t("homeScreen.filterQuran");
          else if (tab === "Fasting")
            translatedTabLabel = t("homeScreen.filterFasting");
          else if (tab === "Sadaqah")
            translatedTabLabel = t("homeScreen.filterSadaqah");

          return (
            <Tabs
              key={tab}
              label={translatedTabLabel}
              selectedTab={
                selectedTab === tab ? translatedTabLabel : selectedTab
              }
              onPress={() => {
                setSelectedTab(tab);
                setSelectedBarIndex(null);
              }}
              bgColor={Colors.light.blackBackground}
            />
          );
        })}
      </ScrollView>

      <TopSpace top={16} />
      <View style={styles.timeSpentNavRowContainer}>
        {showChartHint ? (
          <View style={styles.timeSpentChartHint}>
            <View style={styles.timeSpentChartHintBubble}>
              <View style={styles.timeSpentChartHintBubbleInner}>
                <Text style={styles.timeSpentChartHintText}>
                  {timeSpentData?.tooltip?.text ?? t("homeScreen.tapBarHint")}
                </Text>
                <Pressable onPress={() => setHintDismissed(true)} hitSlop={8}>
                  <Text style={styles.timeSpentChartHintAction}>
                    {timeSpentData?.tooltip?.button ?? t("homeScreen.okGotIt")}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.timeSpentChartHintPointerRow}>
                <View style={styles.timeSpentChartHintPointer} />
              </View>
            </View>
          </View>
        ) : null}
        <View
          style={[
            styles.timeSpentNavSection,
            !showChartHint && styles.timeSpentNavSectionExpanded,
          ]}
        >
          <View style={styles.timeSpentNavRow}>
            <Pressable
              onPress={onPreviousPeriod}
              disabled={!canGoPrevious || isChartLoading}
              hitSlop={8}
              style={{
                opacity: canGoPrevious && !isChartLoading ? 1 : 0.3,
              }}
            >
              <Entypo
                name={i18n.language === "ar" ? "chevron-right" : "chevron-left"}
                size={18}
                color={Colors.light.white}
              />
            </Pressable>
            <Text style={styles.timeSpentNavLabel}>
              {timeSpentData?.rangeLabel ?? periodRangeLabel}
            </Text>
            <Pressable
              onPress={onNextPeriod}
              disabled={!canGoNext || isChartLoading}
              hitSlop={8}
              style={{ opacity: canGoNext && !isChartLoading ? 1 : 0.3 }}
            >
              <Entypo
                name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
                size={18}
                color={Colors.light.white}
              />
            </Pressable>
          </View>
          <View style={styles.timeSpentTotalBlock}>
            <Text style={styles.timeSpentTotalCaption}>
              {t("homeScreen.timeSpentTitle")}
            </Text>
            <Text style={styles.timeSpentTotalValue}>
              {isChartLoading
                ? "—"
                : selectedBarIndex !== null
                  ? formatTotalTime(displayHours)
                  : (timeSpentData?.totalLabel ?? formatTotalTime(totalHours))}
            </Text>
          </View>
        </View>
      </View>

      {isChartLoading ? (
        <View style={styles.timeSpentChartLoading}>
          <LoadingComponent size="medium" />
        </View>
      ) : (
        <>
          <TimeSpentChartBlock
            chartData={chartData}
            selectedPeriod={selectedPeriod}
            selectedBarIndex={selectedBarIndex}
            onBarPress={handleBarPress}
            chartKey={`${selectedTab}-${selectedPeriod}-${currentEndDate}-${selectedBarIndex}`}
            yMax={yMax}
            yTicks={yTicks}
          />

          <View style={styles.timeSpentDisclaimerRow}>
            <ExclamationWithcircle />
            <Text style={styles.timeSpentDisclaimerText}>
              {timeSpentData?.note ?? t("homeScreen.timeSpentDisclaimer")}
            </Text>
          </View>

          {selectedBarIndex !== null && chartData.length > 0 ? (
            <View style={styles.timeSpentDetailDotsRow}>
              {chartData.map((item, index) => (
                <Pressable
                  key={`${item.xLabel}-${index}`}
                  onPress={() => handleBarPress(index)}
                  hitSlop={6}
                  style={[
                    styles.timeSpentDetailDot,
                    index === selectedBarIndex
                      ? styles.timeSpentDetailDotActive
                      : styles.timeSpentDetailDotInactive,
                  ]}
                />
              ))}
            </View>
          ) : null}

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
        </>
      )}
    </View>
  );
}
