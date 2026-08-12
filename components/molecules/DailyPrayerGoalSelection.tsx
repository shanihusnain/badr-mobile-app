import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  FlatList,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { fonts } from "../../assets/fonts";
import CustomSlider from "../atoms/CustomSlider";
import GoalSelectionSaveButton from "./GoalSelectionSaveButton";
import { useTranslation } from "react-i18next";
import { useLocaleNumber } from "../../hooks/useLocaleNumber";
import { GoalSelectionOpenCloseButton } from "./GoalSelectionOpenCloseButton";
import { Divider } from "../atoms/Divider";
import { SwitchButton } from "../atoms/SwitchButton";
import {
  getCongregationalPrayerAdjustments,
  getJumuahCountForCycleStart,
  PRAYER_CYCLE_DAYS,
} from "@/src/utils/prayerCycleUtils";

type PrayerSliderItem = {
  id: string;
  title: string;
  value: number;
  maxDays: number;
  onChange: (val: number) => void;
};

type Props = {
  cycleStartDate?: string;
  initialValues?: {
    fajr?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
    jumuah?: number;
    congregationalTracking?: boolean;
  };
  onSave?: (
    fajr: number,
    dhuhr: number,
    asar: number,
    maghrib: number,
    isha: number,
    jumuah: number,
    trackCongregation: boolean,
    onDone?: () => void,
    onFail?: () => void,
  ) => void;
  isSaving?: boolean;
};

