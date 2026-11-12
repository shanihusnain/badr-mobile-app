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
import { useDeletePrayerSlot } from "@/src/api/mutations/useDeletePrayerSlot";
import { useOptionalPrayerGoalFrameContext } from "@/src/screens/private/goalprogressloggingscreen/prayerGoalFrameContext";
import type {
  FiveDailyPrayerSlotKey,
  PrayerGoalFrameData,
  PrayerGoalFrameDay,
} from "@/src/api/queries/useGetPrayerGoalFrame";
import {
  isSunnahRawatibDayDetail,
  useGetPrayerGoalDayDetail,
} from "@/src/api/queries/useGetPrayerGoalDayDetail";
import type { SunnahPrayerId } from "@/components/molecules/SunnahRawatibDayRing";
import { resolvePrayerType } from "@/src/utils/prayerGoalMap";
import { buildSunnahGoalFromSlotConfig } from "@/src/utils/prayerGoalFrameMap";
import SecondaryButton from "@/components/atoms/Secondary-button";

function normalizeDayDate(value?: string | null): string | null {
  if (!value) return null;
  const slice = String(value).trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : null;
}

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

/**
 * User-logged units for a Sunnah slot (excludes auto-qadha-only fills).
 * Frame/day-detail may send a number or an object with `userLoggedCount` /
 * `loggedCount` / `logged` — the old number-only reader always returned 0
 * for object slots, so the delete sheet showed "No prayers available".
 */
function readSunnahLoggedUnits(
  slots: PrayerGoalFrameDay["slots"],
  apiKey: string,
): number {
  if (!slots) return 0;
  const raw = (slots as Record<string, unknown>)[apiKey];
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.max(0, Math.floor(raw));
  }
  if (!raw || typeof raw !== "object") return 0;
  const slot = raw as {
    userLoggedCount?: number;
    loggedCount?: number;
    count?: number;
    completed?: number;
    logged?: boolean;
    isAutoQadha?: boolean;
  };
  if (
    typeof slot.userLoggedCount === "number" &&
    Number.isFinite(slot.userLoggedCount)
  ) {
    return Math.max(0, Math.floor(slot.userLoggedCount));
  }
  // Auto-qadha alone must not appear as a deletable user log.
  if (slot.isAutoQadha === true && slot.logged !== true) {
    return 0;
  }
  if (typeof slot.loggedCount === "number" && Number.isFinite(slot.loggedCount)) {
    return Math.max(0, Math.floor(slot.loggedCount));
  }
  if (typeof slot.count === "number" && Number.isFinite(slot.count)) {
    return Math.max(0, Math.floor(slot.count));
  }
  if (typeof slot.completed === "number" && Number.isFinite(slot.completed)) {
    return Math.max(0, Math.floor(slot.completed));
  }
  return slot.logged === true ? 1 : 0;
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
  slots: PrayerGoalFrameDay["slots"] | Record<string, unknown> | undefined,
): DeleteSlotOption[] {
  const goal = buildSunnahGoalFromSlotConfig(frame?.slotConfig);
  const options: DeleteSlotOption[] = [];

  for (const prayer of goal) {
    const api = SUNNAH_UI_TO_API[prayer.id];
    const base = SUNNAH_BASE_LABEL[prayer.id];
    const loggedUnits = readSunnahLoggedUnits(
      slots as PrayerGoalFrameDay["slots"],
      api,
    );

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
    const { mutateAsync: deletePrayerLog, isPending: isDeletingDay } =
      useDeletePrayerLog();
    const { mutateAsync: deletePrayerSlot, isPending: isDeletingSlots } =
      useDeletePrayerSlot();
    const isPending = isDeletingDay || isDeletingSlots;
    const [isOpen, setIsOpen] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const prayerType = prayerFrame?.frame?.prayerType ?? "";
    const resolvedType = resolvePrayerType(prayerType);
    const isSunnah = resolvedType === "SUNNAH_RAWATIB";
    const dateKey = normalizeDayDate(date);

    /** Day-detail is source of truth for deletable user logs (userLoggedCount). */
    const { data: dayDetail } = useGetPrayerGoalDayDetail(prayerType, dateKey ?? undefined, {
      enabled: Boolean(dateKey && prayerType),
    });

    const day = useMemo(() => {
      if (!dateKey || !prayerFrame?.frame?.week?.days) return undefined;
      return prayerFrame.frame.week.days.find(
        (d) => normalizeDayDate(d.date) === dateKey,
      );
    }, [dateKey, prayerFrame?.frame?.week?.days]);

    const options = useMemo(() => {
      if (resolvedType === "FIVE_DAILY_PRAYERS") {
        return buildFiveDailyOptions(day);
      }
      if (resolvedType === "SUNNAH_RAWATIB") {
        const detailSlots =
          isSunnahRawatibDayDetail(dayDetail) ? dayDetail.slots : undefined;
        return buildSunnahOptions(
          prayerFrame?.frame,
          detailSlots ?? day?.slots,
        );
      }
      return [];
    }, [resolvedType, day, dayDetail, prayerFrame?.frame]);

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
          // Group by slot; count = how many units to remove from that slot.
          const bySlot = new Map<string, number>();
          for (const option of selected) {
            bySlot.set(
              option.slotValue,
              (bySlot.get(option.slotValue) ?? 0) + 1,
            );
          }
          const sunnahSlots = Array.from(bySlot.entries()).map(
            ([slot, count]) => ({ slot, count }),
          );
          await deletePrayerSlot({ prayerType, date, sunnahSlots });
        } else {
          const slots = Array.from(
            new Set(selected.map((option) => option.slotValue)),
          );
          await deletePrayerSlot({ prayerType, date, slots });
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
      deletePrayerSlot,
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
            <SecondaryButton
              text="CANCEL"
              onPress={handleClose}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
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
            chevronDownWhenOpen
            chevronOpacity={0.45}
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
  cancelButton: {
    borderColor: Colors.light.dullDescriptionText,
  },
  cancelButtonText: {
    color: Colors.light.dullDescriptionText,
  },
});
