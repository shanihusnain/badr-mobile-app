import { Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import type { FastingLegendEntry } from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendRing } from "./FastingLegendRing";

type FastingLegendItemProps = {
  entry: FastingLegendEntry;
  completed?: boolean;
};

/** Two lines when Figma wraps; single string when Figma keeps one line. */
type LegendLabel = string | [string, string];

/**
 * Figma:
 *   PLANNED/COMPLETED MISSED  → RAMADAN FAST  (2 lines)
 *   PLANNED/COMPLETED MON & THU               (1 line)
 *   PLANNED/COMPLETED WHITE DAYS              (1 line)
 */
const FIGMA_LABELS: Record<
  string,
  { planned: LegendLabel; completed: LegendLabel }
> = {
  "missed-ramadan": {
    planned: ["PLANNED MISSED", "RAMADAN FAST"],
    completed: ["COMPLETED MISSED", "RAMADAN FAST"],
  },
  "mon-thu": {
    planned: "PLANNED MON & THU",
    completed: "COMPLETED MON & THU",
  },
  "white-days": {
    planned: "PLANNED WHITE DAYS",
    completed: "COMPLETED WHITE DAYS",
  },
  dawood: {
    planned: "PLANNED DAWOOD FAST",
    completed: "COMPLETED DAWOOD FAST",
  },
};

const LABEL_I18N_KEYS: Record<
  string,
  { planned: string | [string, string]; completed: string | [string, string] }
> = {
  "missed-ramadan": {
    planned: [
      "homeScreen.fastingLegend_plannedMissed_l1",
      "homeScreen.fastingLegend_plannedMissed_l2",
    ],
    completed: [
      "homeScreen.fastingLegend_completedMissed_l1",
      "homeScreen.fastingLegend_completedMissed_l2",
    ],
  },
  "mon-thu": {
    planned: "homeScreen.fastingLegend_plannedMonThu",
    completed: "homeScreen.fastingLegend_completedMonThu",
  },
  "white-days": {
    planned: "homeScreen.fastingLegend_plannedWhiteDays",
    completed: "homeScreen.fastingLegend_completedWhiteDays",
  },
  dawood: {
    planned: "homeScreen.fastingLegend_plannedDawood",
    completed: "homeScreen.fastingLegend_completedDawood",
  },
};

function resolveLabel(
  key: string | [string, string] | undefined,
  fallback: LegendLabel | undefined,
  t: (k: any) => string,
): string[] {
  if (Array.isArray(key)) {
    const fb = Array.isArray(fallback) ? fallback : [fallback ?? "", ""];
    return key.map((k, i) => {
      const translated = t(k as any);
      return translated === k ? (fb[i] ?? "") : translated;
    });
  }
  if (typeof key === "string") {
    const translated = t(key as any);
    const fb = typeof fallback === "string" ? fallback : (fallback?.[0] ?? "");
    return [translated === key ? fb : translated];
  }
  if (Array.isArray(fallback)) return [...fallback];
  return fallback ? [fallback] : [];
}

export function FastingLegendItem({
  entry,
  completed = false,
}: FastingLegendItemProps) {
  const { t } = useTypedTranslation();
  const side = completed ? "completed" : "planned";
  const lines = resolveLabel(
    LABEL_I18N_KEYS[entry.id]?.[side],
    FIGMA_LABELS[entry.id]?.[side],
    t,
  ).filter(Boolean);

  return (
    <View style={styles.fastingLegendItem}>
      <View style={styles.fastingLegendRingSlot}>
        <FastingLegendRing color={entry.color} completed={completed} />
      </View>
      <View style={styles.fastingLegendTextCol}>
        {lines.map((line) => (
          <Text key={line} style={styles.fastingLegendText} numberOfLines={1}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
