import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BottomSheet, { BottomSheetFooter } from "@gorhom/bottom-sheet";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BottomSheetWrapper } from "../BottomSheetWrapper";
import { GoalSelectionOpenCloseButton } from "../GoalSelectionOpenCloseButton";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import { TopSpace } from "@/components/atoms/TopSpace";
import { globalStyles } from "@/src/globalstyles/globalstyles";
import { useDeletePrayerLog } from "@/src/api/mutations/useDeletePrayerLog";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";
import type {
  FiveDailyPrayerSlotKey,
  PrayerGoalFrameData,
  PrayerGoalFrameDay,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import type { SunnahPrayerId } from "@/components/molecules/SunnahRawatibDayRing";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import { buildSunnahGoalFromSlotConfig } from "@/src/utils/prayerGoalFrameMap";
import SecondaryButton from "@/components/atoms/Secondary-button";

/** Scroll padding so the last option isn't covered by the pinned footer. */
const FOOTER_SCROLL_SPACER = 140;

type DeleteSlotOption = {
  id: string;
  label: string;
  slotParam: "prayerSlot" | "sunnahSlot";
  slotValue: string;
  /** Sunnah multi-unit slots: which prayer within the slot (1 or 2). */
  unit?: 1 | 2;
};

const FIVE_DAILY_SLOT_ORDER: FiveDailyPrayerSlotKey[] = [
  "FAJR",
  "DHUHR",
  "ASR",
  "MAGHRIB",
  "ISHA",
];

const SUNNAH_BASE_LABEL: Record<SunnahPrayerId, string> = {
  before_fajr: "BEFORE FAJR",
  before_dhuhr: "BEFORE DHUHR",
  after_dhuhr: "AFTER DHUHR",
  before_asr: "BEFORE ASR",
  after_maghrib: "AFTER MAGHRIB",
  after_isha: "AFTER ISHA",
};

const SUNNAH_UI_TO_API: Record<SunnahPrayerId, string> = {
  before_fajr: "BEFORE_FAJR",
  before_dhuhr: "BEFORE_DHUHR",
  after_dhuhr: "AFTER_DHUHR",
  before_asr: "BEFORE_ASR",
  after_maghrib: "AFTER_MAGHRIB",
  after_isha: "AFTER_ISHA",
};

function readSunnahLoggedUnits(
  slots: PrayerGoalFrameDay["slots"],
  apiKey: string,
): number {
  if (!slots) return 0;
  const raw = (slots as Record<string, unknown>)[apiKey];
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.max(0, Math.floor(raw));
  }
  return 0;
}

function buildFiveDailyOptions(
  day: PrayerGoalFrameDay | undefined,
): DeleteSlotOption[] {
  return FIVE_DAILY_SLOT_ORDER.filter((key) =>
    Boolean(day?.slots?.[key]?.logged),
  ).map((key) => ({
    id: key,
    label: key,
    slotParam: "prayerSlot" as const,
    slotValue: key,
  }));
}

function buildSunnahOptions(
  frame: PrayerGoalFrameData | null | undefined,
  day: PrayerGoalFrameDay | undefined,
): DeleteSlotOption[] {
  const goal = buildSunnahGoalFromSlotConfig(frame?.slotConfig);
  const options: DeleteSlotOption[] = [];

  for (const prayer of goal) {
    const api = SUNNAH_UI_TO_API[prayer.id];
    const base = SUNNAH_BASE_LABEL[prayer.id];
    const loggedUnits = readSunnahLoggedUnits(day?.slots, api);

    if (prayer.weight === 2) {
      if (loggedUnits >= 1) {
        options.push({
          id: `${api}:1`,
          label: `${base} — 1ST PRAYER`,
          slotParam: "sunnahSlot",
          slotValue: api,
          unit: 1,
        });
      }
      if (loggedUnits >= 2) {
        options.push({
          id: `${api}:2`,
          label: `${base} — 2ND PRAYER`,
          slotParam: "sunnahSlot",
          slotValue: api,
          unit: 2,
        });
      }
    } else if (loggedUnits >= 1) {
      options.push({
        id: api,
        label: base,
        slotParam: "sunnahSlot",
        slotValue: api,
        unit: 1,
      });
    }
  }

  return options;
}

type Props = {
  /** YYYY-MM-DD of the day whose logs can be removed */
  date: string | null;
  onClose?: () => void;
  /** Called after a successful delete (sheet already closes). */
  onDeleted?: () => void;
};

