import { Text, View } from "react-native";
import type { BehaviorDetailChartBar } from "../behaviorDetailMockData";
import { behaviorDetailStyles as styles } from "../styles";

type BehaviorDetailPeriodChartProps = {
  bars: BehaviorDetailChartBar[];
  yMax: number;
};

function buildYTicks(yMax: number): number[] {
  const step = yMax <= 8 ? 2 : yMax <= 24 ? 4 : 6;
  const ticks: number[] = [];

  for (let value = 0; value <= yMax; value += step) {
    ticks.unshift(value);
  }

  return ticks.length > 1 ? ticks : [yMax, 0];
}

export function BehaviorDetailPeriodChart({
  bars,
  yMax,
}: BehaviorDetailPeriodChartProps) {
  const yTicks = buildYTicks(yMax);
  const chartHeight = 132;

  return (
    <View style={styles.chartSection}>
      <View style={styles.chartPlotRow}>
        <View style={[styles.chartYAxis, { height: chartHeight }]}>
          {yTicks.map((tick) => (
            <Text key={tick} style={styles.chartYAxisLabel}>
              {tick}
            </Text>
          ))}
        </View>

        <View style={[styles.chartBarsArea, { height: chartHeight }]}>
          {bars.map((bar) => {
            const barHeight = Math.max(4, (bar.value / yMax) * chartHeight);

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
