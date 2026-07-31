import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { ScrollView as RNScrollView } from "react-native-gesture-handler";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { GoalCardWithDescriptionAndOptionToSelectGoal } from "./GoalCardWithDescriptionAndOptionToSelectGoal";
import { CycleStartTab } from "./CycleStartTab";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import {
  tahiyyatalwudhubottomsheetimage,
  missedpastprayerbottomsheetimage,
  tahiyyatalmasjidbottomsheetimage,
  sunnahrawatibbottomsheetimage,
  duhaprayerbottomsheetimage,
  tawbahprayerbottomsheetimage,
  istikharaprayerbottomsheetimage,
  shukarprayerbottomsheetimage,
  fivedailyprayerbottomsheetimage,
  qiyamallaylbottomsheetimage,
  missedramadanfastsbottomsheetimage,
  thefastsofprophetdawoodbottomsheetimage,
  mondayandthursdayfastsbottomsheetimage,
  whitedaysfastsbottomsheetimage,
  missedzakatbottomsheetimage,
  kaffarahbottomsheetimage,
  fidyabottomsheetimage,
  lillahdonationbottomsheetimage,
  volunteeringservicesbottomsheetimage,
  sadaqahjariyahbottomsheetimage,
} from "@/assets/images";
import { TopSpace } from "@/components/atoms/TopSpace";
import PrimaryButton from "@/components/atoms/Primary-button";
import TahiyatWuduGoalSelection from "@/components/molecules/TahiyatWuduGoalSelection";
import DailyPrayerGoalSelection from "@/components/molecules/DailyPrayerGoalSelection";
import SunnahRawatibGoalSelection from "@/components/molecules/SunnahRawatibGoalSelection";
import TahiyyatMasjidGoalSelection from "@/components/molecules/TahiyyatMasjidGoalSelection";
import MissedPrayerGoalSelection from "@/components/molecules/MissedPrayerGoalSelection";
import DuhaPrayerGoalSelection from "@/components/molecules/DuhaPrayerGoalSelection";
import TawbahPrayerGoalSelection from "@/components/molecules/TawbahPrayerGoalSelection";
import IstikharaPrayerGoalSelection from "@/components/molecules/IstikharaPrayerGoalSelection";
import ShukarPrayerGoalSelection from "@/components/molecules/ShukarPrayerGoalSelection";
import QiyamalLaylGoalSelection from "@/components/molecules/QiyamalLaylGoalSelection";
import { useForm } from "react-hook-form";
import { MissedZakats } from "@/components/molecules/SadaqahGoalSelectionComponents/MissedZakats";
import { KafarahForBreakingFastsOrOAthSelector } from "@/components/molecules/SadaqahGoalSelectionComponents/KafarahForBreakingFastsOrOAthSelector";
import { FidyaSelector } from "@/components/molecules/SadaqahGoalSelectionComponents/FidyaSelector";
import { QuranTimeSelection } from "@/components/molecules/QuranTimeSelection";
import { QuranRecitationGoalSelection } from "@/components/molecules/QuranRecitaitonSelectorComponents/QuranRecitationGoalSelection";
import MissedRamadanFastGoalSelection from "@/components/molecules/MissedRamadanFastGoalSelection";
import ProphetDawoodFastGoalSelection from "@/components/molecules/ProphetDawoodFastGoalSelection";
import WhiteDaysFastGoalSelection from "@/components/molecules/WhiteDaysFastGoalSelection";
import MondayThursdayFastGoalSelection from "@/components/molecules/MondayThursdayFastGoalSelection";
import { setMondayThursdaySelectedGoalFasts } from "@/src/screens/private/goalprogressloggingscreen/mondayThursdayFastsData";

import { ReviewGoalBtn } from "./ReviewGoalBtn";
import ReviewGoalCard from "./ReviewGoalCard";
import { useGetAllPrayerGoals } from "@/src/api/queries/useGetAllPrayerGoals";
import {
  getFiveDailyInitial,
  getMissedTargetDays,
  getQiyamInitial,
  getSimpleTargetCount,
  getSunnahInitial,
  mapPrayerGoalsFromApi,
  PRAYER_TYPE_TO_UI_ID,
} from "@/src/utils/prayerGoalMap";
import { useTogglePrayerGoalByType } from "@/src/api/mutations/useTogglePrayerGoalByType";
import { useUpsertPrayerGoal } from "@/src/api/mutations/useUpsertPrayerGoal";
import { useGetAllQuranGoals } from "@/src/api/queries/useGetAllQuranGoals";
import { useToggleQuranGoalByType } from "@/src/api/mutations/useToggleQuranGoalByType";
import { useBulkUpsertQuranGoals } from "@/src/api/mutations/useUpsertQuranGoal";
import {
  buildBulkQuranGoalsForVariant,
  buildHoursQuranPayload,
  getQuranTypesForUiId,
  mapQuranGoalsFromApi,
  QURAN_GOAL_LOADING_PLACEHOLDERS,
  type QuranGoalApiItem,
} from "@/src/utils/quranGoalMap";
import { showToast } from "@/src/config/toastConfig";

