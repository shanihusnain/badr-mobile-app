import { TopSpace } from "@/components/atoms/TopSpace";
import { LoadingComponent } from "@/components/atoms/LoadingComponent";
import { Colors } from "@/constants/theme";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import {
  formatTotalTime,
  getPeriodRangeLabel,
  transformBackendChartData,
  transformBackendRows,
} from "../timeSpentData";
import { styles } from "../styles";
import { TimeSpentCategoryRow } from "./TimeSpentCategoryRow";
import { TimeSpentChartBlock } from "./TimeSpentChartBlock";
import { TimeSpentMoreTabDashboardIcon } from "@/assets/icons/TimeSpentMoreTabDashboardIcon";
import { useGetHomeScreenTimeSpent } from "@/src/api/queries/useGetHomeScreenTimeSpent";
import { useLocaleNumber } from "@/hooks/useLocaleNumber";

type Props = {
  onExpandPress?: () => void;
  selectedDate: string;
  showChartHint: boolean;
  /** Hide the card expand chevron (used on the full-screen Time Spent view). */
  showExpandControl?: boolean;
};

export function TimeSpentOverview({
  onExpandPress,
  selectedDate,
  showChartHint,
  showExpandControl = true,
}: Props) {
  const { t, i18n } = useTypedTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );
  const [currentEndDate, setCurrentEndDate] = useState<string>(selectedDate);
  const [weekOffset, setWeekOffset] = useState(0);
  const [cycleOffset, setCycleOffset] = useState(0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const formatNumber = useLocaleNumber();

  useEffect(() => {
    setCurrentEndDate(selectedDate);
  }, [selectedDate]);

  const {
    data: timeSpentData,
    isLoading,
    isFetching,
  } = useGetHomeScreenTimeSpent({
    period: selectedPeriod === "week" ? "W" : "M",
    category: "ALL",
    endDate: currentEndDate || selectedDate,
  });

  const isChartLoading = isLoading || (isFetching && !timeSpentData);

  const showDeltaChip = Boolean(timeSpentData?.badge?.label);
  const deltaIsPositive = timeSpentData?.badge?.direction === "UP";

  const chartData = useMemo(
    () =>
      timeSpentData?.bars && timeSpentData.bars.length > 0
        ? transformBackendChartData(timeSpentData.bars, selectedPeriod)
        : [],
    [timeSpentData?.bars, selectedPeriod],
  );

  const handleBarPress = useCallback((index: number) => {
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [selectedPeriod, currentEndDate, weekOffset, cycleOffset]);

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
    return [];
  }, [timeSpentData?.rows, displayHours, selectedBarIndex]);

  const periodRangeLabel = useMemo(
    () => getPeriodRangeLabel(selectedPeriod, weekOffset, cycleOffset),
    [selectedPeriod, weekOffset, cycleOffset],
  );

  const maxBarHours =
    chartData.length > 0
      ? Math.max(...chartData.map((item) => item.hours), 0)
      : 0;
  const yMax = Math.max(15, Math.ceil(maxBarHours / 5) * 5);
  const yTicks = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

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

  const handlePeriodChange = (period: "week" | "month") => {
    setSelectedPeriod(period);
    setCurrentEndDate(selectedDate);
    setSelectedBarIndex(null);
  };

  return (
    <View style={styles.timeSpentContainer}>
      <View style={styles.timeSpentHeaderRow}>
        <View style={styles.timeSpentTitleRow}>
          <TimeSpentMoreTabDashboardIcon size={30} color="#A0A0A0" />
          <Text style={styles.timeSpentTitle}>{t("homeScreen.timeSpent")}</Text>
        </View>
        {showExpandControl ? (
          <Pressable
            onPress={onExpandPress}
            disabled={!onExpandPress}
            hitSlop={8}
          >
            <Entypo
              name={i18n.language === "ar" ? "chevron-left" : "chevron-right"}
              size={24}
              color={Colors.light.white}
            />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
      <TopSpace top={16} />
      <View style={styles.timeSpentPercentRow}>
        <View>
          <Text style={styles.timeSpentPercentText}>
            {timeSpentData?.percentLabel?.replace(/%$/, "")}
            {timeSpentData?.percentLabel?.endsWith("%") ? (
              <Text style={styles.timeSpentPercentSymbol}>%</Text>
            ) : null}
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
              disabled={!canGoPrevious}
              hitSlop={8}
              style={{ opacity: canGoPrevious ? 1 : 0.3 }}
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
              disabled={!canGoNext}
              hitSlop={8}
              style={{ opacity: canGoNext ? 1 : 0.3 }}
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
              {selectedBarIndex !== null
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
        <TimeSpentChartBlock
          chartData={chartData}
          selectedPeriod={selectedPeriod}
          selectedBarIndex={selectedBarIndex}
          onBarPress={handleBarPress}
          chartKey={`dashboard-${selectedPeriod}-${currentEndDate}-${selectedBarIndex}`}
          yMax={yMax}
          yTicks={yTicks}
        />
      )}

      <TopSpace top={24} />
      {isChartLoading ? null : (
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
      )}
      <TopSpace top={16} />
    </View>
  );
}
