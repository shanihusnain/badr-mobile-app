import { Colors } from "@/constants/theme";
import { formatHoursToTimeLabel } from "@/src/screens/private/home/timeSpentData";
import type { QuranPastChartItem } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import { useFont } from "@shopify/react-native-skia";
import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  CartesianChart,
  StackedBar,
  type ChartBounds,
  type PointsArray,
} from "victory-native";
import {
  INCOMPLETE_BAR_COLOR,
  pastAchievementStyles as styles,
} from "./pastAchievementStyles";

const DIMMED_BAR_OPACITY = 0.22;
const BAR_HIT_WIDTH = 44;
const BAR_CORNER_RADIUS = 10;

function getInnerPadding(barCount: number): number {
  if (barCount <= 3) return 0.48;
  if (barCount <= 4) return 0.52;
  return 0.58;
}

function getLabelWidth(barCount: number): number {
  if (barCount <= 3) return 76;
  if (barCount <= 4) return 62;
  return 48;
}

function getClampedLabelLeft(
  x: number,
  labelWidth: number,
  plotLeft: number,
  plotRight: number,
): number {
  return Math.max(plotLeft, Math.min(x - labelWidth / 2, plotRight - labelWidth));
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

function getBarRoundedCorners(isBottom: boolean, isTop: boolean) {
  if (isBottom && isTop) {
    return {
      topLeft: BAR_CORNER_RADIUS,
      topRight: BAR_CORNER_RADIUS,
      bottomLeft: BAR_CORNER_RADIUS,
      bottomRight: BAR_CORNER_RADIUS,
    };
  }

  if (isTop) {
    return {
      topLeft: BAR_CORNER_RADIUS,
      topRight: BAR_CORNER_RADIUS,
      bottomLeft: 0,
      bottomRight: 0,
    };
  }

  if (isBottom) {
    return {
      topLeft: 0,
      topRight: 0,
      bottomLeft: BAR_CORNER_RADIUS,
      bottomRight: BAR_CORNER_RADIUS,
    };
  }

  return undefined;
}

type XAxisLabelsProps = {
  barCenterXs: number[];
  chartData: QuranPastChartItem[];
  selectedBarIndex: number | null;
  plotLeft: number;
  plotRight: number;
};

function XAxisLabels({
  barCenterXs,
  chartData,
  selectedBarIndex,
  plotLeft,
  plotRight,
}: XAxisLabelsProps) {
  const labelWidth = getLabelWidth(chartData.length);

  return (
    <View style={styles.xAxisContainer}>
      {chartData.map((item, index) => {
        const x = barCenterXs[index];
        if (x == null) return null;

        const isSelected = selectedBarIndex === index;
        const isDimmed =
          selectedBarIndex !== null && selectedBarIndex !== index;
        const left = getClampedLabelLeft(x, labelWidth, plotLeft, plotRight);

        return (
          <View
            key={`${item.xLabel}-${item.dateLabel}`}
            style={[
              styles.xAxisLabelPosition,
              {
                left,
                width: labelWidth,
              },
              isDimmed && styles.xAxisLabelDimmed,
            ]}
          >
            <Text
              style={[
                styles.xAxisDateLabel,
                isSelected && styles.xAxisDateLabelSelected,
              ]}
              numberOfLines={2}
            >
              {item.dateLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type ChartStackedBarsProps = {
  completedPoints: PointsArray;
  incompletePoints: PointsArray;
  chartBounds: ChartBounds;
  selectedBarIndex: number | null;
  barCount: number;
};

function ChartStackedBars({
  completedPoints,
  incompletePoints,
  chartBounds,
  selectedBarIndex,
  barCount,
}: ChartStackedBarsProps) {
  return (
    <StackedBar
      points={[completedPoints, incompletePoints]}
      chartBounds={chartBounds}
      colors={[Colors.light.green, INCOMPLETE_BAR_COLOR]}
      barCount={barCount}
      innerPadding={getInnerPadding(barCount)}
      barWidth={30}
      barOptions={({ datumIndex, isBottom, isTop }) => ({
        opacity: getBarOpacity(datumIndex, selectedBarIndex),
        roundedCorners: getBarRoundedCorners(isBottom, isTop),
      })}
    />
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
            styles.barHitArea,
            {
              left: x - BAR_HIT_WIDTH / 2,
              width: BAR_HIT_WIDTH,
            },
          ]}
          onPress={() => onBarPress(index)}
          accessibilityRole="button"
          accessibilityLabel={`Week ${index + 1}`}
        />
      ))}
    </>
  );
}

type BarValueLabelsProps = {
  barCenterXs: number[];
  chartData: QuranPastChartItem[];
  selectedBarIndex: number | null;
  chartBounds: ChartBounds;
  yMax: number;
};

function BarValueLabels({
  barCenterXs,
  chartData,
  selectedBarIndex,
  chartBounds,
  yMax,
}: BarValueLabelsProps) {
  const chartHeight = chartBounds.bottom - chartBounds.top;

  return (
    <>
      {chartData.map((item, index) => {
        const x = barCenterXs[index];
        if (x == null) return null;

        const isSelected = selectedBarIndex === index;
        const isDimmed =
          selectedBarIndex !== null && selectedBarIndex !== index;
        const barTop =
          chartBounds.bottom -
          (item.stackTotalHours / yMax) * chartHeight -
          20;

        return (
          <Text
            key={`bar-value-${item.xLabel}`}
            style={[
              styles.barValueLabel,
              {
                left: x,
                top: Math.max(chartBounds.top, barTop),
              },
              isDimmed && styles.barValueLabelDimmed,
              isSelected && styles.barValueLabelSelected,
            ]}
          >
            {formatHoursToTimeLabel(item.hours)}
          </Text>
        );
      })}
    </>
  );
}

type QuranHoursPastAchievementChartBlockProps = {
  chartData: QuranPastChartItem[];
  selectedBarIndex: number | null;
  onBarPress: (index: number) => void;
  chartKey: string;
  yMax: number;
  yTicks: number[];
  showHint: boolean;
  onDismissHint: () => void;
  hintText: string;
  hintActionText: string;
  pageCount: number;
  activePageIndex: number;
};

export function QuranHoursPastAchievementChartBlock({
  chartData,
  selectedBarIndex,
  onBarPress,
  chartKey,
  yMax,
  yTicks,
  showHint,
  onDismissHint,
  hintText,
  hintActionText,
  pageCount,
  activePageIndex,
}: QuranHoursPastAchievementChartBlockProps) {
  const [barCenterXs, setBarCenterXs] = useState<number[]>([]);
  const [chartBounds, setChartBounds] = useState<ChartBounds | null>(null);
  const barCenterXsRef = useRef<number[]>([]);

  const axisFont = useFont(
    require("@/assets/fonts/SF-Pro-Text-Regular.otf"),
    10,
  );

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

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>
          <CartesianChart
            key={chartKey}
            data={chartData}
            xKey="xLabel"
            yKeys={["completedHours", "incompleteHours"]}
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
              syncBarLabelPositions(
                points.completedHours.map((point) => point.x ?? 0),
              );
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
                <ChartStackedBars
                  completedPoints={points.completedHours}
                  incompletePoints={points.incompleteHours}
                  chartBounds={bounds}
                  selectedBarIndex={selectedBarIndex}
                  barCount={chartData.length}
                />
              );
            }}
          </CartesianChart>

          {barCenterXs.length > 0 ? (
            <BarHitAreas barCenterXs={barCenterXs} onBarPress={onBarPress} />
          ) : null}

          {chartBounds ? (
            <BarValueLabels
              barCenterXs={barCenterXs}
              chartData={chartData}
              selectedBarIndex={selectedBarIndex}
              chartBounds={chartBounds}
              yMax={yMax}
            />
          ) : null}
        </View>

        {showHint ? (
          <View style={styles.chartHintOverlay} pointerEvents="box-none">
            <View style={styles.chartHintBubble} pointerEvents="auto">
              <Text style={styles.chartHintText}>{hintText}</Text>
              <Pressable onPress={onDismissHint} hitSlop={8}>
                <Text style={styles.chartHintAction}>{hintActionText}</Text>
              </Pressable>
            </View>
            <View style={styles.chartHintPointerRow} pointerEvents="none">
              <View style={styles.chartHintPointer} />
            </View>
          </View>
        ) : null}
      </View>

      <XAxisLabels
        barCenterXs={barCenterXs}
        chartData={chartData}
        selectedBarIndex={selectedBarIndex}
        plotLeft={plotLeft}
        plotRight={plotRight}
      />

      <View style={styles.paginationRow}>
        {Array.from({ length: pageCount }, (_, index) => (
          <View
            key={`page-dot-${index}`}
            style={[
              styles.paginationDot,
              index === activePageIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