export const DeletePrayerGoalOptions = forwardRef<BottomSheet, Props>(
  function DeletePrayerGoalOptions({ date, onClose, onDeleted }, ref) {
    const insets = useSafeAreaInsets();
    const prayerFrame = useOptionalPrayerGoalFrameContext();
    const { mutateAsync: deletePrayerLog, isPending } = useDeletePrayerLog();
    const [isOpen, setIsOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const prayerType = prayerFrame?.frame?.prayerType ?? "";
    const resolvedType = resolvePrayerType(prayerType);
    const isSunnah = resolvedType === "SUNNAH_RAWATIB";

    const day = useMemo(() => {
      if (!date || !prayerFrame?.frame?.week?.days) return undefined;
      return prayerFrame.frame.week.days.find((d) => d.date === date);
    }, [date, prayerFrame?.frame?.week?.days]);

    const options = useMemo(() => {
      if (resolvedType === "FIVE_DAILY_PRAYERS") {
        return buildFiveDailyOptions(day);
      }
      if (resolvedType === "SUNNAH_RAWATIB") {
        return buildSunnahOptions(prayerFrame?.frame, day);
      }
      return [];
    }, [resolvedType, day, prayerFrame?.frame]);

    const instructionTitle = isSunnah
      ? "Choose the Sunnah prayer(s) you want to remove from your log."
      : "Choose the prayer(s) you want to remove from your log.";

    useEffect(() => {
      setSelectedIds([]);
      setIsOpen(true);
    }, [date]);

    const toggleDropdown = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsOpen((prev) => !prev);
    }, []);

    const toggleOption = useCallback((id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }, []);

    const handleClose = useCallback(() => {
      setSelectedIds([]);
      onClose?.();
    }, [onClose]);

    const handleDelete = useCallback(async () => {
      if (!date || !prayerType || selectedIds.length === 0 || isPending) return;

      const selected = options.filter((o) => selectedIds.includes(o.id));
      if (selected.length === 0) return;

      try {
        // Every listed option selected → clear the whole day once.
        if (selected.length === options.length) {
          await deletePrayerLog({ prayerType, date });
        } else if (isSunnah) {
          // Group by slot; `count` = how many units to remove from that slot.
          const bySlot = new Map<string, number>();
          for (const option of selected) {
            bySlot.set(
              option.slotValue,
              (bySlot.get(option.slotValue) ?? 0) + 1,
            );
          }
          const entries = Array.from(bySlot.entries());
          for (let i = 0; i < entries.length; i += 1) {
            const [sunnahSlot, count] = entries[i];
            const isLast = i === entries.length - 1;
            await deletePrayerLog({
              prayerType,
              date,
              sunnahSlot,
              count,
              suppressSuccessToast: !isLast,
            });
          }
        } else {
          for (let i = 0; i < selected.length; i += 1) {
            const option = selected[i];
            const isLast = i === selected.length - 1;
            await deletePrayerLog({
              prayerType,
              date,
              prayerSlot: option.slotValue,
              suppressSuccessToast: !isLast,
            });
          }
        }
        handleClose();
        onDeleted?.();
      } catch {
        // Toast handled in mutation onError
      }
    }, [
      date,
      prayerType,
      selectedIds,
      isPending,
      options,
      isSunnah,
      deletePrayerLog,
      handleClose,
      onDeleted,
    ]);

    const deleteDisabled = selectedIds.length === 0 || isPending;

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={insets.bottom}>
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.deleteButton,
                deleteDisabled && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={deleteDisabled}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={Colors.light.red} />
              ) : (
                <Text style={styles.deleteButtonText}>DELETE</Text>
              )}
            </Pressable>
            <TopSpace top={12} />
            <SecondaryButton text="CANCEL" onPress={handleClose} />
          </View>
        </BottomSheetFooter>
      ),
      [deleteDisabled, handleClose, handleDelete, insets.bottom, isPending],
    );

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={isSunnah ? ["75%", "90%"] : ["55%", "70%"]}
        bgColor={Colors.light.blackBackground}
        onClose={handleClose}
        footerComponent={renderFooter}
      >
        <Text style={styles.title}>DELETE PRAYER LOG</Text>
        <TopSpace top={20} />
        <View
          style={{
            backgroundColor: Colors.light.greybuttonBackground,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 8,
          }}
        >
          <GoalSelectionOpenCloseButton
            isOpen={isOpen}
            title={instructionTitle}
            toggleDropdown={toggleDropdown}
          />
        </View>
        <TopSpace top={20} />
        <View
          style={[
            globalStyles.goalSelectionWrapper,
            {
              backgroundColor: Colors.light.greybuttonBackground,
            },
          ]}
        >
          {isOpen ? (
            <View style={styles.optionsList}>
              {options.length === 0 ? (
                <Text style={styles.emptyText}>
                  No prayers available for this day.
                </Text>
              ) : (
                options.map((option, index) => {
                  const isSelected = selectedIds.includes(option.id);
                  const isLast = index === options.length - 1;
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.optionRow,
                        !isLast && styles.optionRowBorder,
                      ]}
                      onPress={() => toggleOption(option.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected ? (
                          <Feather
                            name="check"
                            size={14}
                            color={Colors.light.white}
                          />
                        ) : null}
                      </View>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          ) : null}
        </View>
        <View style={{ height: FOOTER_SCROLL_SPACER }} />
      </BottomSheetWrapper>
    );
  },
);

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    letterSpacing: 0.4,
    marginTop: 16,
  },
  optionsList: {
    width: "100%",
  },
  emptyText: {
    color: Colors.light.subtext,
    fontSize: 13,
    fontFamily: fonts.primary.medium,
    textAlign: "center",
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingTop: 14,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.light.red,
    borderColor: Colors.light.red,
  },
  optionLabel: {
    flex: 1,
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.light.blackBackground,
  },
  deleteButton: {
    width: "100%",
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.red,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 10,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: Colors.light.red,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
