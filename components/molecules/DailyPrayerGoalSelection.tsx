import React, { useCallback, useMemo, useState } from "react";
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
  getJumuahCountForCycle,
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
  const jumuahCountInCycle = useMemo(
    () => getJumuahCountForCycle(cycleStartDate),
    [cycleStartDate],
  );

  const [fajr, setFajr] = useState(initialValues?.fajr ?? PRAYER_CYCLE_DAYS);
  const [dhuhr, setDhuhr] = useState(initialValues?.dhuhr ?? PRAYER_CYCLE_DAYS);
  const [asar, setAsar] = useState(initialValues?.asr ?? PRAYER_CYCLE_DAYS);
  const [maghrib, setMaghrib] = useState(
    initialValues?.maghrib ?? PRAYER_CYCLE_DAYS,
  );
  const [isha, setIsha] = useState(initialValues?.isha ?? PRAYER_CYCLE_DAYS);
  const [jumuah, setJumuah] = useState(initialValues?.jumuah ?? 0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTrackingCongregation, setIsTrackingCongregation] = useState(
    Boolean(initialValues?.congregationalTracking),
  );
  const trackingCongregation = useSharedValue(
    Boolean(initialValues?.congregationalTracking),
  );

  const dhuhrMaxDays = isTrackingCongregation
    ? PRAYER_CYCLE_DAYS - jumuahCountInCycle
    : PRAYER_CYCLE_DAYS;

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  const handleToggleCongregation = useCallback(() => {
    const nextValue = !isTrackingCongregation;
    trackingCongregation.value = nextValue;
    setIsTrackingCongregation(nextValue);

    if (nextValue) {
      const maxDhuhr = PRAYER_CYCLE_DAYS - jumuahCountInCycle;
      setJumuah(jumuahCountInCycle);
      setDhuhr((prev) =>
        Math.min(maxDhuhr, Math.max(0, prev - jumuahCountInCycle)),
      );
      return;
    }

    setDhuhr((prev) => Math.min(PRAYER_CYCLE_DAYS, prev + jumuah));
    setJumuah(0);
  }, [
    isTrackingCongregation,
    jumuah,
    jumuahCountInCycle,
    trackingCongregation,
  ]);

  const handleSave = (markSaved: () => void) => {
    onSave?.(
      fajr,
      dhuhr,
      asar,
      maghrib,
      isha,
      jumuah,
      isTrackingCongregation,
      markSaved,
    );
  };

  const sliderData = useMemo<PrayerSliderItem[]>(() => {
    const items: PrayerSliderItem[] = [
      {
        id: "fajr",
        title: t("prayerGoals.fajr"),
        value: fajr,
        maxDays: PRAYER_CYCLE_DAYS,
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
        maxDays: PRAYER_CYCLE_DAYS,
        onChange: setAsar,
      },
      {
        id: "maghrib",
        title: t("prayerGoals.maghrib"),
        value: maghrib,
        maxDays: PRAYER_CYCLE_DAYS,
        onChange: setMaghrib,
      },
      {
        id: "isha",
        title: t("prayerGoals.isha"),
        value: isha,
        maxDays: PRAYER_CYCLE_DAYS,
        onChange: setIsha,
      },
    ];

    if (isTrackingCongregation) {
      items.push({
        id: "jumuah",
        title: t("prayerGoals.jumuah"),
        value: jumuah,
        maxDays: jumuahCountInCycle,
        onChange: setJumuah,
      });
    }

    return items;
  }, [
    asar,
    dhuhr,
    dhuhrMaxDays,
    fajr,
    isTrackingCongregation,
    isha,
    jumuah,
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
    (isTrackingCongregation ? jumuah : 0);

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
