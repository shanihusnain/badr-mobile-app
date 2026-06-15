import { TopSpace } from "@/components/atoms/TopSpace";
import { Colors } from "@/constants/theme";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import {
  buildCategoryBreakdown,
  buildCycleWeeklyChartData,
  buildWeeklyChartData,
  formatTotalTime,
  getPeriodRangeLabel,
} from "../timeSpentData";
import { styles } from "../styles";
import { TimeSpentCategoryRow } from "./TimeSpentCategoryRow";
import { TimeSpentChartBlock } from "./TimeSpentChartBlock";

type Props = {
  onExpandPress?: () => void;
};

export function TimeSpentOverview({ onExpandPress }: Props) {
  const { t, i18n } = useTypedTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [cycleOffset, setCycleOffset] = useState(0);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

  const showChartHint = !hintDismissed && selectedBarIndex === null;

  const chartData = useMemo(
    () =>
      selectedPeriod === "week"
        ? buildWeeklyChartData(weekOffset, "All")
        : buildCycleWeeklyChartData(cycleOffset, "All"),
    [selectedPeriod, weekOffset, cycleOffset],
  );

  const handleBarPress = useCallback((index: number) => {
    setSelectedBarIndex((current) => (current === index ? null : index));
  }, []);

  useEffect(() => {
    setSelectedBarIndex(null);
    setHintDismissed(false);
  }, [selectedPeriod, weekOffset, cycleOffset]);

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
        "All",
        displayHours,
        selectedBarIndex,
        selectedPeriod,
      ),
    [displayHours, selectedBarIndex, selectedPeriod],
  );

  const periodRangeLabel = useMemo(
    () => getPeriodRangeLabel(selectedPeriod, weekOffset, cycleOffset),
    [selectedPeriod, weekOffset, cycleOffset],
  );

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
    <View style={styles.timeSpentContainer}>
      <View style={styles.timeSpentHeaderRow}>
        <View style={styles.timeSpentTitleRow}>
          <AntDesign name="clock-circle" size={24} color={Colors.light.white} />
          <Text style={styles.timeSpentTitle}>{t("homeScreen.timeSpent")}</Text>
        </View>
        <Pressable
          onPress={onExpandPress}
          disabled={!onExpandPress}
          hitSlop={8}
        >
          <Entypo name={i18n.language === "ar" ? "chevron-left" : "chevron-right"} size={24} color={Colors.light.white} />
        </Pressable>
      </View>
      <TopSpace top={16} />
      <View style={styles.timeSpentPercentRow}>
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
      <View style={styles.timeSpentNavRowContainer}>
        {showChartHint ? (
          <View style={styles.timeSpentChartHint}>
            <View style={styles.timeSpentChartHintBubble}>
              <Text style={styles.timeSpentChartHintText}>
                {t("homeScreen.tapBarHint")}
              </Text>
              <Pressable
                onPress={() => setHintDismissed(true)}
                hitSlop={8}
              >
                <Text style={styles.timeSpentChartHintAction}>{t("homeScreen.okGotIt")}</Text>
              </Pressable>
            </View>
            <View style={styles.timeSpentChartHintPointerRow}>
              <View style={styles.timeSpentChartHintPointer} />
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
            <Pressable onPress={onPreviousPeriod} hitSlop={8}>
              <Entypo name={i18n.language === "ar" ? "chevron-right" : "chevron-left"} size={18} color={Colors.light.white} />
            </Pressable>
            <Text style={styles.timeSpentNavLabel}>{periodRangeLabel}</Text>
            <Pressable onPress={onNextPeriod} hitSlop={8}>
              <Entypo name={i18n.language === "ar" ? "chevron-left" : "chevron-right"} size={18} color={Colors.light.white} />
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
        chartKey={`dashboard-${selectedPeriod}-${weekOffset}-${cycleOffset}`}
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
