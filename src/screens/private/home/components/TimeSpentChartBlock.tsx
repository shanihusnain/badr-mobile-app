import { Colors } from "@/constants/theme";
import { useFont } from "@shopify/react-native-skia";
import { useCallback, useRef, useState } from "react";
import { View, Text, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Bar,
  CartesianChart,
  type ChartBounds,
  type PointsArray,
} from "victory-native";
import type { TimeSpentChartItem, TimeSpentPeriod } from "../timeSpentData";
import { formatHoursToTimeLabel, formatTotalTime } from "../timeSpentData";
import { styles } from "../styles";

const DIMMED_BAR_OPACITY = 0.25;
const BAR_TOUCH_RADIUS = 36;
const BAR_ROUNDED_CORNERS = {
  topLeft: 4,
  topRight: 4,
  bottomLeft: 4,
  bottomRight: 4,
} as const;

function getXAxisLabelPositionStyle(x: number, labelWidth: number): ViewStyle {
  return {
    left: x - labelWidth / 2,
    width: labelWidth,
  };
}

function getBarOpacity(
  barIndex: number,
  selectedBarIndex: number | null,
): number {
  if (selectedBarIndex === null) {
    return 1;
  }

  return selectedBarIndex === barIndex ? 1 : DIMMED_BAR_OPACITY;
}

type XAxisLabelsProps = {
  barCenterXs: number[];
  chartData: TimeSpentChartItem[];
  selectedPeriod: TimeSpentPeriod;
  selectedBarIndex: number | null;
};

