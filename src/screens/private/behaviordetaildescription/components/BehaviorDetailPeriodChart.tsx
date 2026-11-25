import { Text, View } from "react-native";
import type { BehaviorDetailChartBar } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

type BehaviorDetailPeriodChartProps = {
  bars: BehaviorDetailChartBar[];
  yMax: number;
};

const CHART_Y_MAX = 8;
const Y_TICKS = [8, 6, 4, 2, 0];

export function BehaviorDetailPeriodChart({
  bars,
}: BehaviorDetailPeriodChartProps) {
  const chartHeight = 160;

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartPlotRow}>
        <View style={[styles.chartYAxis, { height: chartHeight }]}>
          {Y_TICKS.map((tick) => (
            <View
              key={tick}
              style={[
                styles.chartYAxisTick,
                { top: `${((CHART_Y_MAX - tick) / CHART_Y_MAX) * 100}%` },
              ]}
            >
              <Text style={styles.chartYAxisLabel}>{tick}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.chartBarsArea, { height: chartHeight }]}>
          {Y_TICKS.map((tick) => (
            <View
              key={`grid-${tick}`}
              style={[
                styles.chartGridLine,
                { top: `${((CHART_Y_MAX - tick) / CHART_Y_MAX) * 100}%` },
              ]}
            />
          ))}
          {bars.map((bar) => {
            const barHeight = Math.max(
              4,
              (Math.min(bar.value, CHART_Y_MAX) / CHART_Y_MAX) * chartHeight,
            );

            return (
              <View key={bar.label} style={styles.chartBarColumn}>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: barHeight,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.chartXAxisRow}>
        <View style={styles.chartXAxisSpacer} />
        {bars.map((bar) => (
          <View key={`${bar.label}-label`} style={styles.chartXAxisItem}>
            <Text style={styles.chartXAxisLabel} numberOfLines={2}>
              {bar.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