const PRAYER_GOAL_LOADING_PLACEHOLDERS = Object.keys(PRAYER_TYPE_TO_UI_ID).map(
  (_, index) => ({
    id: `prayer-loading-${index}`,
    isLoadingPlaceholder: true,
  }),
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type Tab =
  | "cycle"
  | "prayer"
  | "quran"
  | "fasting"
  | "sadaqah"
  | "review";

const TABS: { id: Tab; label: string; chip?: string }[] = [
  { id: "cycle", label: "Select Cycle Start Date" },
  { id: "prayer", label: "Prayer Goals", chip: "Category 1" },
  { id: "quran", label: "Quran Goals", chip: "Category 2" },
  { id: "fasting", label: "Fasting Goals", chip: "Category 3" },
  { id: "sadaqah", label: "Sadaqah Goals", chip: "Category 4" },
  { id: "review", label: "Review & Confirm" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type Props = {
  onClose: () => void;
  initialTab?: Tab;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const GoalPlannerSheet = forwardRef<BottomSheet, Props>(
  ({ onClose, initialTab }, ref) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "cycle");
    const [selectedGoals, setSelectedGoals] = useState<Record<string, boolean>>(
      {},
    );

    const [kafarahMeals, setKafarahMeals] = useState<number>(0);
    const [kafarahCloths, setKafarahCloths] = useState<number>(0);
    const [volunteeringHours, setVolunteeringHours] = useState<number>(0);
    const [missedZakatAmount, setMissedZakatAmount] = useState<number>(0);
    const [fidyaMeals, setFidyaMeals] = useState<number>(0);
    const [lillahAmount, setLillahAmount] = useState<number>(0);
    const [sadaqahJariyahAmount, setSadaqahJariyahAmount] = useState<number>(0);
    // lifted Quran metrics collected from children
    const [quranMetrics, setQuranMetrics] = useState<Record<string, any>>({});
    // lifted fasting metrics collected from children
    const [fastingMetrics, setFastingMetrics] = useState<Record<string, any>>(
      {},
    );

    const { data: prayerGoalsFromApi, isLoading: loadingPrayerGoals } =
      useGetAllPrayerGoals({
        enabled: activeTab === "prayer",
      });

    const {
      data: allQuranGoalsResponse,
      isLoading: loadingQuranGoals,
      isError: errorLoadingQuranGoals,
      refetch: refetchQuranGoals,
    } = useGetAllQuranGoals({ enabled: activeTab === "quran" });

    const prayerGoals = useMemo(
      () => mapPrayerGoalsFromApi(prayerGoalsFromApi),
      [prayerGoalsFromApi],
    );

    const quranGoals = useMemo(() => {
      const data = allQuranGoalsResponse as
        | { goals?: QuranGoalApiItem[] }
        | QuranGoalApiItem[]
        | null
        | undefined;
      if (!data) return mapQuranGoalsFromApi([]);
      // Transition / bad cache: older clients stored the bare array or envelope
      if (Array.isArray(data)) return mapQuranGoalsFromApi(data);
      if (Array.isArray(data.goals)) return mapQuranGoalsFromApi(data.goals);
      return mapQuranGoalsFromApi([]);
    }, [allQuranGoalsResponse]);

    // Seed toggle state from backend isActive (only for keys not yet toggled locally)
    useEffect(() => {
      if (!prayerGoals.length) return;
      setSelectedGoals((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const goal of prayerGoals) {
          if (next[goal.id] === undefined) {
            next[goal.id] = goal.isSelected;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, [prayerGoals]);

    useEffect(() => {
      if (!quranGoals.length) return;
      setSelectedGoals((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const goal of quranGoals) {
          if (next[goal.id] === undefined) {
            next[goal.id] = goal.isSelected;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, [quranGoals]);

    // lifted sadaqah metrics collected from children
    const [sadaqahMetrics, setSadaqahMetrics] = useState<Record<string, any>>(
      {},
    );
    const { watch, handleSubmit, control } = useForm({
      defaultValues: {
        missedZakat: "",
        kafarahForBreakingFasts: "",
        lillahDonation: "",
        sadaqahJariyah: "",
      },
      mode: "onChange",
    });

    const [reviewExpanded, setReviewExpanded] = useState<string>("");
    const handleReviewItemPress = useCallback(
      (itemOrName: any) => {
        const name =
          typeof itemOrName === "string" ? itemOrName : itemOrName?.name;
        if (reviewExpanded === name) {
          setReviewExpanded("");
        } else {
          setReviewExpanded(name);
        }
      },
      [reviewExpanded],
    );
    const handleGoalToggle = useCallback(
      (goalId: string, isSelected: boolean) => {
        setSelectedGoals((prev) => ({ ...prev, [goalId]: isSelected }));
      },
      [],
    );
    const [editingGoal, setEditingGoal] = useState<string | null>("");
    const localizedTabs = useMemo(
      () => [
        { id: "cycle" as Tab, label: t("monthlyGoalPlanner.tabCycle") },
        {
          id: "prayer" as Tab,
          label: t("monthlyGoalPlanner.tabPrayer"),
          chip: t("monthlyGoalPlanner.tabChipCategory1"),
        },
        {
          id: "quran" as Tab,
          label: t("monthlyGoalPlanner.tabQuran"),
          chip: t("monthlyGoalPlanner.tabChipCategory2"),
        },
        {
          id: "fasting" as Tab,
          label: t("monthlyGoalPlanner.tabFasting"),
          chip: t("monthlyGoalPlanner.tabChipCategory3"),
        },
        {
          id: "sadaqah" as Tab,
          label: t("monthlyGoalPlanner.tabSadaqah"),
          chip: t("monthlyGoalPlanner.tabChipCategory4"),
        },
        { id: "review" as Tab, label: t("monthlyGoalPlanner.tabReview") },
      ],
      [t],
    );
    const reviewBtnData = [
      {
        id: 1,
        name: "prayerGoals",
        label: t("monthlyGoalPlanner.tabPrayer"),
        appliedGoals: [
          {
            id: 1,
            title: "tahayyat-ul-wuddu",
            label: t("monthlyGoalPlanner.reviewLabels.tahayyatWudu"),
            totalValue: 25,
          },
          {
            id: 2,
            title: "five-daily-prayers",
            label: t("monthlyGoalPlanner.reviewLabels.fiveDailyPrayers"),
            totalValue: 140,
            selectedGoals: [
              {
                id: 1,
                name: "fajr",
                label: t("prayerGoals.fajr"),
                value: 25,
              },
              {
                id: 2,
                name: "dhuhr",
                label: t("prayerGoals.dhuhr"),
                value: 25,
              },
              {
                id: 3,
                name: "asr",
                label: t("prayerGoals.asr"),
                value: 25,
              },
              {
                id: 4,
                name: "maghrib",
                label: t("prayerGoals.maghrib"),
                value: 25,
              },
              {
                id: 5,
                name: "isha",
                label: t("prayerGoals.isha"),
                value: 25,
              },
            ],
          },

          {
            id: 3,
            title: "sunnah-rawatib",
            label: t("monthlyGoalPlanner.reviewLabels.sunnahRawatib"),
            totalValue: 152,
            selectedGoals: [
              {
                id: 1,
                name: "before-fajr",
                label: t("prayerGoals.beforeFajrHeading"),
                value: 25,
              },
              {
                id: 2,
                name: "before-dhuhr",
                label: t("prayerGoals.beforeDhuhrHeading"),
                value: 25,
              },
              {
                id: 3,
                name: "after-dhuhr",
                label: t("prayerGoals.afterDhuhrHeading"),
                value: 25,
              },
              {
                id: 4,
                name: "before-asr",
                label: t("prayerGoals.beforeAsrHeading"),
                value: 25,
              },

              {
                id: 5,
                name: "after-maghrib",
                label: t("prayerGoals.afterMaghribHeading"),
                value: 25,
              },
              {
                id: 6,
                name: "after-isha",
                label: t("prayerGoals.afterIshaHeading"),
                value: 25,
              },
            ],
          },
          {
            id: 4,
            title: "tahayyat-ul-masjid",
            label: t("monthlyGoalPlanner.reviewLabels.tahayyatMasjid"),
            totalValue: 25,
          },
          {
            id: 5,
            title: "missed-past-prayers",
            label: t("monthlyGoalPlanner.reviewLabels.missedPastPrayers"),
            totalValue: 10,
          },
          {
            id: 6,
            title: "duha-prayer",
            label: t("monthlyGoalPlanner.reviewLabels.duha"),
            totalValue: 10,
          },
          {
            id: 7,
            title: "tawba-prayer",
            label: t("monthlyGoalPlanner.reviewLabels.tawba"),
            totalValue: 10,
          },
          {
            id: 8,
            title: "istikhara-prayer",
            label: t("monthlyGoalPlanner.reviewLabels.istikhara"),
            totalValue: 20,
          },
          {
            id: 9,
            title: "shukr-prayer",
            label: t("monthlyGoalPlanner.reviewLabels.shukr"),
            totalValue: 30,
          },
          {
            id: 10,
            title: "qiyal-al-lail-prayer",
            label: t("monthlyGoalPlanner.reviewLabels.qiyalAlLail"),
            totalValue: 20,
            selectedGoals: [
              {
                id: 1,
                name: "2-rakah-prayer",
                label: t("prayerGoals.rakahPrayer").trim(),
                value: 25,
              },
              {
                id: 2,
                name: "witr-prayer",
                label: t("prayerGoals.witrDesc"),
                value: 25,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "quranGoals",
        label: t("monthlyGoalPlanner.tabQuran"),
        appliedGoals: [
          {
            id: 1,
            title: "quran-listening",
            label: t("monthlyGoalPlanner.reviewLabels.quranListening"),
            totalValue: 30,
          },
          {
            id: 2,
            title: "quran-recitation-by-surah",
            label: t("monthlyGoalPlanner.reviewLabels.quranRecitationSurah"),
            totalValue: 50,
          },
          {
            id: 3,
            title: "quran-recitation-by-completion",
            label: t(
              "monthlyGoalPlanner.reviewLabels.quranRecitationCompletion",
            ),
            totalValue: 50,
          },
          {
            id: 4,
            title: "quran-recitation-by-juz",
            label: t("monthlyGoalPlanner.reviewLabels.quranRecitationJuz"),
            totalValue: 50,
          },
          {
            id: 5,
            title: "quran-memorization-by-juz",
            label: t("monthlyGoalPlanner.reviewLabels.quranMemorizationJuz"),
            totalValue: 40,
          },
          {
            id: 6,
            title: "quran-memorization-by-hizb",
            label: t("monthlyGoalPlanner.reviewLabels.quranMemorizationHizb"),
            totalValue: 40,
          },
          {
            id: 7,
            title: "quran-memorization-by-surah",
            label: t("monthlyGoalPlanner.reviewLabels.quranMemorizationSurah"),
            totalValue: 40,
          },
          {
            id: 8,
            title: "quran-tajweed",
            label: t("monthlyGoalPlanner.reviewLabels.quranTajweed"),
            totalValue: 20,
          },
        ],
      },
      {
        id: 3,
        name: "fastingGoals",
        label: t("monthlyGoalPlanner.tabFasting"),
        appliedGoals: [
          {
            id: 1,
            title: "missed-fasts",
            label: t("monthlyGoalPlanner.reviewLabels.missedFasts"),
            totalValue: 20,
            selectedGoals: [
              {
                id: 1,
                name: "ramadan-missed-1",
                label: t("monthlyGoalPlanner.reviewLabels.ramadanMissed1"),
                value: "1445 / Apr 11, 2024",
              },
              {
                id: 2,
                name: "ramadan-missed-2",
                label: t("monthlyGoalPlanner.reviewLabels.ramadanMissed2"),
                value: "1445 / Apr 13, 2024",
              },
            ],
          },
          {
            id: 2,
            title: "dawood-fasts",
            label: t("monthlyGoalPlanner.reviewLabels.dawoodFasts"),
            totalValue: 15,
            selectedGoals: [
              {
                id: 1,
                name: "dawood-1",
                label: t("monthlyGoalPlanner.reviewLabels.mon"),
                value: "01 Oct, 2024",
              },
              {
                id: 2,
                name: "dawood-2",
                label: t("monthlyGoalPlanner.reviewLabels.wed"),
                value: "03 Oct, 2024",
              },
            ],
          },
          {
            id: 3,
            title: "monday-and-thursday-fasts",
            label: t("monthlyGoalPlanner.reviewLabels.mondayThursdayFasts"),
            totalValue: 15,
            selectedGoals: [
              {
                id: 1,
                name: "monthu-1",
                label: t("monthlyGoalPlanner.reviewLabels.monday"),
                value: "28th Jum-I, 1445 / Nov 30, 2024",
              },
              {
                id: 2,
                name: "monthu-2",
                label: t("monthlyGoalPlanner.reviewLabels.thursday"),
                value: "03rd Jum-II, 1445 / Dec 03, 2024",
              },
            ],
          },
          {
            id: 4,
            title: "white-days-fasts",
            label: t("monthlyGoalPlanner.reviewLabels.whiteDaysFasts"),
            totalValue: 10,
            selectedGoals: [
              {
                id: 1,
                name: "white-13",
                label: t("monthlyGoalPlanner.reviewLabels.white13"),
                value: "Shawwal 13, 1445 / Jun 15, 2024",
              },
              {
                id: 2,
                name: "white-14",
                label: t("monthlyGoalPlanner.reviewLabels.white14"),
                value: "Shawwal 14, 1445 / Jun 16, 2024",
              },
              {
                id: 3,
                name: "white-15",
                label: t("monthlyGoalPlanner.reviewLabels.white15"),
                value: "Shawwal 15, 1445 / Jun 17, 2024",
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: "sadaqahGoals",
        label: t("monthlyGoalPlanner.tabSadaqah"),
        appliedGoals: [
          {
            id: 1,
            title: "missed-zakat",
            label: t("monthlyGoalPlanner.reviewLabels.missedZakat"),
            totalValue: 0,
            selectedGoals: [],
          },
          {
            id: 2,
            title: "kafarah-for-breaking-fasts",
            label: t("monthlyGoalPlanner.reviewLabels.kafarahBreakingFasts"),
            totalValue: 0,
            selectedGoals: [],
          },
          {
            id: 3,
            title: "fidya",
            label: t("monthlyGoalPlanner.reviewLabels.fidya"),
            totalValue: 0,
            selectedGoals: [],
          },
          {
            id: 4,
            title: "lilah-donations",
            label: t("monthlyGoalPlanner.reviewLabels.lilahDonations"),
            totalValue: 0,
            selectedGoals: [],
          },
          {
            id: 5,
            title: "volunteering-services",
            label: t("monthlyGoalPlanner.reviewLabels.volunteeringServices"),
            totalValue: 0,
            selectedGoals: [],
          },
          {
            id: 6,
            title: "sadaqah-jariyah",
            label: t("monthlyGoalPlanner.reviewLabels.sadaqahJariyah"),
            totalValue: 0,
            selectedGoals: [],
          },
        ],
      },
    ];
    // Sync tab when sheet is opened with a different initialTab
    useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    const snapPoints = useMemo(() => ["20%", "45%", "95%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    const fastingData = [
      {
        id: "missed-fasts",
        title: "Missed Ramadan Fasts",
        description:
          "Fulfilling missed obligatory fasts is a duty that reflects devotion, demonstrates discipline, and upholds our commitment to Allah’s commands",
        isSelected: false,
        image: missedramadanfastsbottomsheetimage,
      },
      {
        id: "dawood-fasts",
        title: "The Fast of ProphetDawood",
        description:
          "These fasts are observed by fasting every other day, reflecting Prophet Dawood's (PBUH) devotion and resilience, and serving as a model of piety",
        isSelected: false,
        image: thefastsofprophetdawoodbottomsheetimage,
      },
      {
        id: "monday-and-thursday-fasts",
        title: "Monday & Thursday Fasts",
        description:
          "These fasts follow the Prophet's (PBUH) Sunnah, deepen devotion to Allah, promote well-being, and offer profound spiritual purification and self-discipline",
        isSelected: false,
        image: mondayandthursdayfastsbottomsheetimage,
      },
      {
        id: "white-days-fasts",
        title: "White Days Fasts",
        description:
          "Fasting on the 13th, 14th, and 15th of each Islamic month deepens connection with Allah, nurtures discipline, and inspires profound spiritual growth and self-reflection",
        isSelected: false,
        image: whitedaysfastsbottomsheetimage,
      },
    ];
    const sadaqahData = [
      {
        id: "missed-zakat",
        title: "Missed Zakat",
        description:
          "Fulfilling missed Zakat is a sacred obligation that purifies wealth, restores social equity, and reaffirms a believer’s responsibility to support society’s welfare",
        isSelected: false,
        image: missedzakatbottomsheetimage,
      },
      {
        id: "kafarah-for-breaking-fasts",
        title: "Kafarah for Breaking Fasts",
        description:
          "A form of sadaqah to atone for broken fasts or oaths, requiring feeding or clothing those in need as prescribed",
        isSelected: false,
        image: kaffarahbottomsheetimage,
      },
      {
        id: "fidya",
        title: "Fidya",
        description:
          "A form of sadaqah that allows those unable to fast due to illness or age to stay spiritually connected by feeding one person per missed fast day",
        isSelected: false,
        image: fidyabottomsheetimage,
      },
      {
        id: "lilah-donations",
        title: "Lilah Donations",
        description:
          "Lillah, derived from the Arabic term 'for Allah', is a pure form of sadaqah driven by a sincere desire to please Allah, fostering devotion and selflessness among Muslims",
        isSelected: false,
        image: lillahdonationbottomsheetimage,
      },
      {
        id: "volunteering-services",
        title: "Volunteering Services",
        description:
          "As Muslims, offering our time and skills without expecting any compensation is a noble act and a profound expression of faith, bringing us closer to Allah",
        isSelected: false,
        image: volunteeringservicesbottomsheetimage,
      },
      {
        id: "sadaqah-jariyah",
        title: "Sadaqah Jariyah",
        description:
          "This form of Sadaqah is the most rewarding—it’s the gift that keeps giving, offering endless blessings and rewards in this life and the hereafter",
        isSelected: false,
        image: sadaqahjariyahbottomsheetimage,
      },
    ];
    const { mutate: togglePrayerGoalByType } = useTogglePrayerGoalByType();
    const { mutateAsync: toggleQuranGoalByType } = useToggleQuranGoalByType();
    const { mutate: upsertPrayerGoal } = useUpsertPrayerGoal();
    const { mutate: bulkUpsertQuranGoals } = useBulkUpsertQuranGoals();

    const handlePrayerToggle = useCallback(
      (prayerId: string, prayerType: string, isSelected: boolean) => {
        handleGoalToggle(prayerId, isSelected);
        togglePrayerGoalByType(
          { prayerType, isActive: isSelected },
          {
            onError: () => {
              console.log("now we are in error block");

              handleGoalToggle(prayerId, !isSelected);
            },
          },
        );
      },
      [handleGoalToggle, togglePrayerGoalByType],
    );

    const handleQuranToggle = useCallback(
      async (
        quranId: string,
        apiGoals: { quranGoalType: string }[] | undefined,
        isSelected: boolean,
      ) => {
        handleGoalToggle(quranId, isSelected);

        const fromApi =
          apiGoals?.map((g) => g.quranGoalType).filter(Boolean) ?? [];
        const types =
          fromApi.length > 0 ? fromApi : getQuranTypesForUiId(quranId);

        try {
          await Promise.all(
            types.map((quranGoalType) =>
              toggleQuranGoalByType({
                quranGoalType,
                isActive: isSelected,
              }),
            ),
          );
        } catch {
          handleGoalToggle(quranId, !isSelected);
        }
      },
      [handleGoalToggle, toggleQuranGoalByType],
    );

    const saveSimplePrayerTarget = useCallback(
      (prayerType: string, targetCount: number) => {
        upsertPrayerGoal({
          prayerType,
          isActive: true,
          targetCount,
          sliderValue: targetCount,
        });
      },
      [upsertPrayerGoal],
    );

    const saveQuranHoursGoal = useCallback(
      (quranGoalType: "LISTENING" | "TAJWEED", hours: number) => {
        bulkUpsertQuranGoals({
          goals: [buildHoursQuranPayload(quranGoalType, hours)],
        });
      },
      [bulkUpsertQuranGoals],
    );

    const saveQuranMetricGoal = useCallback(
      (
        variant: "recitation" | "memorization",
        /** When set (review editors), only that metric is sent; otherwise all configured metrics. */
        onlyMetric?: "surah" | "juz" | "completion" | "hizb",
      ) => {
        const goals = buildBulkQuranGoalsForVariant(
          variant,
          quranMetrics,
          onlyMetric,
        );
        if (goals.length === 0) {
          showToast("error", "Please complete your goal selection");
          return;
        }
        bulkUpsertQuranGoals({ goals });
      },
      [quranMetrics, bulkUpsertQuranGoals],
    );
    // Build a simple data array for the active tab. Use any[] to avoid complex typing across different data shapes
    const tabData: any[] = useMemo(() => {
      switch (activeTab) {
        case "cycle":
          return [];
        case "prayer":
          return loadingPrayerGoals
            ? PRAYER_GOAL_LOADING_PLACEHOLDERS
            : prayerGoals;
        case "quran":
          return loadingQuranGoals
            ? QURAN_GOAL_LOADING_PLACEHOLDERS
            : quranGoals;
        case "fasting":
          return fastingData;
        case "sadaqah":
          return sadaqahData;
        case "review":
          return reviewBtnData;
        default:
          return [];
      }
    }, [
      activeTab,
      loadingPrayerGoals,
      loadingQuranGoals,
      prayerGoals,
      quranGoals,
      fastingData,
      sadaqahData,
      reviewBtnData,
    ]);

    // Render the appropriate editor/selection component for a goal when it's being edited
    const renderGoalEditor = (goal: any) => {
      if (!goal) return null;
      const key = goal.title;
      switch (key) {
        case "tahayyat-ul-wuddu":
          return (
            <TahiyatWuduGoalSelection
              onSave={(value) => {
                console.log("Saved target Tahiyyat Al-Wudhu:", value);
                setEditingGoal(null);
              }}
            />
          );
        case "quran-listening":
          return (
            <QuranTimeSelection
              title={t("monthlyGoalPlanner.selectNumHours")}
              description={t("monthlyGoalPlanner.hoursQuranListening")}
              quranGoalType="LISTENING"
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  listeningHours: hours,
                  [key]: [{ id: 1, label: "Hours", value: `${hours} hrs` }],
                }));
                saveQuranHoursGoal("LISTENING", hours);
                setEditingGoal(null);
              }}
            />
          );
        case "quran-tajweed":
          return (
            <QuranTimeSelection
              title={t("monthlyGoalPlanner.selectNumHours")}
              description={t("monthlyGoalPlanner.hoursQuranTajweed")}
              quranGoalType="TAJWEED"
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  tajweedHours: hours,
                  [key]: [{ id: 1, label: "Hours", value: `${hours} hrs` }],
                }));
                saveQuranHoursGoal("TAJWEED", hours);
                setEditingGoal(null);
              }}
            />
          );
        case "quran-recitation-by-surah":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.recitationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="others"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    {
                      id: 1,
                      label: "Surah",
                      value: String(prev?.surah ?? ""),
                    },
                  ],
                }));
                saveQuranMetricGoal("recitation", "surah");
                setEditingGoal(null);
              }}
            />
          );
        case "quran-recitation-by-completion":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.recitationByCompletion")}
              initialMetric="completion"
              allowedMetrics={["completion"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="others"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    {
                      id: 1,
                      label: "Completion",
                      value: String(prev?.completion ?? ""),
                    },
                  ],
                }));
                saveQuranMetricGoal("recitation", "completion");
                setEditingGoal(null);
              }}
            />
          );
        case "quran-recitation-by-juz":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.recitationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="others"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    { id: 1, label: "Juz", value: String(prev?.juz ?? "") },
                  ],
                }));
                saveQuranMetricGoal("recitation", "juz");
                setEditingGoal(null);
              }}
            />
          );
        case "quran-memorization-by-juz":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.memorizationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    { id: 1, label: "Juz", value: String(prev?.juz ?? "") },
                  ],
                }));
                saveQuranMetricGoal("memorization", "juz");
                setEditingGoal(null);
              }}
            />
          );
        case "quran-memorization-by-hizb":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.memorizationByHizb")}
              initialMetric="hizb"
              allowedMetrics={["hizb"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    { id: 1, label: "Hizb", value: String(prev?.hizb ?? "") },
                  ],
                }));
                saveQuranMetricGoal("memorization", "hizb");
                setEditingGoal(null);
              }}
            />
          );
        case "quran-memorization-by-surah":
          return (
            <QuranRecitationGoalSelection
              title={t("monthlyGoalPlanner.memorizationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              openOnMount
              onMetricsChange={(payload) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [payload.metric]: payload.value,
                }));
              }}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  [key]: [
                    { id: 1, label: "Surah", value: String(prev?.surah ?? "") },
                  ],
                }));
                saveQuranMetricGoal("memorization", "surah");
                setEditingGoal(null);
              }}
            />
          );
        case "missed-fasts":
          return (
            <MissedRamadanFastGoalSelection
            // this component manages its own selected dates; provide onSave via prop if needed
            />
          );
        case "dawood-fasts":
          return <ProphetDawoodFastGoalSelection />;
        case "monday-and-thursday-fasts":
          return (
            <MondayThursdayFastGoalSelection
              onSave={(selectedDates: string[]) => {
                // format and store in fastingMetrics under this goal key
                const formatted = selectedDates.map((ds, idx) => {
                  const m = new Date(ds);
                  const weekday = m.toLocaleDateString(undefined, {
                    weekday: "long",
                  });
                  const gregorian = m.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  // hijri part (approx): use moment-hijri to format
                  let hijriLabel = gregorian;
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const moment = require("moment-hijri");
                    const hijriParts = moment(ds).format("iD iMMM, iYYYY");
                    hijriLabel = `${hijriParts}`;
                  } catch (e) {
                    // ignore
                  }
                  // store weekday as label and detailed date as value so ReviewGoalCard shows them left/right
                  return {
                    id: idx + 1,
                    label: weekday,
                    value: `${hijriLabel} / ${gregorian}`,
                  };
                });
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: formatted,
                }));
                setMondayThursdaySelectedGoalFasts(selectedDates);
                setEditingGoal(null);
              }}
            />
          );
        case "white-days-fasts":
          return <WhiteDaysFastGoalSelection />;
        // ── Sadaqah editors
        case "missed-zakat":
          return (
            <View>
              <MissedZakats
                count={missedZakatAmount}
                setCount={setMissedZakatAmount}
                control={control}
                name="missedZakat"
                handleDecrease={() =>
                  setMissedZakatAmount((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setMissedZakatAmount((prev) => prev + 1)}
                countTitle={t("monthlyGoalPlanner.amount")}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  // persist into sadaqahMetrics as a single row
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.amount"),
                        value: String(missedZakatAmount),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "kafarah-for-breaking-fasts":
          return (
            <View>
              <KafarahForBreakingFastsOrOAthSelector
                mealCount={kafarahMeals}
                setMealCount={setKafarahMeals}
                clothCount={kafarahCloths}
                setClothCount={setKafarahCloths}
                handleMealDecrease={() =>
                  setKafarahMeals((prev) => Math.max(0, prev - 1))
                }
                handleMealIncrease={() => setKafarahMeals((prev) => prev + 1)}
                handleClothDecrease={() =>
                  setKafarahCloths((prev) => Math.max(0, prev - 1))
                }
                handleClothIncrease={() => setKafarahCloths((prev) => prev + 1)}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.meals"),
                        value: String(kafarahMeals),
                      },
                      {
                        id: 2,
                        label: t("monthlyGoalPlanner.cloths"),
                        value: String(kafarahCloths),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "fidya":
          return (
            <View>
              <FidyaSelector
                count={fidyaMeals}
                setCount={setFidyaMeals}
                handleDecrease={() =>
                  setFidyaMeals((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setFidyaMeals((prev) => prev + 1)}
                title={t("monthlyGoalPlanner.fidyaMealsTitle")}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.meals"),
                        value: String(fidyaMeals),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "lilah-donations":
          return (
            <View>
              <MissedZakats
                count={lillahAmount}
                setCount={setLillahAmount}
                control={control}
                name="lillahDonation"
                handleDecrease={() =>
                  setLillahAmount((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setLillahAmount((prev) => prev + 1)}
                countTitle={t("monthlyGoalPlanner.amount")}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.amount"),
                        value: String(lillahAmount),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "volunteering-services":
          return (
            <View>
              <FidyaSelector
                count={volunteeringHours}
                setCount={setVolunteeringHours}
                handleDecrease={() =>
                  setVolunteeringHours((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setVolunteeringHours((prev) => prev + 1)}
                title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.hours"),
                        value: String(volunteeringHours),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "sadaqah-jariyah":
          return (
            <View>
              <MissedZakats
                count={sadaqahJariyahAmount}
                setCount={setSadaqahJariyahAmount}
                control={control}
                name="sadaqahJariyah"
                handleDecrease={() =>
                  setSadaqahJariyahAmount((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() =>
                  setSadaqahJariyahAmount((prev) => prev + 1)
                }
                countTitle={t("monthlyGoalPlanner.amount")}
              />
              <TopSpace top={12} />
              <PrimaryButton
                text={t("monthlyGoalPlanner.save")}
                onPress={() => {
                  setSadaqahMetrics((prev) => ({
                    ...prev,
                    [goal.title]: [
                      {
                        id: 1,
                        label: t("monthlyGoalPlanner.amount"),
                        value: String(sadaqahJariyahAmount),
                      },
                    ],
                  }));
                  setEditingGoal(null);
                }}
              />
            </View>
          );
        case "five-daily-prayers":
          return (
            <DailyPrayerGoalSelection
              onSave={(
                fajr,
                dhuhr,
                asar,
                maghrib,
                isha,
                jumuah,
                trackCongregation,
              ) => {
                console.log("Saving daily five prayers with value", {
                  fajr,
                  dhuhr,
                  asar,
                  maghrib,
                  isha,
                  jumuah,
                  trackCongregation,
                });
                setEditingGoal(null);
              }}
            />
          );
        case "sunnah-rawatib":
          return (
            <SunnahRawatibGoalSelection
              onSave={(payload) => {
                console.log("saving sunnah rawatib with", payload);
                setEditingGoal(null);
              }}
            />
          );
        case "tahayyat-ul-masjid":
          return (
            <TahiyyatMasjidGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "missed-past-prayers":
          return (
            <MissedPrayerGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "duha-prayer":
          return (
            <DuhaPrayerGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "tawba-prayer":
          return (
            <TawbahPrayerGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "istikhara-prayer":
          return (
            <IstikharaPrayerGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "shukr-prayer":
          return (
            <ShukarPrayerGoalSelection
              onSave={(value) => {
                console.log(value);
                setEditingGoal(null);
              }}
            />
          );
        case "qiyal-al-lail-prayer":
          return (
            <QiyamalLaylGoalSelection
              onSave={(payload: {
                commitment: "every_night" | "flexible";
                twoRakahPrayers: number;
                witrPrayers: number;
                trackTahajjud: "yes" | "no";
              }) => {
                const {
                  commitment,
                  twoRakahPrayers,
                  witrPrayers,
                  trackTahajjud,
                } = payload;
                console.log("Saving Qiyam Al-Lail goal with values:", {
                  commitment,
                  twoRakahPrayers,
                  witrPrayers,
                  trackTahajjud,
                });
                setEditingGoal(null);
              }}
            />
          );
        default:
          return null;
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {localizedTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const hasChip = !!tab.chip;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tab, !hasChip && isActive && styles.tabActive]}
              >
                {hasChip ? (
                  <>
                    <View
                      style={[
                        styles.tabChip,
                        isActive
                          ? styles.tabChipActive
                          : styles.tabChipInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabChipText,
                          isActive && styles.tabChipTextActive,
                        ]}
                      >
                        {tab.chip}
                      </Text>
                    </View>
                    <Text
                      style={[styles.tabText, isActive && styles.tabTextActive]}
                    >
                      {tab.label}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={[styles.tabText, isActive && styles.tabTextActive]}
                  >
                    {tab.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </RNScrollView>

        {/* ── Tab content ── */}
        <BottomSheetFlatList
          data={tabData}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            activeTab === "cycle" ? CycleStartTab : undefined
          }
          ListEmptyComponent={
            activeTab === "quran" && !loadingQuranGoals ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={styles.tabText}>
                  {errorLoadingQuranGoals
                    ? "Failed to load Quran goals"
                    : "No Quran goals available"}
                </Text>
                {errorLoadingQuranGoals ? (
                  <Pressable
                    onPress={() => refetchQuranGoals()}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={[styles.tabText, styles.tabTextActive]}>
                      Tap to retry
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null
          }
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <PrimaryButton
                text={t("monthlyGoalPlanner.commit")}
                onPress={() => {
                  // gather payload for future API integration
                  const payload = {
                    selectedGoals,
                    sadaqah: {
                      missedZakatAmount,
                      kafarahMeals,
                      kafarahCloths,
                      fidyaMeals,
                      lillahAmount,
                      sadaqahJariyahAmount,
                      volunteeringHours,
                    },
                    quran: quranMetrics,
                  };
                  // console.log("======================>>>>>>>>>>>>>>>");
                  // console.log(
                  //   "Commit payload:",
                  //   JSON.stringify(payload, null, 2),
                  // );
                  // console.log("======================>>>>>>>>>>>>>>>");

                  // TODO: call API with payload
                  // Navigate to home screen
                  console.log("payload", payload);
                  router.push({
                    pathname: "/(tabs)",
                  });
                }}
              />
            </View>
          )}
          renderItem={({ item }: { item: any }) => {
            if (activeTab === "prayer") {
              const prayer = item;
              if (prayer.isLoadingPlaceholder) {
                return (
                  <View key={prayer.id}>
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={false}
                      title="---"
                      description="----------------------------------------------"
                      imageSource={undefined}
                      isLoading
                      handleSeeMorePRess={() => {}}
                    />
                    <TopSpace top={10} />
                  </View>
                );
              }
              const isOn = selectedGoals[prayer.id] ?? prayer.isSelected;
              return (
                <View key={prayer.prayerType ?? prayer.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={isOn}
                    title={(
                      prayer.title || t(`goalsData.${prayer.id}.title`)
                    ).toUpperCase()}
                    imageSource={prayer?.image}
                    handleSeeMorePRess={() => {
                      (console.log("prayer", prayer),
                        router.push({
                          pathname: "/(private)/goaldescriptiondetails/[goal]",
                          params: { goal: prayer.prayerType },
                        }));
                    }}
                    description={
                      prayer.description ||
                      t(`goalsData.${prayer.id}.description`)
                    }
                    onToggle={(isSelected) =>
                      handlePrayerToggle(
                        prayer.id,
                        prayer.prayerType,
                        isSelected,
                      )
                    }
                  />
                  {prayer.id === "tahayyat-ul-wudhu" && isOn && (
                    <TahiyatWuduGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 25)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "fiveDailyPrayers" && isOn && (
                    <DailyPrayerGoalSelection
                      initialValues={getFiveDailyInitial(prayer)}
                      onSave={(
                        fajr,
                        dhuhr,
                        asar,
                        maghrib,
                        isha,
                        jumuah,
                        trackCongregation,
                      ) => {
                        upsertPrayerGoal({
                          prayerType: prayer.prayerType,
                          isActive: true,
                          fiveDailyConfig: {
                            fajrTarget: fajr,
                            dhuhrTarget: dhuhr,
                            asrTarget: asar,
                            maghribTarget: maghrib,
                            ishaTarget: isha,
                            jumuahTarget: jumuah,
                            congregationalTracking: trackCongregation,
                          },
                        });
                      }}
                    />
                  )}
                  {prayer.id === "sunnahRawatib" && isOn && (
                    <SunnahRawatibGoalSelection
                      initialValues={getSunnahInitial(prayer)}
                      onSave={(payload) => {
                        upsertPrayerGoal({
                          prayerType: prayer.prayerType,
                          isActive: true,
                          sunnahConfig: {
                            beforeFajrTarget: payload.beforeFajr,
                            beforeDhuhrTarget: payload.beforeDhuhr,
                            afterDhuhrTarget: payload.afterDhuhr,
                            afterDhuhrRakahOption:
                              payload.afterDhuhrRakahOption,
                            beforeAsrEnabled: payload.beforeAsrEnabled,
                            beforeAsrTarget: payload.beforeAsr,
                            beforeAsrRakahOption: payload.beforeAsrRakahOption,
                            afterMaghribTarget: payload.afterMaghrib,
                            afterIshaTarget: payload.afterIsha,
                          },
                        });
                      }}
                    />
                  )}
                  {prayer.id === "thayyat-ul-masjid" && isOn && (
                    <TahiyyatMasjidGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 140)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "missedPastPrayers" && isOn && (
                    <MissedPrayerGoalSelection
                      initialValue={getMissedTargetDays(prayer, 3)}
                      onSave={(value) => {
                        upsertPrayerGoal({
                          prayerType: prayer.prayerType,
                          isActive: true,
                          targetDays: value,
                          targetCount: value * 5,
                          sliderValue: value,
                        });
                      }}
                    />
                  )}
                  {prayer.id === "duhaPrayer" && isOn && (
                    <DuhaPrayerGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 40)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "tawbaPrayer" && isOn && (
                    <TawbahPrayerGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 25)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "istikharah" && isOn && (
                    <IstikharaPrayerGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 25)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "shukrPrayer" && isOn && (
                    <ShukarPrayerGoalSelection
                      initialValue={getSimpleTargetCount(prayer, 25)}
                      onSave={(value) =>
                        saveSimplePrayerTarget(prayer.prayerType, value)
                      }
                    />
                  )}
                  {prayer.id === "qiyamalLail" && isOn && (
                    <QiyamalLaylGoalSelection
                      initialValues={getQiyamInitial(prayer)}
                      onSave={(payload) => {
                        upsertPrayerGoal({
                          prayerType: prayer.prayerType,
                          isActive: true,
                          qiyamConfig: {
                            isFlexible: payload.commitment === "flexible",
                            unitTarget: payload.twoRakahPrayers,
                            trackTahajjud: payload.trackTahajjud === "yes",
                          },
                        });
                      }}
                    />
                  )}
                  <TopSpace top={10} />
                </View>
              );
            }

            if (activeTab === "quran") {
              const quran = item;
              if (quran.isLoadingPlaceholder) {
                return (
                  <View key={quran.id}>
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={false}
                      title="---"
                      description="----------------------------------------------"
                      imageSource={undefined}
                      isLoading
                      handleSeeMorePRess={() => {}}
                    />
                    <TopSpace top={10} />
                  </View>
                );
              }

              const isOn = selectedGoals[quran.id] ?? quran.isSelected;
              return (
                <View key={quran.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={isOn}
                    title={(
                      quran.title || t(`goalsData.${quran.id}.title`)
                    ).toUpperCase()}
                    imageSource={quran.image}
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: quran.id },
                      })
                    }
                    description={
                      quran.description ||
                      t(`goalsData.${quran.id}.description`)
                    }
                    onToggle={(val) =>
                      handleQuranToggle(quran.id, quran.apiGoals, val)
                    }
                  />
                  {quran.id === "quran-listening" && isOn && (
                    <QuranTimeSelection
                      title={t("monthlyGoalPlanner.selectNumHours")}
                      description={t("monthlyGoalPlanner.hoursQuranListening")}
                      quranGoalType="LISTENING"
                      onSave={(hours) => {
                        setQuranMetrics((prev) => ({
                          ...prev,
                          listeningHours: hours,
                        }));
                        saveQuranHoursGoal("LISTENING", hours);
                      }}
                    />
                  )}
                  {quran.id === "quran-tajweed" && isOn && (
                    <QuranTimeSelection
                      title={t("monthlyGoalPlanner.selectNumHours")}
                      description={t("monthlyGoalPlanner.hoursQuranTajweed")}
                      quranGoalType="TAJWEED"
                      onSave={(hours) => {
                        setQuranMetrics((prev) => ({
                          ...prev,
                          tajweedHours: hours,
                        }));
                        saveQuranHoursGoal("TAJWEED", hours);
                      }}
                    />
                  )}
                  {quran.id === "quran-recitation" && isOn && (
                    <QuranRecitationGoalSelection
                      title={t("monthlyGoalPlanner.selectTrackingMetric")}
                      onMetricsChange={(payload) => {
                        setQuranMetrics((prev) => {
                          const current = prev[payload.metric];
                          if (
                            JSON.stringify(current) ===
                            JSON.stringify(payload.value)
                          ) {
                            return prev;
                          }
                          return {
                            ...prev,
                            [payload.metric]: payload.value,
                          };
                        });
                      }}
                      variant="others"
                      onSave={() => saveQuranMetricGoal("recitation")}
                    />
                  )}

                  {quran.id === "quran-memorization" && isOn && (
                    <QuranRecitationGoalSelection
                      title={t("monthlyGoalPlanner.selectTrackingMetric")}
                      onMetricsChange={(payload) => {
                        setQuranMetrics((prev) => {
                          const current = prev[payload.metric];
                          if (
                            JSON.stringify(current) ===
                            JSON.stringify(payload.value)
                          ) {
                            return prev;
                          }
                          return {
                            ...prev,
                            [payload.metric]: payload.value,
                          };
                        });
                      }}
                      variant="memorization"
                      onSave={() => saveQuranMetricGoal("memorization")}
                    />
                  )}
                  <TopSpace top={10} />
                </View>
              );
            }

            if (activeTab === "fasting") {
              const fasting = item;
              return (
                <View key={fasting.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={fasting.isSelected}
                    title={t(`goalsData.${fasting.id}.title`).toUpperCase()}
                    imageSource={fasting.image}
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: fasting.id },
                      })
                    }
                    description={t(`goalsData.${fasting.id}.description`)}
                  />
                  <TopSpace top={10} />
                </View>
              );
            }

            if (activeTab === "sadaqah") {
              const sadaqah = item;
              return (
                <View key={sadaqah.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={sadaqah.isSelected}
                    title={t(`goalsData.${sadaqah.id}.title`).toUpperCase()}
                    imageSource={sadaqah.image}
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: sadaqah.id },
                      })
                    }
                    description={t(`goalsData.${sadaqah.id}.description`)}
                    onToggle={(val) => handleGoalToggle(sadaqah.id, val)}
                  />

                  {sadaqah.id === "missed-zakat" &&
                    selectedGoals[sadaqah.id] && (
                      <MissedZakats
                        count={missedZakatAmount}
                        setCount={setMissedZakatAmount}
                        control={control}
                        name="missedZakat"
                        handleDecrease={() => {
                          setMissedZakatAmount((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setMissedZakatAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                      />
                    )}

                  {sadaqah.id === "kafarah-for-breaking-fasts" &&
                    selectedGoals[sadaqah.id] && (
                      <KafarahForBreakingFastsOrOAthSelector
                        mealCount={kafarahMeals}
                        setMealCount={setKafarahMeals}
                        clothCount={kafarahCloths}
                        setClothCount={setKafarahCloths}
                        handleMealDecrease={() => {
                          setKafarahMeals((prev) => Math.max(0, prev - 1));
                        }}
                        handleMealIncrease={() => {
                          setKafarahMeals((prev) => prev + 1);
                        }}
                        handleClothDecrease={() => {
                          setKafarahCloths((prev) => Math.max(0, prev - 1));
                        }}
                        handleClothIncrease={() => {
                          setKafarahCloths((prev) => prev + 1);
                        }}
                      />
                    )}
                  {sadaqah.id === "fidya" && selectedGoals[sadaqah.id] && (
                    <FidyaSelector
                      count={fidyaMeals}
                      setCount={setFidyaMeals}
                      handleDecrease={() => {
                        setFidyaMeals((prev) => Math.max(0, prev - 1));
                      }}
                      handleIncrease={() => {
                        setFidyaMeals((prev) => prev + 1);
                      }}
                      title={t("monthlyGoalPlanner.fidyaMealsTitle")}
                    />
                  )}

                  {sadaqah.id === "lilah-donations" &&
                    selectedGoals[sadaqah.id] && (
                      <MissedZakats
                        count={lillahAmount}
                        setCount={setLillahAmount}
                        control={control}
                        name="lillahDonation"
                        handleDecrease={() => {
                          setLillahAmount((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setLillahAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                      />
                    )}

                  {sadaqah.id === "volunteering-services" &&
                    selectedGoals[sadaqah.id] && (
                      <FidyaSelector
                        count={volunteeringHours}
                        setCount={setVolunteeringHours}
                        handleDecrease={() => {
                          setVolunteeringHours((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setVolunteeringHours((prev) => prev + 1);
                        }}
                        title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
                      />
                    )}
                  {sadaqah.id === "sadaqah-jariyah" &&
                    selectedGoals[sadaqah.id] && (
                      <MissedZakats
                        count={sadaqahJariyahAmount}
                        setCount={setSadaqahJariyahAmount}
                        control={control}
                        name="sadaqahJariyah"
                        handleDecrease={() => {
                          setSadaqahJariyahAmount((prev) =>
                            Math.max(0, prev - 1),
                          );
                        }}
                        handleIncrease={() => {
                          setSadaqahJariyahAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                      />
                    )}

                  <TopSpace top={10} />
                </View>
              );
            }
            if (activeTab === "review") {
              const reviewItem = item;
              return (
                <>
                  <ReviewGoalBtn
                    reviewItem={reviewItem}
                    reviewExpanded={reviewExpanded}
                    handleReviewItemPress={() =>
                      handleReviewItemPress(reviewItem)
                    }
                  />

                  {reviewExpanded === reviewItem?.name && (
                    <>
                      {reviewItem?.appliedGoals?.map((goal: any) => {
                        const isEditing = editingGoal === goal.title;
                        // merge any saved metrics (fasting, sadaqah) into selectedGoals
                        const fastingSelected =
                          fastingMetrics?.[goal.title] ?? [];
                        const sadaqahSelected =
                          sadaqahMetrics?.[goal.title] ?? [];
                        const quranSelected = quranMetrics?.[goal.title] ?? [];
                        const baseSelected = goal.selectedGoals ?? [];
                        const mergedSelected = [
                          ...baseSelected,
                          ...fastingSelected,
                          ...sadaqahSelected,
                          ...quranSelected,
                        ].map((entry: any, i: number) => ({
                          // reassign a stable unique id per merged array index to avoid duplicate keys
                          id: i + 1,
                          name: entry?.name ?? `item-${i + 1}`,
                          label: entry?.label ?? "",
                          value: entry?.value ?? "",
                        }));
                        const goalWithSelected = mergedSelected.length
                          ? { ...goal, selectedGoals: mergedSelected }
                          : goal;
                        return (
                          <View key={goal.id}>
                            <ReviewGoalCard
                              goal={goalWithSelected}
                              handleEditPress={() => {
                                console.log(
                                  "editing goal with id:",
                                  goal.title,
                                );
                                setEditingGoal(goal.title);
                                setReviewExpanded(reviewItem?.name);
                              }}
                            />

                            {isEditing && (
                              <View style={{ marginTop: 8 }}>
                                {renderGoalEditor(goal)}
                              </View>
                            )}
                          </View>
                        );
                      })}

                      <TopSpace top={10} />
                    </>
                  )}
                </>
              );
            }
            return null;
          }}
        />
      </BottomSheet>
    );
  },
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBg: {
    backgroundColor: Colors.light.blackBackground,
  },
  handle: {
    backgroundColor: Colors.light.white,
    width: 100,
    opacity: 0.5,
  },
  // ── Tab bar
  tabBar: {
    flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.light.green,
  },
  tabText: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  tabTextActive: {
    color: Colors.light.white,
    fontSize: 13,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  // ── Category chip inside tabs
  tabChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabChipActive: {
    backgroundColor: Colors.light.green,
  },
  tabChipInactive: {
    backgroundColor: Colors.light.calendarBg,
  },
  tabChipText: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  tabChipTextActive: {
    color: Colors.light.white,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
  },
  tabDivider: {},
  // ── Content
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 12,
  },
  // ── Cycle Start tab
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    alignSelf: "center",
  },
  monthNavCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rangeRow: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  rangeLabel: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textAlign: "center",
  },
  hijriLabel: {
    color: Colors.light.grey,
    fontSize: 11,
    fontFamily: fonts.primary.regular,
    textAlign: "center",
    marginTop: 2,
  },
  navBtn: {
    padding: 8,
  },
  monthLabel: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  cycleTopBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  cycleDescription: {
    fontSize: 13,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    lineHeight: 20,
  },
  cycleFooter: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  cycleInfoText: {
    color: Colors.light.dullWhite,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
    flex: 1,
  },
  cycleHighlight: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
  },
  // ── Footer & Review styles
  footerContainer: {
    paddingVertical: 20,
  },
});