function XAxisLabels({
  barCenterXs,
  chartData,
  selectedPeriod,
  selectedBarIndex,
}: XAxisLabelsProps) {
  const labelWidth = selectedPeriod === "week" ? 36 : 72;
  const containerStyle =
    selectedPeriod === "week"
      ? styles.timeSpentXAxisContainerWeek
      : styles.timeSpentXAxisContainerMonth;

  return (
    <View style={containerStyle}>
      {chartData.map((item, index) => {
        const x = barCenterXs[index];
        if (x == null) return null;

        const isSelected = selectedBarIndex === index;
        const isDimmed =
          selectedBarIndex !== null && selectedBarIndex !== index;

        return (
          <View
            key={`${item.xLabel}-${item.dateLabel}`}
            style={[
              styles.timeSpentXAxisLabelPosition,
              getXAxisLabelPositionStyle(x, labelWidth),
              isDimmed && styles.timeSpentXAxisLabelDimmed,
            ]}
          >
            {selectedPeriod === "week" ? (
              <>
                <Text
                  style={[
                    styles.timeSpentXAxisDayLabel,
                    isSelected && styles.timeSpentXAxisDayLabelSelected,
                  ]}
                >
                  {item.dayLabel}
                </Text>
                <Text
                  style={[
                    styles.timeSpentXAxisDateLabelWeek,
                    isSelected && styles.timeSpentXAxisDateLabelWeekSelected,
                  ]}
                >
                  {item.dateLabel}
                </Text>
              </>
            ) : (
              <Text
                style={[
                  styles.timeSpentXAxisDateLabelMonth,
                  isSelected && styles.timeSpentXAxisDateLabelMonthSelected,
                ]}
              >
                {item.dateLabel}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ChartTouchLayer({
  barCenterXsRef,
  onBarPress,
}: {
  barCenterXsRef: React.RefObject<number[]>;
  onBarPress: (index: number) => void;
}) {
  const handleTap = useCallback(
    (touchX: number) => {
      const xs = barCenterXsRef.current;
      if (!xs.length) return;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < xs.length; index += 1) {
        const distance = Math.abs(xs[index] - touchX);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }

      if (closestDistance <= BAR_TOUCH_RADIUS) {
        onBarPress(closestIndex);
      }
    },
    [barCenterXsRef, onBarPress],
  );

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(12)
    .onEnd((event) => {
      handleTap(event.x);
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={styles.timeSpentChartTouchLayer} />
    </GestureDetector>
  );
}

type ChartBarsProps = {
  points: PointsArray;
  chartBounds: ChartBounds;
  selectedPeriod: TimeSpentPeriod;
  selectedBarIndex: number | null;
  barCount: number;
  chartFont: ReturnType<typeof useFont>;
  formatBarLabel: (hours: number) => string;
};

function ChartBars({
  points,
  chartBounds,
  selectedPeriod,
  selectedBarIndex,
  barCount,
  chartFont,
  formatBarLabel,
}: ChartBarsProps) {
  const innerPadding = selectedPeriod === "week" ? 0.45 : 0.55;
  const showAllLabels = selectedBarIndex === null;

  return (
    <>
      {points.map((point, index) => {
        const opacity = getBarOpacity(index, selectedBarIndex);
        const showLabel = showAllLabels || selectedBarIndex === index;

        return (
          <Bar
            key={`${point.x ?? index}-${index}`}
            points={[point]}
            chartBounds={chartBounds}
            color={Colors.light.green}
            opacity={opacity}
            roundedCorners={BAR_ROUNDED_CORNERS}
            barWidth={30}
            barCount={barCount}
            innerPadding={innerPadding}
            labels={
              chartFont && showLabel
                ? {
                    position: "top",
                    font: chartFont,
                    color: Colors.light.green,
                    formatLabel: (value) => formatBarLabel(value ?? 0),
                  }
                : undefined
            }
          />
        );
      })}
    </>
  );
}

type TimeSpentChartBlockProps = {
  chartData: TimeSpentChartItem[];
  selectedPeriod: TimeSpentPeriod;
  selectedBarIndex: number | null;
  onBarPress: (index: number) => void;
  chartKey: string;
  yMax: number;
  yTicks: number[];
};

export function TimeSpentChartBlock({
  chartData,
  selectedPeriod,
  selectedBarIndex,
  onBarPress,
  chartKey,
  yMax,
  yTicks,
}: TimeSpentChartBlockProps) {
  const [barCenterXs, setBarCenterXs] = useState<number[]>([]);
  const barCenterXsRef = useRef<number[]>([]);

  const chartFont = useFont(
    require("@/assets/fonts/SF-Pro-Text-Medium.otf"),
    10,
  );
  const axisFont = useFont(
    require("@/assets/fonts/SF-Pro-Text-Regular.otf"),
    10,
  );

  const formatBarLabel = (hours: number) =>
    selectedPeriod === "week"
      ? formatHoursToTimeLabel(hours)
      : formatTotalTime(hours);

  const syncBarLabelPositions = useCallback((xs: number[]) => {
    barCenterXsRef.current = xs;
    queueMicrotask(() => {
      setBarCenterXs((prev) => {
        if (
          prev.length === xs.length &&
          prev.every((value, index) => Math.abs(value - xs[index]) < 0.5)
        ) {
          return prev;
        }
        return xs;
      });
    });
  }, []);

  return (
    <View style={styles.timeSpentChartSection}>
      <View style={styles.timeSpentChartContainer}>
        <CartesianChart
          key={chartKey}
          data={chartData}
          xKey="xLabel"
          yKeys={["hours"]}
          domain={{ y: [0, yMax] }}
          padding={{ left: 0, right: 18, top: 18, bottom: 4 }}
          domainPadding={{ left: 60, right: 50, top: 8 }}
          xAxis={{
            font: axisFont,
            formatXLabel: () => "",
            lineColor: "transparent",
            labelColor: "transparent",
          }}
          yAxis={[
            {
              font: axisFont,
              tickValues: yTicks,
              formatYLabel: (value) => String(value),
              labelColor: Colors.light.grey,
              lineColor: "rgba(160, 160, 160, 0.25)",
              lineWidth: 1,
            },
          ]}
          frame={{ lineColor: "transparent" }}
        >
          {({ points, chartBounds }) => {
            syncBarLabelPositions(points.hours.map((point) => point.x ?? 0));

            return (
              <ChartBars
                points={points.hours}
                chartBounds={chartBounds}
                selectedPeriod={selectedPeriod}
                selectedBarIndex={selectedBarIndex}
                barCount={chartData.length}
                chartFont={chartFont}
                formatBarLabel={formatBarLabel}
              />
            );
          }}
        </CartesianChart>
        <ChartTouchLayer
          barCenterXsRef={barCenterXsRef}
          onBarPress={onBarPress}
        />
      </View>

      <XAxisLabels
        barCenterXs={barCenterXs}
        chartData={chartData}
        selectedPeriod={selectedPeriod}
        selectedBarIndex={selectedBarIndex}
      />
    </View>
  );
}