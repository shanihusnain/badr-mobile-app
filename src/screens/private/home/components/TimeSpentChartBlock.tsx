import { Colors } from "@/constants/theme";
import { useFont } from "@shopify/react-native-skia";
import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable, type ViewStyle } from "react-native";
import {
  Bar,
  CartesianChart,
  type ChartBounds,
  type PointsArray,
} from "victory-native";
import type { TimeSpentChartItem, TimeSpentPeriod } from "../timeSpentData";
import { formatHoursToTimeLabel, formatTotalTime } from "../timeSpentData";
import { styles } from "../styles";

/** Match past-achievement graph bar geometry. */
const DIMMED_BAR_OPACITY = 0.3;
const BAR_HIT_WIDTH = 44;
const BAR_CORNER_RADIUS = 2;
const BAR_WIDTH = 30;
const BAR_ROUNDED_CORNERS = {
  topLeft: BAR_CORNER_RADIUS,
  topRight: BAR_CORNER_RADIUS,
  bottomLeft: BAR_CORNER_RADIUS,
  bottomRight: BAR_CORNER_RADIUS,
} as const;

function getInnerPadding(barCount: number): number {
  if (barCount <= 3) return 0.48;
  if (barCount <= 4) return 0.52;
  return 0.58;
}

function getLabelWidth(barCount: number): number {
  if (barCount <= 3) return 76;
  if (barCount <= 4) return 62;
  if (barCount <= 6) return 52;
  return 48;
}

function getClampedLabelLeft(
  x: number,
  labelWidth: number,
  plotLeft: number,
  plotRight: number,
): number {
  return Math.max(
    plotLeft,
    Math.min(x - labelWidth / 2, plotRight - labelWidth),
  );
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
  plotLeft: number;
  plotRight: number;
};

function XAxisLabels({
  barCenterXs,
  chartData,
  selectedPeriod,
  selectedBarIndex,
  plotLeft,
  plotRight,
}: XAxisLabelsProps) {
  const labelWidth = getLabelWidth(chartData.length);
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
        const left = getClampedLabelLeft(x, labelWidth, plotLeft, plotRight);

        return (
          <View
            key={`${item.xLabel}-${item.dateLabel}-${index}`}
            style={[
              styles.timeSpentXAxisLabelPosition,
              { left, width: labelWidth } satisfies ViewStyle,
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
                numberOfLines={2}
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

type BarHitAreasProps = {
  barCenterXs: number[];
  onBarPress: (index: number) => void;
};

function BarHitAreas({ barCenterXs, onBarPress }: BarHitAreasProps) {
  return (
    <>
      {barCenterXs.map((x, index) => (
        <Pressable
          key={`bar-hit-${index}`}
          style={[
            styles.timeSpentBarHitArea,
            {
              left: x - BAR_HIT_WIDTH / 2,
              width: BAR_HIT_WIDTH,
            },
          ]}
          onPress={() => onBarPress(index)}
          accessibilityRole="button"
          accessibilityLabel={`Bar ${index + 1}`}
        />
      ))}
    </>
  );
}

type ChartBarsProps = {
  points: PointsArray;
  chartBounds: ChartBounds;
  selectedBarIndex: number | null;
  barCount: number;
  chartFont: ReturnType<typeof useFont>;
  formatBarLabel: (hours: number) => string;
};

function ChartBars({
  points,
  chartBounds,
  selectedBarIndex,
  barCount,
  chartFont,
  formatBarLabel,
}: ChartBarsProps) {
  const innerPadding = getInnerPadding(barCount);
  const showAllLabels = selectedBarIndex === null;

  return (
    <>
      {points.map((point, index) => {
        const opacity = getBarOpacity(index, selectedBarIndex);
        const isSelected = selectedBarIndex === index;
        const hasHours = (point.yValue ?? 0) > 0;
        const showLabel = isSelected || (showAllLabels && hasHours);

        return (
          <Bar
            key={`${point.x ?? index}-${index}`}
            points={[point]}
            chartBounds={chartBounds}
            color={Colors.light.green}
            opacity={opacity}
            roundedCorners={BAR_ROUNDED_CORNERS}
            barWidth={BAR_WIDTH}
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
  const [chartBounds, setChartBounds] = useState<ChartBounds | null>(null);
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

  const plotLeft = chartBounds?.left ?? 48;
  const plotRight = chartBounds?.right ?? 280;
  const hasGraphData = chartData.some((item) => item.hours > 0);

  return (
    <View style={styles.timeSpentChartSection}>
      <View style={styles.timeSpentChartContainer}>
        <CartesianChart
          key={chartKey}
          data={chartData}
          xKey="xLabel"
          yKeys={["hours"]}
          orientation="vertical"
          domain={{ y: [0, yMax] }}
          padding={{ left: 0, right: 10, top: 22, bottom: 4 }}
          domainPadding={{ left: 48, right: 28, top: 10 }}
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
          {({ points, chartBounds: bounds }) => {
            syncBarLabelPositions(points.hours.map((point) => point.x ?? 0));
            queueMicrotask(() => {
              setChartBounds((prev) =>
                prev?.top === bounds.top &&
                prev?.bottom === bounds.bottom &&
                prev?.left === bounds.left &&
                prev?.right === bounds.right
                  ? prev
                  : bounds,
              );
            });
            return (
              <ChartBars
                points={points.hours}
                chartBounds={bounds}
                selectedBarIndex={selectedBarIndex}
                barCount={chartData.length}
                chartFont={chartFont}
                formatBarLabel={formatBarLabel}
              />
            );
          }}
        </CartesianChart>

        {hasGraphData && barCenterXs.length > 0 ? (
          <BarHitAreas barCenterXs={barCenterXs} onBarPress={onBarPress} />
        ) : null}
      </View>

      <XAxisLabels
        barCenterXs={barCenterXs}
        chartData={chartData}
        selectedPeriod={selectedPeriod}
        selectedBarIndex={selectedBarIndex}
        plotLeft={plotLeft}
        plotRight={plotRight}
      />
    </View>
  );
}
