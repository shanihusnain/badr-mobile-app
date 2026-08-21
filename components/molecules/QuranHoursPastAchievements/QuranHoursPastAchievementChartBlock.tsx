import { Colors } from "@/constants/theme";
import { formatHoursToTimeLabel } from "@/src/screens/private/home/timeSpentData";
import type { QuranPastChartItem } from "@/src/screens/private/goalprogressloggingscreen/quranHoursPastAchievementData";
import {
  useFont,
  Canvas,
  Path,
  Skia,
  Circle,
} from "@shopify/react-native-skia";
import SecondaryButton from "@/components/atoms/Secondary-button";
import { useCallback, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  CartesianChart,
  StackedBar,
  type ChartBounds,
  type PointsArray,
} from "victory-native";
import {
  pastAchievementStyles as styles,
} from "./pastAchievementStyles";

const DIMMED_BAR_OPACITY = 0.3;
const BAR_HIT_WIDTH = 44;
const BAR_CORNER_RADIUS = 2;

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
  chartKey?: string;
  colors?: [string, string];
};

function ChartStackedBars({
  completedPoints,
  incompletePoints,
  chartBounds,
  selectedBarIndex,
  barCount,
  chartKey = "",
  colors,
}: ChartStackedBarsProps) {
  const isTimeSpentView = chartKey.includes("completedVsTimeSpent");
  const isInMosqueView = chartKey.includes("inMosqueVsOutOfMosque");
  const isCategoryView = chartKey.includes("completedByCategory");

  let barPoints = [completedPoints, incompletePoints];
  let barColors: [string, string] =
    colors ?? [Colors.light.white, "rgba(255, 255, 255, 0.4)"];

  if ((isTimeSpentView || isCategoryView) && !colors) {
    barColors = [Colors.light.white, Colors.light.white];
  } else if (isInMosqueView) {
    barPoints = [incompletePoints, completedPoints];
  }

  return (
    <StackedBar
      points={barPoints}
      chartBounds={chartBounds}
      colors={barColors}
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

type BarConnectorLineProps = {
  barCenterXs: number[];
  chartData: QuranPastChartItem[];
  chartBounds: ChartBounds;
  yMax: number;
  selectedBarIndex: number | null;
  canvasWidth: number;
  canvasHeight: number;
};

function BarConnectorLine({
  barCenterXs,
  chartData,
  chartBounds,
  yMax,
  selectedBarIndex,
  canvasWidth,
  canvasHeight,
}: BarConnectorLineProps) {
  if (barCenterXs.length < 1 || !chartBounds || canvasWidth <= 0) return null;

  const chartHeight = chartBounds.bottom - chartBounds.top;
  const LINE_COLOR = Colors.light.barlinecolor;
  const DOT_RADIUS = 4;

  // Collect (x, y) points — line tracks the middle of the completedHours level
  const points: { x: number; y: number }[] = barCenterXs.map((x, i) => {
    const item = chartData[i];
    const value = item ? (item.completedHours ?? 0) : 0;
    const y = chartBounds.bottom - (value / 2 / yMax) * chartHeight;
    return { x, y };
  });

  // Build a path connecting all points
  const linePath = Skia.Path.Make();
  points.forEach(({ x, y }, i) => {
    if (i === 0) linePath.moveTo(x, y);
    else linePath.lineTo(x, y);
  });

  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: canvasWidth,
        height: canvasHeight,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {/* The connecting line */}
      <Path
        path={linePath}
        color={LINE_COLOR}
        style="stroke"
        strokeWidth={1.5}
        strokeCap="round"
        strokeJoin="round"
        opacity={selectedBarIndex !== null ? DIMMED_BAR_OPACITY : 1}
      />
      {/* Dot markers at each bar center */}
      {points.map(({ x, y }, i) => (
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={DOT_RADIUS}
          color={LINE_COLOR}
          opacity={
            selectedBarIndex === null || selectedBarIndex === i
              ? 1
              : DIMMED_BAR_OPACITY
          }
        />
      ))}
    </Canvas>
  );
}

type BarHitAreasProps = {
  barCenterXs: number[];
  onBarPress: (index: number) => void;
  selectedBarIndex: number | null;
};

function BarHitAreas({
  barCenterXs,
  onBarPress,
  selectedBarIndex,
}: BarHitAreasProps) {
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
          onPress={() => {
            if (selectedBarIndex === index) {
              return;
            }
            onBarPress(index);
          }}
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
  formatBarValue?: (value: number) => string;
  valueLabelColor?: string;
};

function BarValueLabels({
  barCenterXs,
  chartData,
  selectedBarIndex,
  chartBounds,
  yMax,
  formatBarValue = formatHoursToTimeLabel,
  valueLabelColor,
}: BarValueLabelsProps) {
  if (selectedBarIndex === null) return null;

  const item = chartData[selectedBarIndex];
  const x = barCenterXs[selectedBarIndex];
  if (!item || x == null) return null;

  const chartHeight = chartBounds.bottom - chartBounds.top;
  const barTop =
    chartBounds.bottom - (item.stackTotalHours / yMax) * chartHeight - 20;

  return (
    <Text
      style={[
        styles.barValueLabel,
        styles.barValueLabelSelected,
        valueLabelColor ? { color: valueLabelColor } : null,
        {
          left: x,
          top: Math.max(chartBounds.top, barTop),
        },
      ]}
    >
      {formatBarValue(item.hours)}
    </Text>
  );
}

type QuranHoursPastAchievementChartBlockProps = {
  chartData: QuranPastChartItem[];
  selectedBarIndex: number | null;
  onBarPress: (index: number | null) => void;
  chartKey: string;
  yMax: number;
  yTicks: number[];
  showHint: boolean;
  onDismissHint: () => void;
  hintText: string;
  hintActionText: string;
  pageCount?: number;
  activePageIndex?: number;
  formatBarValue?: (value: number) => string;
  isPrayerGoal?: boolean;
  showPagination?: boolean;
  showBarLine?: boolean;
  barColors?: [string, string];
  valueLabelColor?: string;
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
  pageCount = 0,
  activePageIndex = 0,
  formatBarValue,
  isPrayerGoal = false,
  showPagination = true,
  showBarLine = false,
  barColors,
  valueLabelColor,
}: QuranHoursPastAchievementChartBlockProps) {
  const [barCenterXs, setBarCenterXs] = useState<number[]>([]);
  const [chartBounds, setChartBounds] = useState<ChartBounds | null>(null);
  const [chartContainerHeight, setChartContainerHeight] = useState(0);
  const [chartWrapperSize, setChartWrapperSize] = useState({
    width: 0,
    height: 0,
  });
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
      <View
        style={styles.chartWrapper}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setChartWrapperSize((prev) =>
            prev.width === width && prev.height === height
              ? prev
              : { width, height },
          );
        }}
      >
        <View
          style={styles.chartContainer}
          onLayout={(e) => setChartContainerHeight(e.nativeEvent.layout.height)}
        >
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
                  chartKey={chartKey}
                  colors={barColors}
                />
              );
            }}
          </CartesianChart>

          {barCenterXs.length > 0 ? (
            <BarHitAreas
              barCenterXs={barCenterXs}
              onBarPress={(index) => onBarPress(index)}
              selectedBarIndex={selectedBarIndex}
            />
          ) : null}

          {chartBounds ? (
            <BarValueLabels
              barCenterXs={barCenterXs}
              chartData={chartData}
              selectedBarIndex={selectedBarIndex}
              chartBounds={chartBounds}
              yMax={yMax}
              formatBarValue={formatBarValue}
              valueLabelColor={valueLabelColor}
            />
          ) : null}
        </View>

        {showBarLine && chartBounds && barCenterXs.length > 0 ? (
          <BarConnectorLine
            barCenterXs={barCenterXs}
            chartData={chartData}
            chartBounds={chartBounds}
            yMax={yMax}
            selectedBarIndex={selectedBarIndex}
            canvasWidth={chartWrapperSize.width}
            canvasHeight={chartWrapperSize.height}
          />
        ) : null}

        {showHint ? (
          <View style={styles.chartHintOverlay} pointerEvents="box-none">
            <View style={styles.chartHintBubble} pointerEvents="auto">
              <Text style={styles.chartHintText}>{hintText}</Text>
              <Pressable onPress={onDismissHint} hitSlop={8}>
                <Text style={styles.chartHintAction}>{hintActionText}</Text>
              </Pressable>
            </View>
            <View
              style={styles.chartHintPointerRow}
              pointerEvents="none"
            ></View>
            <View style={styles.chartHintPointer} />
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

      {showPagination && isPrayerGoal && selectedBarIndex !== null ? (
        <View style={{ marginTop: 3, paddingHorizontal: 8 }}>
          <View style={[styles.paginationRow, { marginTop: 0, marginBottom: 24 }]}>
            {Array.from({ length: chartData.length }, (_, index) => (
              <View
                key={`page-dot-${index}`}
                style={[
                  styles.paginationDot,
                  index === selectedBarIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
          <SecondaryButton
            text="CLOSE"
            variant="green"
            onPress={() => onBarPress(null)}
          />
        </View>
      ) : null}

      {showPagination && !isPrayerGoal ? (
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
      ) : null}
    </View>
  );
}
