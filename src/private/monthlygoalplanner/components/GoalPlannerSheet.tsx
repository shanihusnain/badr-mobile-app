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

import { ReviewGoalBtn } from "./ReviewGoalBtn";
import ReviewGoalCard from "./ReviewGoalCard";

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
    // lifted sadaqah metrics collected from children
    const [sadaqahMetrics, setSadaqahMetrics] = useState<Record<string, any>>(
      {},
    );
    console.log("teh quran mertics are", quranMetrics);
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
    console.log("the editing goal is", editingGoal);
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
          { id: 6, title: "duha-prayer", label: t("monthlyGoalPlanner.reviewLabels.duha"), totalValue: 10 },
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
            label: t("monthlyGoalPlanner.reviewLabels.quranRecitationCompletion"),
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

    const prayersData = [
      {
        id: "tahayyat-ul-wudhu",
        title: "TAHIYYAT-UL-WUDHU",
        description:
          "A two-rak'ah Sunnah prayer performed right after completing wudhu. It serves to honor the purification process and prepare us for further prayer",
        isSelected: false,
      },
      {
        id: "fiveDailyPrayers",
        title: "The 5 Daily Prayers",
        description:
          "The five obligatory prayers, most beloved to Allah, structure our day when prayed on time, instilling discipline and deepening our gratitude",
        isSelected: false,
      },
      {
        id: "sunnahRawatib",
        title: "Sunnah Rawatib",
        description:
          "Aligns with the Prophet's (PBUH) sunnah and provides opportunities to compensate any shortcomings in obligatory prayers",
        isSelected: false,
      },
      {
        id: "thayyat-ul-masjid",
        title: "THAYYAT-UL-MASJID",
        description:
          "A two-rak’ah prayer performed upon entering the mosque, honoring its sanctity and seeking Allah’s blessings, guidance, and mercy",
        isSelected: false,
      },
      {
        id: "missedPastPrayers",
        title: "Missed Past Prayers",
        description:
          "Many of us have neglected obligatory prayers for weeks, months, or even years. Fulfilling these overdue prayers is a testament to our renewed commitment to Allah",
        isSelected: false,
      },
      {
        id: "duhaPrayer",
        title: "Duha Prayer",
        description:
          "It is performed in sets of 2 rak'ahs anytime from approximately 15-20 minutes after sunrise until about 10-15 minutes before the Dhuhr prayer",
        isSelected: false,
      },
      {
        id: "tawbaPrayer",
        title: "Tawba Prayer",
        description:
          "Also known as the repentance prayer in English, the Tawbah prayer is a sincere 2 rak'ah prayer to seek forgiveness from Allah for our sins",
        isSelected: false,
      },
      {
        id: "istikharah",
        title: "Istikharah PPrayer",
        description:
          "A two rak'ah prayer performed to seek guidance from Allah when faced with a decision. It helps us make choices that align with our faith and best interests",
        isSelected: false,
      },
      {
        id: "shukrPrayer",
        title: "Shukr Prayer",
        description:
          "The Gratitude Prayer (Shukr) is a 2-rak'ah act of thanks to Allah for His countless blessings. It fosters positivity by inspiring recognition of His generosity",
        isSelected: false,
      },
      {
        id: "qiyamalLail",
        title: "Qiyam al-Lail",
        description:
          "Night prayers, performed between Isha and Fajr, are most beloved after obligatory prayers, fostering spiritual growth and inviting Allah’s mercy and blessings",
        isSelected: false,
      },
    ];
    const QuranData = [
      {
        id: "quran-listening",
        title: "Quran Listening",
        description:
          "Listening to the Quran brings tranquility, shields from evil, alleviates stress, enhances recitation, and refines tajweed skills, fostering spiritual growth",
        isSelected: false,
      },
      {
        id: "quran-recitation",
        title: "Quran Recitation",
        description:
          "Reciting the Quran multiplies rewards, refines pronunciation, deepens understanding, and softens hearts, fostering a profound connection with Allah",
        isSelected: false,
      },
      {
        id: "quran-memorization",
        title: "Quran Memorization",
        description:
          "Every word we memorize elevates our rank in Paradise, grants intercession for others, sharpens the mind, and enhances comprehension of the Quran",
        isSelected: false,
      },
      {
        id: "quran-tajweed",
        title: "QURAN TAJWEED",
        description:
          "Tajweed perfects Quranic recitation as revealed to the Prophet (PBUH), preserving its authentic pronunciation, rhythm, and melody while deepening understanding",
        isSelected: false,
      },
    ];

    const fastingData = [
      {
        id: "missed-fasts",
        title: "Missed Ramadan Fasts",
        description:
          "Fulfilling missed obligatory fasts is a duty that reflects devotion, demonstrates discipline, and upholds our commitment to Allah’s commands",
        isSelected: false,
      },
      {
        id: "dawood-fasts",
        title: "The Fast of ProphetDawood",
        description:
          "These fasts are observed by fasting every other day, reflecting Prophet Dawood's (PBUH) devotion and resilience, and serving as a model of piety",
        isSelected: false,
      },
      {
        id: "monday-and-thursday-fasts",
        title: "Monday & Thursday Fasts",
        description:
          "These fasts follow the Prophet's (PBUH) Sunnah, deepen devotion to Allah, promote well-being, and offer profound spiritual purification and self-discipline",
        isSelected: false,
      },
      {
        id: "white-days-fasts",
        title: "White Days Fasts",
        description:
          "Fasting on the 13th, 14th, and 15th of each Islamic month deepens connection with Allah, nurtures discipline, and inspires profound spiritual growth and self-reflection",
        isSelected: false,
      },
    ];
    const sadaqahData = [
      {
        id: "missed-zakat",
        title: "Missed Zakat",
        description:
          "Fulfilling missed Zakat is a sacred obligation that purifies wealth, restores social equity, and reaffirms a believer’s responsibility to support society’s welfare",
        isSelected: false,
      },
      {
        id: "kafarah-for-breaking-fasts",
        title: "Kafarah for Breaking Fasts",
        description:
          "A form of sadaqah to atone for broken fasts or oaths, requiring feeding or clothing those in need as prescribed",
        isSelected: false,
      },
      {
        id: "fidya",
        title: "Fidya",
        description:
          "A form of sadaqah that allows those unable to fast due to illness or age to stay spiritually connected by feeding one person per missed fast day",
        isSelected: false,
      },
      {
        id: "lilah-donations",
        title: "Lilah Donations",
        description:
          "Lillah, derived from the Arabic term 'for Allah', is a pure form of sadaqah driven by a sincere desire to please Allah, fostering devotion and selflessness among Muslims",
        isSelected: false,
      },
      {
        id: "volunteering-services",
        title: "Volunteering Services",
        description:
          "As Muslims, offering our time and skills without expecting any compensation is a noble act and a profound expression of faith, bringing us closer to Allah",
        isSelected: false,
      },
      {
        id: "sadaqah-jariyah",
        title: "Sadaqah Jariyah",
        description:
          "This form of Sadaqah is the most rewarding—it’s the gift that keeps giving, offering endless blessings and rewards in this life and the hereafter",
        isSelected: false,
      },
    ];
    // ── Render ───────────────────────────────────────────────────────────────
    const onSwicthChange = useCallback((prayerId: string) => {
      // console.log("toggled prayer with id:", prayerId);
    }, []);
    // Build a simple data array for the active tab. Use any[] to avoid complex typing across different data shapes
    const tabData: any[] = useMemo(() => {
      switch (activeTab) {
        case "cycle":
          return [];
        case "prayer":
          return prayersData;
        case "quran":
          return QuranData;
        case "fasting":
          return fastingData;
        case "sadaqah":
          return sadaqahData;
        case "review":
          return reviewBtnData;
        default:
          return [];
      }
    }, [activeTab, prayersData, QuranData, fastingData, sadaqahData]);

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
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({ ...prev, listeningHours: hours }));
                setQuranMetrics((prev) => ({
                  ...prev,
                  listeningHours: hours,
                  [key]: [{ id: 1, label: "Hours", value: `${hours} hrs` }],
                }));
                setEditingGoal(null);
              }}
            />
          );
        case "quran-tajweed":
          return (
            <QuranTimeSelection
              title={t("monthlyGoalPlanner.selectNumHours")}
              description={t("monthlyGoalPlanner.hoursQuranTajweed")}
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({ ...prev, tajweedHours: hours }));
                setQuranMetrics((prev) => ({
                  ...prev,
                  tajweedHours: hours,
                  [key]: [{ id: 1, label: "Hours", value: `${hours} hrs` }],
                }));
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
                      { id: 1, label: t("monthlyGoalPlanner.meals"), value: String(kafarahMeals) },
                      { id: 2, label: t("monthlyGoalPlanner.cloths"), value: String(kafarahCloths) },
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
                      { id: 1, label: t("monthlyGoalPlanner.meals"), value: String(fidyaMeals) },
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
                      { id: 1, label: t("monthlyGoalPlanner.amount"), value: String(lillahAmount) },
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
              onSave={(fajr, dhuhr, asar, maghrib, isha) => {
                console.log("Saving daily five prayers with value", {
                  fajr,
                  dhuhr,
                  asar,
                  maghrib,
                  isha,
                });
                setEditingGoal(null);
              }}
            />
          );
        case "sunnah-rawatib":
          return (
            <SunnahRawatibGoalSelection
              onSave={(
                beforeFajr,
                beforeDuhr,
                afterDuhr,
                beforeAsr,
                afterMaghrib,
                afterIsha,
              ) => {
                console.log(
                  "saving subbah rawatib with",
                  beforeFajr,
                  beforeDuhr,
                  afterDuhr,
                  beforeAsr,
                  afterMaghrib,
                  afterIsha,
                );
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
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              <Pressable
                style={styles.commitBtn}
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
                  router.push({
                    pathname: "/home",
                  });
                }}
              >
                <Text style={styles.commitBtnText}>
                  {t("monthlyGoalPlanner.commit")}
                </Text>
              </Pressable>
            </View>
          )}
          renderItem={({ item }: { item: any }) => {
            if (activeTab === "prayer") {
              const prayer = item;
              return (
                <View key={prayer.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={selectedGoals[prayer.id] ?? prayer.isSelected}
                    title={t(`goalsData.${prayer.id}.title`).toUpperCase()}
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: prayer.id },
                      })
                    }
                    description={t(`goalsData.${prayer.id}.description`)}
                    onSwicthPress={onSwicthChange.bind(null, prayer.id)}
                    onToggle={(val) => handleGoalToggle(prayer.id, val)}
                  />
                  {prayer.id === "tahayyat-ul-wudhu" &&
                    selectedGoals[prayer.id] && <TahiyatWuduGoalSelection />}
                  {prayer.id === "fiveDailyPrayers" &&
                    selectedGoals[prayer.id] && <DailyPrayerGoalSelection />}
                  {prayer.id === "sunnahRawatib" &&
                    selectedGoals[prayer.id] && <SunnahRawatibGoalSelection />}
                  {prayer.id === "thayyat-ul-masjid" &&
                    selectedGoals[prayer.id] && <TahiyyatMasjidGoalSelection />}
                  {prayer.id === "missedPastPrayers" &&
                    selectedGoals[prayer.id] && <MissedPrayerGoalSelection />}
                  {prayer.id === "duhaPrayer" && selectedGoals[prayer.id] && (
                    <DuhaPrayerGoalSelection />
                  )}
                  {prayer.id === "tawbaPrayer" && selectedGoals[prayer.id] && (
                    <TawbahPrayerGoalSelection />
                  )}
                  {prayer.id === "istikharah" && selectedGoals[prayer.id] && (
                    <IstikharaPrayerGoalSelection />
                  )}
                  {prayer.id === "shukrPrayer" && selectedGoals[prayer.id] && (
                    <ShukarPrayerGoalSelection />
                  )}
                  {prayer.id === "qiyamalLail" && selectedGoals[prayer.id] && (
                    <QiyamalLaylGoalSelection />
                  )}
                  <TopSpace top={10} />
                </View>
              );
            }

            if (activeTab === "quran") {
              const quran = item;
              return (
                <View key={quran.id}>
                  <GoalCardWithDescriptionAndOptionToSelectGoal
                    initialValue={quran.isSelected}
                    title={t(`goalsData.${quran.id}.title`).toUpperCase()}
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: quran.id },
                      })
                    }
                    description={t(`goalsData.${quran.id}.description`)}
                    onToggle={(val) => handleGoalToggle(quran.id, val)}
                    onSwicthPress={onSwicthChange.bind(null, quran.id)}
                  />
                  {quran.id === "quran-listening" &&
                    selectedGoals[quran.id] && (
                      <QuranTimeSelection
                        title={t("monthlyGoalPlanner.selectNumHours")}
                        description={t("monthlyGoalPlanner.hoursQuranListening")}
                      />
                    )}
                  {quran.id === "quran-tajweed" && selectedGoals[quran.id] && (
                    <QuranTimeSelection
                      title={t("monthlyGoalPlanner.selectNumHours")}
                      description={t("monthlyGoalPlanner.hoursQuranTajweed")}
                    />
                  )}
                  {quran.id === "quran-recitation" &&
                    selectedGoals[quran.id] && (
                      <QuranRecitationGoalSelection
                        title={t("monthlyGoalPlanner.selectTrackingMetric")}
                        onMetricsChange={(payload) => {
                          // store latest metric data by metric name
                          setQuranMetrics((prev) => ({
                            ...prev,
                            [payload.metric]: payload.value,
                          }));
                        }}
                        variant="others"
                      />
                    )}

                  {quran.id === "quran-memorization" &&
                    selectedGoals[quran.id] && (
                      <QuranRecitationGoalSelection
                        title={t("monthlyGoalPlanner.selectTrackingMetric")}
                        onMetricsChange={(payload) => {
                          // store latest metric data by metric name
                          setQuranMetrics((prev) => ({
                            ...prev,
                            [payload.metric]: payload.value,
                          }));
                        }}
                        variant="memorization"
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
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: fasting.id },
                      })
                    }
                    description={t(`goalsData.${fasting.id}.description`)}
                    onSwicthPress={onSwicthChange.bind(null, fasting.id)}
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
                    handleSeeMorePRess={() =>
                      router.push({
                        pathname: "/(private)/goaldescriptiondetails/[goal]",
                        params: { goal: sadaqah.id },
                      })
                    }
                    description={t(`goalsData.${sadaqah.id}.description`)}
                    onSwicthPress={onSwicthChange.bind(null, sadaqah.id)}
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
  commitBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  commitBtnText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
    letterSpacing: 1,
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
