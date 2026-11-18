import { Text, View } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import type { FastingLegendEntry } from "../fastingLegend";
import { styles } from "../styles";
import { FastingLegendRing } from "./FastingLegendRing";

type FastingLegendItemProps = {
  entry: FastingLegendEntry;
  completed?: boolean;
};

/**
 * Figma copy + wrap (line1 / line2):
 *   PLANNED MISSED      / RAMADAN FAST
 *   COMPLETED MISSED    / RAMADAN FAST
 *   PLANNED MON &       / THU
 *   COMPLETED MON &     / THU
 *   PLANNED WHITE       / DAYS
 *   COMPLETED WHITE     / DAYS
 *
 * Dot is vertically centered on the full 2-line block.
 * Line 2 is left-aligned under line 1 (same text column).
 */
const FIGMA_LINES: Record<
  string,
  { planned: [string, string]; completed: [string, string] }
> = {
  "missed-ramadan": {
    planned: ["PLANNED MISSED", "RAMADAN FAST"],
    completed: ["COMPLETED MISSED", "RAMADAN FAST"],
  },
  "mon-thu": {
    planned: ["PLANNED MON &", "THU"],
    completed: ["COMPLETED MON &", "THU"],
  },
  "white-days": {
    planned: ["PLANNED WHITE", "DAYS"],
    completed: ["COMPLETED WHITE", "DAYS"],
  },
  dawood: {
    planned: ["PLANNED DAWOOD", "FAST"],
    completed: ["COMPLETED DAWOOD", "FAST"],
  },
};

const LINE_I18N_KEYS: Record<
  string,
  { planned: [string, string]; completed: [string, string] }
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
    planned: [
      "homeScreen.fastingLegend_plannedMonThu_l1",
      "homeScreen.fastingLegend_plannedMonThu_l2",
    ],
    completed: [
      "homeScreen.fastingLegend_completedMonThu_l1",
      "homeScreen.fastingLegend_completedMonThu_l2",
    ],
  },
  "white-days": {
    planned: [
      "homeScreen.fastingLegend_plannedWhite_l1",
      "homeScreen.fastingLegend_plannedWhite_l2",
    ],
    completed: [
      "homeScreen.fastingLegend_completedWhite_l1",
      "homeScreen.fastingLegend_completedWhite_l2",
    ],
  },
  dawood: {
    planned: [
      "homeScreen.fastingLegend_plannedDawood_l1",
      "homeScreen.fastingLegend_plannedDawood_l2",
    ],
    completed: [
      "homeScreen.fastingLegend_completedDawood_l1",
      "homeScreen.fastingLegend_completedDawood_l2",
    ],
  },
};

function resolveLine(
  key: string | undefined,
  fallback: string | undefined,
  t: (k: any) => string,
): string {
  if (!key) return fallback ?? "";
  const translated = t(key as any);
  return translated === key ? (fallback ?? "") : translated;
}

export function FastingLegendItem({
  entry,
  completed = false,
}: FastingLegendItemProps) {
  const { t } = useTypedTranslation();
  const side = completed ? "completed" : "planned";
  const fallback = FIGMA_LINES[entry.id]?.[side];
  const keys = LINE_I18N_KEYS[entry.id]?.[side];

  const line1 = resolveLine(keys?.[0], fallback?.[0], t);
  const line2 = resolveLine(keys?.[1], fallback?.[1], t);

  return (
    <View style={styles.fastingLegendItem}>
      <View style={styles.fastingLegendRingSlot}>
        <FastingLegendRing color={entry.color} completed={completed} />
      </View>
      <View style={styles.fastingLegendTextCol}>
        <Text style={styles.fastingLegendText} numberOfLines={1}>
          {line1}
        </Text>
        {line2 ? (
          <Text style={styles.fastingLegendText} numberOfLines={1}>
            {line2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