export default function DailyPrayerGoalSelection({
  cycleStartDate,
  onSave,
  initialValues,
  isSaving = false,
}: Props) {
  const { t } = useTranslation();
  const formatNumber = useLocaleNumber();
  const cycleDayCount = PRAYER_CYCLE_DAYS;
  const jumuahCountInCycle = useMemo(
    () => getJumuahCountForCycleStart(cycleStartDate),
    [cycleStartDate],
  );
  const congregationalAdjustments = useMemo(
    () => getCongregationalPrayerAdjustments(cycleStartDate),
    [cycleStartDate],
  );

  const trackingInitiallyOn = Boolean(initialValues?.congregationalTracking);

  const [fajr, setFajr] = useState(
    () => initialValues?.fajr ?? congregationalAdjustments.prayerDefaults.fajr,
  );
  const [dhuhr, setDhuhr] = useState(() => {
    if (trackingInitiallyOn) {
      const saved = initialValues?.dhuhr;
      const adjustedDefault = congregationalAdjustments.dhuhrMax;
      return Math.min(saved ?? adjustedDefault, congregationalAdjustments.dhuhrMax);
    }
    return initialValues?.dhuhr ?? cycleDayCount;
  });
  const [asar, setAsar] = useState(
    () => initialValues?.asr ?? congregationalAdjustments.prayerDefaults.asr,
  );
  const [maghrib, setMaghrib] = useState(
    () =>
      initialValues?.maghrib ?? congregationalAdjustments.prayerDefaults.maghrib,
  );
  const [isha, setIsha] = useState(
    () => initialValues?.isha ?? congregationalAdjustments.prayerDefaults.isha,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isTrackingCongregation, setIsTrackingCongregation] = useState(
    Boolean(initialValues?.congregationalTracking),
  );
  const trackingCongregation = useSharedValue(
    Boolean(initialValues?.congregationalTracking),
  );

  const dhuhrMaxDays = isTrackingCongregation
    ? congregationalAdjustments.dhuhrMax
    : cycleDayCount;

  // Congregational tracking: Jumu'ah count comes from the 28-day cycle start;
  // Dhuhr max is 28 minus that Jumu'ah count (typically 24 when Jumu'ah is 4).
  useEffect(() => {
    if (!isTrackingCongregation) return;

    setDhuhr((prev) =>
      Math.min(prev, congregationalAdjustments.dhuhrMax),
    );
  }, [
    isTrackingCongregation,
    congregationalAdjustments.dhuhrMax,
  ]);

  useEffect(() => {
    setFajr((prev) => Math.min(prev, cycleDayCount));
    setAsar((prev) => Math.min(prev, cycleDayCount));
    setMaghrib((prev) => Math.min(prev, cycleDayCount));
    setIsha((prev) => Math.min(prev, cycleDayCount));
    if (!isTrackingCongregation) {
      setDhuhr((prev) => Math.min(prev, cycleDayCount));
    }
  }, [cycleDayCount, isTrackingCongregation]);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleToggleCongregation = useCallback(() => {
    const nextValue = !isTrackingCongregation;
    trackingCongregation.value = nextValue;
    setIsTrackingCongregation(nextValue);

    if (nextValue) {
      setDhuhr(congregationalAdjustments.dhuhrMax);
      return;
    }

    setDhuhr((prev) =>
      Math.min(cycleDayCount, prev + jumuahCountInCycle),
    );
  }, [
    isTrackingCongregation,
    jumuahCountInCycle,
    congregationalAdjustments.dhuhrMax,
    cycleDayCount,
    trackingCongregation,
  ]);

  const handleSave = (markSaved: () => void, markFailed?: () => void) => {
    onSave?.(
      fajr,
      dhuhr,
      asar,
      maghrib,
      isha,
      isTrackingCongregation ? jumuahCountInCycle : 0,
      isTrackingCongregation,
      markSaved,
      markFailed,
    );
  };

  const sliderData = useMemo<PrayerSliderItem[]>(() => {
    const items: PrayerSliderItem[] = [
      {
        id: "fajr",
        title: t("prayerGoals.fajr"),
        value: fajr,
        maxDays: cycleDayCount,
        onChange: setFajr,
      },
      {
        id: "dhuhr",
        title: t("prayerGoals.dhuhr"),
        value: Math.min(dhuhr, dhuhrMaxDays),
        maxDays: dhuhrMaxDays,
        onChange: (val) => setDhuhr(Math.min(val, dhuhrMaxDays)),
      },
      {
        id: "asar",
        title: t("prayerGoals.asr"),
        value: asar,
        maxDays: cycleDayCount,
        onChange: setAsar,
      },
      {
        id: "maghrib",
        title: t("prayerGoals.maghrib"),
        value: maghrib,
        maxDays: cycleDayCount,
        onChange: setMaghrib,
      },
      {
        id: "isha",
        title: t("prayerGoals.isha"),
        value: isha,
        maxDays: cycleDayCount,
        onChange: setIsha,
      },
    ];

    if (isTrackingCongregation) {
      items.push({
        id: "jumuah",
        title: t("prayerGoals.jumuah"),
        value: jumuahCountInCycle,
        maxDays: jumuahCountInCycle,
        onChange: () => {},
      });
    }

    return items;
  }, [
    asar,
    cycleDayCount,
    dhuhr,
    dhuhrMaxDays,
    fajr,
    isTrackingCongregation,
    isha,
    jumuahCountInCycle,
    maghrib,
    t,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: PrayerSliderItem }) => (
      <View style={styles.sliderGroup}>
        <Text style={styles.sliderHeading}>{item.title}</Text>
        <CustomSlider
          key={`${item.id}-${item.maxDays}-${item.value}`}
          maxDays={item.maxDays}
          initialDays={item.value}
          onChange={item.onChange}
          locked={true}
          compact
          containerStyle={styles.slider}
        />
        {item.id === "dhuhr" && isTrackingCongregation ? (
          <Text style={styles.dhuhrNote}>
            {t("prayerGoals.dhuhrFridayNote")}
          </Text>
        ) : null}
      </View>
    ),
    [isTrackingCongregation, t],
  );

  const totalPrayers =
    fajr +
    dhuhr +
    asar +
    maghrib +
    isha +
    (isTrackingCongregation ? jumuahCountInCycle : 0);

  return (
    <View style={styles.container}>
      <GoalSelectionOpenCloseButton
        title={t("prayerGoals.dailyPrayersTitle")}
        isOpen={isOpen}
        toggleDropdown={toggleDropdown}
      />

      {isOpen && <Divider />}

      {isOpen && (
        <View style={styles.expandedContent}>
          <FlatList
            data={sliderData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          <Text style={styles.valueText}>
            {formatNumber(totalPrayers)}
            <Text style={styles.whiteText}>
              {t("prayerGoals.dailyPrayersSuffix")}
            </Text>
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.trackText}>
                {t("prayerGoals.trackCongregation")}
              </Text>
              <Text style={styles.switchText}>
                {t("prayerGoals.trackCongregationDesc")}
              </Text>
            </View>

            <SwitchButton
              value={trackingCongregation}
              onPress={handleToggleCongregation}
              size="small"
            />
          </View>

          <View style={styles.buttonContainer}>
            <GoalSelectionSaveButton
              text={t("prayerGoals.save").toUpperCase()}
              onPress={handleSave}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
              isLoading={isSaving}
              disabled={isSaving}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    marginVertical: 0,
  },
  expandedContent: {
    width: "100%",
    paddingTop: 12,
    paddingBottom: 6,
  },
  sliderGroup: {
    width: "100%",
    // Track bottom → next label ≈ Figma (~24–25px) with compact slider.
    marginBottom: 8,
    paddingRight: 10,
  },
  sliderHeading: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    alignSelf: "flex-start",
    textAlign: "left",
  },
  slider: {
    // Do not set width here — CustomSlider uses 112% bleed so the track
    // matches the card content width after its internal paddingX inset.
    marginVertical: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  dhuhrNote: {
    color: Colors.light.subtext,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    marginBottom: 0,
  },
  valueText: {
    color: Colors.light.green,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    // Last row already has sliderGroup marginBottom; keep total close to Figma (~32px).
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  whiteText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    // Last row already has sliderGroup marginBottom; keep total close to Figma (~32px).
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  switchRow: {
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  switchCopy: {
    flex: 1,
  },
  trackText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.1,
    textAlign: "left",
  },
  switchText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 14,
    marginTop: 4,
    textAlign: "left",
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  saveButton: {
    width: "100%",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: fonts.primary.medium,
  },
});
