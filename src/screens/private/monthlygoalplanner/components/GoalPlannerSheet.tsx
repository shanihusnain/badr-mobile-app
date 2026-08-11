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
import WarningModal from "@/components/atoms/WarningModal";
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
import { useGetAllFastingGoals } from "@/src/api/queries/useGetAllFastingGoals";
import { useGetAllSadaqahGoals } from "@/src/api/queries/useGetAllSadaqahGoals";
import { useGetFastingCalendarPreview } from "@/src/api/queries/useGetFastingCalendarPreview";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useGetGoalCycleById } from "@/src/api/queries/useGetGoalCycleById";
import {
  mapReviewFromGoalCycle,
  resolveJuzOrHizbReviewRow,
  formatSurahRecitationReviewLabel,
  formatFastingReviewRowsFromDates,
  buildJuzRecitationRangeReviewRow,
  countJuzInRange,
  parseJuzRangeReviewName,
} from "@/src/utils/mapReviewFromGoalCycle";
import { useToggleQuranGoalByType } from "@/src/api/mutations/useToggleQuranGoalByType";
import { useToggleFastingGoalByType } from "@/src/api/mutations/useToggleFastingGoalByType";
import { useToggleSadaqahGoalByType } from "@/src/api/mutations/useToggleSadaqahGoalByType";
import { useUpsertSadaqahGoal } from "@/src/api/mutations/useUpsertSadaqahGoal";
import { useBulkUpsertQuranGoals } from "@/src/api/mutations/useUpsertQuranGoal";
import {
  buildBulkQuranGoalsForVariant,
  buildHoursQuranPayload,
  getQuranTypesForUiId,
  mapQuranGoalsFromApi,
  QURAN_GOAL_LOADING_PLACEHOLDERS,
  type QuranGoalApiItem,
} from "@/src/utils/quranGoalMap";
import {
  FASTING_GOAL_LOADING_PLACEHOLDERS,
  mapFastingGoalsFromApi,
  resolveFastingType,
} from "@/src/utils/fastingGoalMap";
import {
  SADAQAH_GOAL_LOADING_PLACEHOLDERS,
  mapSadaqahGoalsFromApi,
  resolveSadaqahType,
  extractCurrencyCode,
} from "@/src/utils/sadaqahGoalMap";
import { currencyOptionFromCode } from "@/components/molecules/CurrencyAndAmountSelector";
import { getDefaultSadaqahCurrency } from "@/src/storage/sadaqahCurrencyStorage";
import { buildFastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
import { showToast } from "@/src/config/toastConfig";

const SADAQAH_CURRENCY_FIELDS = [
  "missedZakat",
  "lillahDonation",
  "sadaqahJariyah",
] as const;

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

type Props = {
  onClose: () => void;
  initialTab?: Tab;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const GoalPlannerSheet = forwardRef<BottomSheet, Props>(
  ({ onClose, initialTab }, ref) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "cycle");
    const [cycleStartDate, setCycleStartDate] = useState<string | null>(null);
    const [cycleEndDate, setCycleEndDate] = useState<string | null>(null);
    const isCycleDateSelected = !!cycleStartDate;
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
    const [fastingGoalConflictModal, setFastingGoalConflictModal] = useState<{
      visible: boolean;
      message: string;
    }>({ visible: false, message: "" });
    const [finishSaveModalVisible, setFinishSaveModalVisible] = useState(false);
    const [sheetScrollEnabled, setSheetScrollEnabled] = useState(true);

    const handleNestedMetricScrollActive = useCallback((active: boolean) => {
      setSheetScrollEnabled(!active);
    }, []);

    const handleQuranMetricsChange = useCallback(
      (payload: { metric: string; value: any }) => {
        setQuranMetrics((prev) => {
          if (
            JSON.stringify(prev[payload.metric]) ===
            JSON.stringify(payload.value)
          ) {
            return prev;
          }
          return {
            ...prev,
            [payload.metric]: payload.value,
          };
        });
      },
      [],
    );

    const closeFastingGoalConflictModal = useCallback(() => {
      setFastingGoalConflictModal({ visible: false, message: "" });
    }, []);

    const closeFinishSaveModal = useCallback(() => {
      setFinishSaveModalVisible(false);
    }, []);

    const confirmFinishAndSave = useCallback(() => {
      setFinishSaveModalVisible(false);
      router.push({ pathname: "/(tabs)" });
    }, []);

    const { data: meUser } = useGetMe();
    const goalCycleId = meUser?.goalCycleId ?? null;
    const { data: goalCycleDetail } = useGetGoalCycleById(goalCycleId);

    // Hydrate cycle dates from API as the source of truth when the user returns.
    useEffect(() => {
      if (!goalCycleDetail?.startDate) return;
      setCycleStartDate((prev) => prev ?? goalCycleDetail.startDate);
      setCycleEndDate((prev) => prev ?? goalCycleDetail.endDate);
    }, [goalCycleDetail?.startDate, goalCycleDetail?.endDate]);

    const { data: prayerGoalsFromApi, isLoading: loadingPrayerGoals } =
      useGetAllPrayerGoals({
        enabled: activeTab === "prayer" || activeTab === "review",
      });

    const {
      data: allQuranGoalsResponse,
      isLoading: loadingQuranGoals,
      isError: errorLoadingQuranGoals,
      refetch: refetchQuranGoals,
    } = useGetAllQuranGoals({
      enabled: activeTab === "quran" || activeTab === "review",
    });

    const { data: allFastingGoalsResponse, isLoading: loadingFastingGoals } =
      useGetAllFastingGoals({
        enabled: activeTab === "fasting" || activeTab === "review",
      });

    const { data: allSadaqahGoalsResponse, isLoading: loadingSadaqahGoals } =
      useGetAllSadaqahGoals({
        enabled: activeTab === "sadaqah" || activeTab === "review",
      });

    const { data: fastingCalendarPreview } = useGetFastingCalendarPreview({
      enabled: activeTab === "fasting" || activeTab === "review",
    });

    const fastingCalendarWindow = useMemo(
      () => buildFastingCalendarWindow(fastingCalendarPreview),
      [fastingCalendarPreview],
    );

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

    const fastingGoals = useMemo(
      () => mapFastingGoalsFromApi(allFastingGoalsResponse?.goals),
      [allFastingGoalsResponse],
    );

    const sadaqahGoals = useMemo(
      () => mapSadaqahGoalsFromApi(allSadaqahGoalsResponse?.goals),
      [allSadaqahGoalsResponse],
    );

    const emptySurahReference = useMemo(() => [], []);
    const emptyHizbReference = useMemo(() => [], []);
    const emptyJuzReference = useMemo(() => [], []);

    const quranReferenceProps = useMemo(
      () => ({
        surahReference:
          allQuranGoalsResponse?.reference.surahs ?? emptySurahReference,
        hizbReference:
          allQuranGoalsResponse?.reference.hizb ?? emptyHizbReference,
        juzReference: allQuranGoalsResponse?.reference.juz ?? emptyJuzReference,
        isReferenceLoading: loadingQuranGoals,
        onNestedScrollActiveChange: handleNestedMetricScrollActive,
      }),
      [
        allQuranGoalsResponse,
        loadingQuranGoals,
        handleNestedMetricScrollActive,
        emptySurahReference,
        emptyHizbReference,
        emptyJuzReference,
      ],
    );

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

    useEffect(() => {
      if (!fastingGoals.length) return;
      setSelectedGoals((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const goal of fastingGoals) {
          if (next[goal.id] === undefined) {
            next[goal.id] = goal.isSelected;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, [fastingGoals]);

    useEffect(() => {
      if (!sadaqahGoals.length) return;
      setSelectedGoals((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const goal of sadaqahGoals) {
          if (next[goal.id] === undefined) {
            next[goal.id] = goal.isSelected;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, [sadaqahGoals]);

    // lifted sadaqah metrics collected from children
    const [sadaqahMetrics, setSadaqahMetrics] = useState<Record<string, any>>(
      {},
    );
    const { watch, handleSubmit, control, getValues, setValue } = useForm({
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
    const reviewBtnData = useMemo(
      () =>
        mapReviewFromGoalCycle(
          goalCycleDetail,
          t,
          {
            juz: allQuranGoalsResponse?.reference.juz,
            hizb: allQuranGoalsResponse?.reference.hizb,
          },
          {
            missedRamadanDates: fastingCalendarWindow?.missedRamadanDates,
          },
        ),
      [
        goalCycleDetail,
        t,
        allQuranGoalsResponse?.reference.juz,
        allQuranGoalsResponse?.reference.hizb,
        fastingCalendarWindow?.missedRamadanDates,
      ],
    );

    const handleCycleDateSelect = useCallback(
      (startDate: string, endDate: string) => {
        setCycleStartDate(startDate);
        setCycleEndDate(endDate);
      },
      [],
    );

    const handleTabPress = useCallback(
      (tabId: Tab) => {
        if (tabId !== "cycle" && !cycleStartDate) return;
        setActiveTab(tabId);
      },
      [cycleStartDate],
    );

    // Sync tab when sheet is opened with a different initialTab.
    // Other tabs stay locked on the cycle tab until a cycle date is selected.
    useEffect(() => {
      if (!cycleStartDate) {
        setActiveTab("cycle");
        return;
      }
      if (initialTab) setActiveTab(initialTab);
    }, [initialTab, cycleStartDate]);

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
    const { mutate: toggleFastingGoalByType } = useToggleFastingGoalByType();
    const { mutate: toggleSadaqahGoalByType } = useToggleSadaqahGoalByType();
    const { mutate: upsertSadaqahGoal, isPending: isSavingSadaqah } =
      useUpsertSadaqahGoal();
    const { mutate: upsertPrayerGoal, isPending: isSavingPrayer } =
      useUpsertPrayerGoal();
    console.log("isSavingPrayer", isSavingPrayer);
    const { mutate: bulkUpsertQuranGoals, isPending: isSavingQuran } =
      useBulkUpsertQuranGoals();

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

    const handleFastingToggle = useCallback(
      (
        fastingId: string,
        fastingType: string | undefined,
        isSelected: boolean,
      ) => {
        const type = resolveFastingType(fastingType || fastingId);
        handleGoalToggle(fastingId, isSelected);
        toggleFastingGoalByType(
          { fastingType: type, isActive: isSelected },
          {
            onError: (error: any) => {
              handleGoalToggle(fastingId, !isSelected);
              const message =
                error?.response?.data?.message ??
                "You can only set this goal if you do not set goals for the other three fasting options.";
              setFastingGoalConflictModal({ visible: true, message });
            },
          },
        );
      },
      [handleGoalToggle, toggleFastingGoalByType],
    );

    const handleSadaqahToggle = useCallback(
      (
        sadaqahId: string,
        sadaqahType: string | undefined,
        isSelected: boolean,
      ) => {
        const type = resolveSadaqahType(sadaqahType || sadaqahId);
        handleGoalToggle(sadaqahId, isSelected);
        toggleSadaqahGoalByType(
          { sadaqahType: type, isActive: isSelected },
          {
            onError: () => {
              handleGoalToggle(sadaqahId, !isSelected);
            },
          },
        );
      },
      [handleGoalToggle, toggleSadaqahGoalByType],
    );

    const persistSadaqahMetrics = useCallback(
      (
        goalKey: string,
        rows: { id: number; label: string; value: string }[],
      ) => {
        setSadaqahMetrics((prev) => ({
          ...prev,
          [goalKey]: rows,
        }));
      },
      [],
    );

    const saveMissedZakatGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (missedZakatAmount < 1) {
          showToast("error", "Enter a missed zakat amount greater than 0");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "MISSED_ZAKAT",
            targetAmount: missedZakatAmount,
            currencyCode: extractCurrencyCode(getValues("missedZakat")),
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, [
                {
                  id: 1,
                  label: t("monthlyGoalPlanner.amount"),
                  value: String(missedZakatAmount),
                },
              ]);
              onDone?.();
            },
          },
        );
      },
      [
        missedZakatAmount,
        upsertSadaqahGoal,
        getValues,
        persistSadaqahMetrics,
        t,
      ],
    );

    const saveKaffarahGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (kafarahMeals < 1 && kafarahCloths < 1) {
          showToast("error", "Enter meals or clothing items for kaffarah");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "KAFFARAH",
            kaffarahMealsTarget: kafarahMeals,
            kaffarahItemsTarget: kafarahCloths,
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, [
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
              ]);
              onDone?.();
            },
          },
        );
      },
      [
        kafarahMeals,
        kafarahCloths,
        upsertSadaqahGoal,
        persistSadaqahMetrics,
        t,
      ],
    );

    const saveFidyaGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (fidyaMeals < 1) {
          showToast("error", "Enter a fidya meal count greater than 0");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "FIDYA",
            targetAmount: fidyaMeals,
            targetUnit: "MEALS",
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              onDone?.();
            },
          },
        );
      },
      [fidyaMeals, upsertSadaqahGoal, persistSadaqahMetrics],
    );

    const saveLillahGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (lillahAmount < 1) {
          showToast("error", "Enter a lillah amount greater than 0");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "LILLAH",
            targetAmount: lillahAmount,
            currencyCode: extractCurrencyCode(getValues("lillahDonation")),
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              onDone?.();
            },
          },
        );
      },
      [lillahAmount, upsertSadaqahGoal, getValues, persistSadaqahMetrics],
    );

    const saveVolunteeringGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (volunteeringHours < 1) {
          showToast("error", "Enter volunteering hours greater than 0");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "VOLUNTEERING",
            // Backend stores volunteering target in minutes
            targetAmount: volunteeringHours * 60,
            causeCategory: "community_service",
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              onDone?.();
            },
          },
        );
      },
      [volunteeringHours, upsertSadaqahGoal, persistSadaqahMetrics],
    );

    const saveSadaqahJariyahGoal = useCallback(
      (goalKey: string, onDone?: () => void) => {
        if (sadaqahJariyahAmount < 1) {
          showToast("error", "Enter a sadaqah jariyah amount greater than 0");
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "SADAQAH_JARIYAH",
            targetAmount: sadaqahJariyahAmount,
            currencyCode: extractCurrencyCode(getValues("sadaqahJariyah")),
            causeCategory: "general",
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              onDone?.();
            },
          },
        );
      },
      [
        sadaqahJariyahAmount,
        upsertSadaqahGoal,
        getValues,
        persistSadaqahMetrics,
      ],
    );

    // Seed sadaqah counters / currency from API when goals load (don't overwrite in-progress edits)
    useEffect(() => {
      const sourceGoals =
        sadaqahGoals.length > 0
          ? sadaqahGoals
          : (goalCycleDetail?.sadaqahGoals ?? []);

      const seedCurrencyIfEmpty = (
        field: (typeof SADAQAH_CURRENCY_FIELDS)[number],
        currencyCode?: string | null,
      ) => {
        if (!currencyCode) return;
        const current = getValues(field);
        if (current && String(current).trim().length > 0) return;
        setValue(field, currencyOptionFromCode(currencyCode), {
          shouldDirty: false,
        });
      };

      for (const goal of sourceGoals) {
        const amount = goal.targetAmount ?? 0;
        switch (goal.sadaqahType) {
          case "MISSED_ZAKAT":
            if (amount <= 0) break;
            setMissedZakatAmount((prev) => (prev > 0 ? prev : amount));
            seedCurrencyIfEmpty("missedZakat", goal.currencyCode);
            break;
          case "KAFFARAH":
            setKafarahMeals((prev) =>
              prev > 0 ? prev : Math.max(0, goal.kaffarahMealsTarget ?? 0),
            );
            setKafarahCloths((prev) =>
              prev > 0 ? prev : Math.max(0, goal.kaffarahItemsTarget ?? 0),
            );
            // Backward-compatibility for older payload shape.
            if (
              (goal.kaffarahMealsTarget ?? 0) <= 0 &&
              (goal.kaffarahItemsTarget ?? 0) <= 0 &&
              amount > 0
            ) {
              if (goal.kaffarahSubtype === "CLOTHING_ITEMS") {
                setKafarahCloths((prev) => (prev > 0 ? prev : amount));
              } else {
                setKafarahMeals((prev) => (prev > 0 ? prev : amount));
              }
            }
            break;
          case "FIDYA":
            if (amount <= 0) break;
            setFidyaMeals((prev) => (prev > 0 ? prev : amount));
            break;
          case "LILLAH":
            if (amount <= 0) break;
            setLillahAmount((prev) => (prev > 0 ? prev : amount));
            seedCurrencyIfEmpty("lillahDonation", goal.currencyCode);
            break;
          case "VOLUNTEERING":
            if (amount <= 0) break;
            setVolunteeringHours((prev) =>
              prev > 0 ? prev : Math.max(1, Math.round(amount / 60)),
            );
            break;
          case "SADAQAH_JARIYAH":
            if (amount <= 0) break;
            setSadaqahJariyahAmount((prev) => (prev > 0 ? prev : amount));
            seedCurrencyIfEmpty("sadaqahJariyah", goal.currencyCode);
            break;
        }
      }

      // Fill any remaining empty currency fields from the user's saved default
      void getDefaultSadaqahCurrency().then((defaultCurrency) => {
        if (!defaultCurrency) return;
        for (const field of SADAQAH_CURRENCY_FIELDS) {
          const current = getValues(field);
          if (current && String(current).trim().length > 0) continue;
          setValue(field, defaultCurrency, { shouldDirty: false });
        }
      });
    }, [sadaqahGoals, goalCycleDetail?.sadaqahGoals, getValues, setValue]);

    const applyDefaultSadaqahCurrency = useCallback(
      (currencyOptionValue: string) => {
        for (const field of SADAQAH_CURRENCY_FIELDS) {
          setValue(field, currencyOptionValue, { shouldDirty: true });
        }
      },
      [setValue],
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
          return loadingFastingGoals
            ? FASTING_GOAL_LOADING_PLACEHOLDERS
            : fastingGoals.length > 0
              ? fastingGoals
              : fastingData;
        case "sadaqah":
          return loadingSadaqahGoals
            ? SADAQAH_GOAL_LOADING_PLACEHOLDERS
            : sadaqahGoals.length > 0
              ? sadaqahGoals
              : sadaqahData;
        case "review":
          return reviewBtnData;
        default:
          return [];
      }
    }, [
      activeTab,
      loadingPrayerGoals,
      loadingQuranGoals,
      loadingFastingGoals,
      loadingSadaqahGoals,
      prayerGoals,
      quranGoals,
      fastingGoals,
      fastingData,
      sadaqahGoals,
      sadaqahData,
      reviewBtnData,
    ]);

    const tabOrder = useMemo(
      () => localizedTabs.map((tab) => tab.id),
      [localizedTabs],
    );

    const canPressFooterPrimary = useMemo(() => {
      if (activeTab === "review") return true;
      if (activeTab === "cycle") return isCycleDateSelected;

      return tabData.some(
        (item) =>
          !item?.isLoadingPlaceholder &&
          (selectedGoals[item.id] ?? item.isSelected),
      );
    }, [activeTab, isCycleDateSelected, selectedGoals, tabData]);

    const goToNextTab = useCallback(() => {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < 0 || currentIndex >= tabOrder.length - 1) return;
      const nextTab = tabOrder[currentIndex + 1];
      if (nextTab !== "cycle" && !cycleStartDate) return;
      setActiveTab(nextTab);
    }, [activeTab, cycleStartDate, tabOrder]);

    const handleFooterPrimaryPress = useCallback(() => {
      if (activeTab === "review") {
        setFinishSaveModalVisible(true);
        return;
      }
      goToNextTab();
    }, [activeTab, goToNextTab]);

    // Render the appropriate editor/selection component for a goal when it's being edited
    const renderGoalEditor = (goal: any) => {
      if (!goal) return null;
      const key = goal.title;
      const sourcePrayer = goal.sourcePrayer as
        | {
            targetCount?: number | null;
            targetDays?: number | null;
            congregationalTracking?: boolean;
            fiveDailyConfig?: any;
            sunnahRawatibConfig?: any;
            qiyamConfig?: any;
          }
        | undefined;

      switch (key) {
        case "tahayyat-ul-wudhu":
          return (
            <TahiyatWuduGoalSelection
              isSaving={isSavingPrayer}
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("TAHIYYAT_AL_WUDHU", value);
              }}
            />
          );
        case "quran-listening":
          return (
            <QuranTimeSelection
              title={t("monthlyGoalPlanner.selectNumHours")}
              descriptionKey="monthlyGoalPlanner.hoursQuranListening"
              quranGoalType="LISTENING"
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  listeningHours: hours,
                }));
                saveQuranHoursGoal("LISTENING", hours);
              }}
            />
          );
        case "quran-tajweed":
          return (
            <QuranTimeSelection
              title={t("monthlyGoalPlanner.selectNumHours")}
              descriptionKey="monthlyGoalPlanner.hoursQuranTajweed"
              quranGoalType="TAJWEED"
              onSave={(hours: number) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  tajweedHours: hours,
                }));
                saveQuranHoursGoal("TAJWEED", hours);
              }}
            />
          );
        case "quran-recitation-by-surah":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
              variant="others"
              onSave={() => {
                setQuranMetrics((prev) => {
                  const surah = prev?.surah ?? {};
                  const selected: number[] = Array.isArray(surah.selectedSurahs)
                    ? surah.selectedSurahs
                    : [];
                  const settings = surah.surahSettings ?? {};
                  const names = surah.surahNames ?? {};
                  return {
                    ...prev,
                    [key]: selected.map((id, i) => {
                      const setting = settings[id] ?? {};
                      const rawName = names[id] ?? `Surah ${id}`;
                      return {
                        id: i + 1,
                        name: `SURAH-${id}`,
                        label: formatSurahRecitationReviewLabel(
                          String(rawName),
                          Number(setting.times ?? 1) || 1,
                          setting.frequency ?? "daily",
                          t,
                        ),
                        value: "",
                      };
                    }),
                  };
                });
                saveQuranMetricGoal("recitation", "surah");
              }}
            />
          );
        case "quran-recitation-by-completion":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationByCompletion")}
              initialMetric="completion"
              allowedMetrics={["completion"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
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
              }}
            />
          );
        case "quran-recitation-by-juz":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
              variant="others"
              onSave={() => {
                setQuranMetrics((prev) => {
                  const juz = prev?.juz ?? {};
                  let from = Number(juz.start ?? 0);
                  let to = Number(juz.end ?? 0);
                  if (from <= 0 && to > 0) from = 1;
                  if (to <= 0 && from > 0) to = from;
                  if (from > 0 && to > 0 && to < from) to = from;
                  const rows: {
                    id: number;
                    name: string;
                    label: string;
                    value: string;
                  }[] = [];
                  if (from > 0 && to > 0) {
                    const rangeRow = buildJuzRecitationRangeReviewRow(from, to, t);
                    rows.push({ ...rangeRow, value: "" });
                  }
                  return { ...prev, [key]: rows };
                });
                saveQuranMetricGoal("recitation", "juz");
              }}
            />
          );
        case "quran-memorization-by-juz":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => {
                  const juz = prev?.juz ?? {};
                  const selectedIds: number[] = Array.isArray(juz.selectedJuzs)
                    ? juz.selectedJuzs
                        .map(Number)
                        .filter((n: number) => Number.isFinite(n) && n > 0)
                    : [];
                  let rows: {
                    id: number;
                    name: string;
                    label: string;
                    value: string;
                  }[] = [];
                  const ref = {
                    juz: allQuranGoalsResponse?.reference.juz,
                    hizb: allQuranGoalsResponse?.reference.hizb,
                  };
                  if (selectedIds.length > 0) {
                    rows = [...selectedIds]
                      .sort((a, b) => a - b)
                      .map((n, i) => {
                        const row = resolveJuzOrHizbReviewRow("JUZ", n, t, ref);
                        return {
                          id: i + 1,
                          name: `JUZ-${n}`,
                          label: row.label,
                          value: row.value,
                        };
                      });
                  } else {
                    let from = Number(juz.start ?? 0);
                    let to = Number(juz.end ?? 0);
                    if (from <= 0 && to > 0) from = 1;
                    if (to <= 0 && from > 0) to = from;
                    if (from > 0 && to > 0 && to < from) to = from;
                    if (from > 0 && to > 0) {
                      for (let n = from; n <= to; n += 1) {
                        const row = resolveJuzOrHizbReviewRow("JUZ", n, t, ref);
                        rows.push({
                          id: rows.length + 1,
                          name: `JUZ-${n}`,
                          label: row.label,
                          value: row.value,
                        });
                      }
                    }
                  }
                  return { ...prev, [key]: rows };
                });
                saveQuranMetricGoal("memorization", "juz");
              }}
            />
          );
        case "quran-memorization-by-hizb":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationByHizb")}
              initialMetric="hizb"
              allowedMetrics={["hizb"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => {
                  const hizb = prev?.hizb ?? {};
                  const selectedIds: number[] = Array.isArray(
                    hizb.selectedHizbs,
                  )
                    ? hizb.selectedHizbs.map(Number)
                    : hizb.selectedHizb != null
                      ? [Number(hizb.selectedHizb)]
                      : Array.isArray(hizb)
                        ? hizb.map(Number)
                        : [];
                  const ids = selectedIds
                    .filter((n) => Number.isFinite(n) && n > 0)
                    .sort((a, b) => a - b);
                  const ref = {
                    juz: allQuranGoalsResponse?.reference.juz,
                    hizb: allQuranGoalsResponse?.reference.hizb,
                  };
                  return {
                    ...prev,
                    [key]: ids.map((n, i) => {
                      const row = resolveJuzOrHizbReviewRow("HIZB", n, t, ref);
                      return {
                        id: i + 1,
                        name: `HIZB-${n}`,
                        label: row.label,
                        value: row.value,
                      };
                    }),
                  };
                });
                saveQuranMetricGoal("memorization", "hizb");
              }}
            />
          );
        case "quran-memorization-by-surah":
          return (
            <QuranRecitationGoalSelection
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              openOnMount
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              onSave={() => {
                setQuranMetrics((prev) => {
                  const surah = prev?.surah ?? {};
                  const selected: number[] = Array.isArray(surah.selectedSurahs)
                    ? surah.selectedSurahs
                    : [];
                  const names = surah.surahNames ?? {};
                  return {
                    ...prev,
                    [key]: selected.map((id, i) => ({
                      id: i + 1,
                      name: `SURAH-${id}`,
                      label: String(names[id] ?? `Surah ${id}`),
                      value: "",
                    })),
                  };
                });
                saveQuranMetricGoal("memorization", "surah");
              }}
            />
          );
        case "missed-fasts":
          return (
            <MissedRamadanFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={(selectedDates: string[]) => {
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: formatFastingReviewRowsFromDates(selectedDates),
                }));
              }}
            />
          );
        case "dawood-fasts":
          return (
            <ProphetDawoodFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={() => {}}
            />
          );
        case "monday-and-thursday-fasts":
          return (
            <MondayThursdayFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={(selectedDates: string[]) => {
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: formatFastingReviewRowsFromDates(selectedDates),
                }));
                setMondayThursdaySelectedGoalFasts(selectedDates);
              }}
            />
          );
        case "white-days-fasts":
          return (
            <WhiteDaysFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={() => {
                setFastingMetrics((prev) => {
                  const next = { ...prev };
                  delete next[goal.title];
                  return next;
                });
              }}
            />
          );
        // ── Sadaqah editors
        case "missed-zakat":
          return (
            <MissedZakats
              count={missedZakatAmount}
              setCount={setMissedZakatAmount}
              control={control}
              name="missedZakat"
              title={t("monthlyGoalPlanner.reviewLabels.missedZakat")}
              handleDecrease={() =>
                setMissedZakatAmount((prev) => Math.max(0, prev - 1))
              }
              handleIncrease={() => setMissedZakatAmount((prev) => prev + 1)}
              countTitle={t("monthlyGoalPlanner.amount")}
              isSaving={isSavingSadaqah}
              onSave={(done) => saveMissedZakatGoal(goal.title, done)}
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "kafarah-for-breaking-fasts":
          return (
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
              isSaving={isSavingSadaqah}
              onSave={(done) => saveKaffarahGoal(goal.title, done)}
            />
          );
        case "fidya":
          return (
            <FidyaSelector
              count={fidyaMeals}
              setCount={setFidyaMeals}
              handleDecrease={() =>
                setFidyaMeals((prev) => Math.max(0, prev - 1))
              }
              handleIncrease={() => setFidyaMeals((prev) => prev + 1)}
              title={t("monthlyGoalPlanner.fidyaMealsTitle")}
              isSaving={isSavingSadaqah}
              onSave={(done) => saveFidyaGoal(goal.title, done)}
            />
          );
        case "lilah-donations":
          return (
            <MissedZakats
              count={lillahAmount}
              setCount={setLillahAmount}
              control={control}
              name="lillahDonation"
              title={t("monthlyGoalPlanner.reviewLabels.lilahDonations")}
              handleDecrease={() =>
                setLillahAmount((prev) => Math.max(0, prev - 1))
              }
              handleIncrease={() => setLillahAmount((prev) => prev + 1)}
              countTitle={t("monthlyGoalPlanner.amount")}
              isSaving={isSavingSadaqah}
              onSave={(done) => saveLillahGoal(goal.title, done)}
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "volunteering-services":
          return (
            <FidyaSelector
              count={volunteeringHours}
              setCount={setVolunteeringHours}
              handleDecrease={() =>
                setVolunteeringHours((prev) => Math.max(0, prev - 1))
              }
              handleIncrease={() => setVolunteeringHours((prev) => prev + 1)}
              title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
              countTitle={t("monthlyGoalPlanner.hours")}
              isSaving={isSavingSadaqah}
              onSave={(done) => saveVolunteeringGoal(goal.title, done)}
            />
          );
        case "sadaqah-jariyah":
          return (
            <MissedZakats
              count={sadaqahJariyahAmount}
              setCount={setSadaqahJariyahAmount}
              control={control}
              name="sadaqahJariyah"
              title={t("monthlyGoalPlanner.reviewLabels.sadaqahJariyah")}
              handleDecrease={() =>
                setSadaqahJariyahAmount((prev) => Math.max(0, prev - 1))
              }
              handleIncrease={() => setSadaqahJariyahAmount((prev) => prev + 1)}
              countTitle={t("monthlyGoalPlanner.amount")}
              isSaving={isSavingSadaqah}
              onSave={(done) => saveSadaqahJariyahGoal(goal.title, done)}
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "five-daily-prayers":
          return (
            <DailyPrayerGoalSelection
              initialValues={
                sourcePrayer?.fiveDailyConfig
                  ? {
                      fajr: sourcePrayer.fiveDailyConfig.fajrTarget ?? 28,
                      dhuhr: sourcePrayer.fiveDailyConfig.dhuhrTarget ?? 28,
                      asr: sourcePrayer.fiveDailyConfig.asrTarget ?? 28,
                      maghrib: sourcePrayer.fiveDailyConfig.maghribTarget ?? 28,
                      isha: sourcePrayer.fiveDailyConfig.ishaTarget ?? 28,
                      jumuah: sourcePrayer.fiveDailyConfig.jumuahTarget ?? 0,
                      congregationalTracking: Boolean(
                        sourcePrayer.fiveDailyConfig.congregationalTracking ??
                        sourcePrayer.congregationalTracking,
                      ),
                    }
                  : undefined
              }
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
                  prayerType: "FIVE_DAILY_PRAYERS",
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
          );
        case "sunnah-rawatib":
          return (
            <SunnahRawatibGoalSelection
              initialValues={
                sourcePrayer?.sunnahRawatibConfig
                  ? {
                      beforeFajr:
                        sourcePrayer.sunnahRawatibConfig.beforeFajrTarget ?? 28,
                      beforeDhuhr:
                        sourcePrayer.sunnahRawatibConfig.beforeDhuhrTarget ??
                        56,
                      afterDhuhr:
                        sourcePrayer.sunnahRawatibConfig.afterDhuhrTarget ?? 56,
                      beforeAsr:
                        sourcePrayer.sunnahRawatibConfig.beforeAsrTarget ?? 56,
                      afterMaghrib:
                        sourcePrayer.sunnahRawatibConfig.afterMaghribTarget ??
                        28,
                      afterIsha:
                        sourcePrayer.sunnahRawatibConfig.afterIshaTarget ?? 28,
                      afterDhuhrRakahOption:
                        sourcePrayer.sunnahRawatibConfig
                          .afterDhuhrRakahOption === 1
                          ? 1
                          : 2,
                      beforeAsrEnabled:
                        sourcePrayer.sunnahRawatibConfig.beforeAsrEnabled ??
                        true,
                      beforeAsrRakahOption:
                        sourcePrayer.sunnahRawatibConfig
                          .beforeAsrRakahOption === 1
                          ? 1
                          : 2,
                    }
                  : undefined
              }
              onSave={(payload) => {
                upsertPrayerGoal({
                  prayerType: "SUNNAH_RAWATIB",
                  isActive: true,
                  sunnahConfig: {
                    beforeFajrTarget: payload.beforeFajr,
                    beforeDhuhrTarget: payload.beforeDhuhr,
                    afterDhuhrTarget: payload.afterDhuhr,
                    afterDhuhrRakahOption: payload.afterDhuhrRakahOption,
                    beforeAsrEnabled: payload.beforeAsrEnabled,
                    beforeAsrTarget: payload.beforeAsr,
                    beforeAsrRakahOption: payload.beforeAsrRakahOption,
                    afterMaghribTarget: payload.afterMaghrib,
                    afterIshaTarget: payload.afterIsha,
                  },
                });
              }}
            />
          );
        case "tahayyat-ul-masjid":
          return (
            <TahiyyatMasjidGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 140}
              onSave={(value) => {
                saveSimplePrayerTarget("TAHIYYAT_AL_MASJID", value);
              }}
            />
          );
        case "missed-past-prayers":
          return (
            <MissedPrayerGoalSelection
              initialValue={
                sourcePrayer?.targetDays ?? sourcePrayer?.targetCount ?? 3
              }
              onSave={(value) => {
                upsertPrayerGoal({
                  prayerType: "MISSED_PAST_PRAYERS",
                  isActive: true,
                  targetDays: value,
                  targetCount: value * 5,
                  sliderValue: value,
                });
              }}
            />
          );
        case "duha-prayer":
          return (
            <DuhaPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 40}
              onSave={(value) => {
                saveSimplePrayerTarget("DUHA", value);
              }}
            />
          );
        case "tawba-prayer":
          return (
            <TawbahPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("TAWBAH", value);
              }}
            />
          );
        case "istikhara-prayer":
          return (
            <IstikharaPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("ISTIKHARA", value);
              }}
            />
          );
        case "shukr-prayer":
          return (
            <ShukarPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("SHUKR", value);
              }}
            />
          );
        case "qiyal-al-lail-prayer":
          return (
            <QiyamalLaylGoalSelection
              initialValues={
                sourcePrayer?.qiyamConfig
                  ? {
                      isFlexible: Boolean(sourcePrayer.qiyamConfig.isFlexible),
                      unitTarget: sourcePrayer.qiyamConfig.unitTarget ?? 20,
                      trackTahajjud: Boolean(
                        sourcePrayer.qiyamConfig.trackTahajjud,
                      ),
                    }
                  : undefined
              }
              onSave={(payload: {
                commitment: "every_night" | "flexible";
                twoRakahPrayers: number;
                witrPrayers: number;
                trackTahajjud: "yes" | "no";
              }) => {
                upsertPrayerGoal({
                  prayerType: "QIYAM_AL_LAYL",
                  isActive: true,
                  qiyamConfig: {
                    isFlexible: payload.commitment === "flexible",
                    unitTarget: payload.twoRakahPrayers,
                    trackTahajjud: payload.trackTahajjud === "yes",
                  },
                });
              }}
            />
          );
        default:
          return null;
      }
    };

    return (
      <>
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
              const isDisabled = tab.id !== "cycle" && !isCycleDateSelected;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleTabPress(tab.id)}
                  disabled={isDisabled}
                  style={[
                    styles.tab,
                    !hasChip && isActive && styles.tabActive,
                    isDisabled && styles.tabDisabled,
                  ]}
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
                        style={[
                          styles.tabText,
                          isActive && styles.tabTextActive,
                        ]}
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
            scrollEnabled={sheetScrollEnabled}
            ListHeaderComponent={
              activeTab === "cycle" ? (
                <CycleStartTab
                  selectedStartDate={cycleStartDate}
                  selectedEndDate={cycleEndDate}
                  onDateSelect={handleCycleDateSelect}
                  onCommit={() => {
                    goToNextTab();
                  }}
                />
              ) : undefined
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
            ListFooterComponent={() =>
              activeTab === "cycle" ? null : (
                <View style={styles.footerContainer}>
                  <PrimaryButton
                    text={
                      activeTab === "review"
                        ? t("monthlyGoalPlanner.finishAndSaveGoals")
                        : "NEXT"
                    }
                    disabled={!canPressFooterPrimary}
                    onPress={handleFooterPrimaryPress}
                  />
                </View>
              )
            }
            renderItem={({ item }: { item: any }) => {
              if (activeTab === "prayer") {
                const prayer = item;
                if (prayer.isLoadingPlaceholder) {
                  return (
                    <View key={prayer.id} style={styles.goalListItem}>
                      <GoalCardWithDescriptionAndOptionToSelectGoal
                        initialValue={false}
                        title="---"
                        description="----------------------------------------------"
                        imageSource={undefined}
                        isLoading
                        handleSeeMorePRess={() => {}}
                      />
                    </View>
                  );
                }
                const isOn = selectedGoals[prayer.id] ?? prayer.isSelected;
                return (
                  <View
                    key={prayer.prayerType ?? prayer.id}
                    style={styles.goalListItem}
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                      title={(
                        prayer.title || t(`goalsData.${prayer.id}.title`)
                      ).toUpperCase()}
                      imageSource={prayer?.image}
                      handleSeeMorePRess={() => {
                        (console.log("prayer", prayer),
                          router.push({
                            pathname:
                              "/(private)/goaldescriptiondetails/[goal]",
                            params: { goal: prayer.prayerType },
                          }));
                      }}
                      description={
                        prayer.summaryDescription ||
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
                      <View style={styles.goalSelectionBelowCard}>
                        <TahiyatWuduGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 25)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "fiveDailyPrayers" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                      </View>
                    )}
                    {prayer.id === "sunnahRawatib" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                                beforeAsrRakahOption:
                                  payload.beforeAsrRakahOption,
                                afterMaghribTarget: payload.afterMaghrib,
                                afterIshaTarget: payload.afterIsha,
                              },
                            });
                          }}
                        />
                      </View>
                    )}
                    {prayer.id === "thayyat-ul-masjid" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <TahiyyatMasjidGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 140)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "missedPastPrayers" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                      </View>
                    )}
                    {prayer.id === "duhaPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <DuhaPrayerGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 40)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "tawbaPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <TawbahPrayerGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 25)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "istikharah" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <IstikharaPrayerGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 25)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "shukrPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <ShukarPrayerGoalSelection
                          initialValue={getSimpleTargetCount(prayer, 25)}
                          onSave={(value) =>
                            saveSimplePrayerTarget(prayer.prayerType, value)
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "qiyamalLail" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                      </View>
                    )}
                  </View>
                );
              }

              if (activeTab === "quran") {
                const quran = item;
                if (quran.isLoadingPlaceholder) {
                  return (
                    <View key={quran.id} style={styles.goalListItem}>
                      <GoalCardWithDescriptionAndOptionToSelectGoal
                        initialValue={false}
                        title="---"
                        description="----------------------------------------------"
                        imageSource={undefined}
                        isLoading
                        handleSeeMorePRess={() => {}}
                      />
                    </View>
                  );
                }

                const isOn = selectedGoals[quran.id] ?? quran.isSelected;
                return (
                  <View key={quran.id} style={styles.goalListItem}>
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
                      <View style={styles.goalSelectionBelowCard}>
                        <QuranTimeSelection
                          title={t("monthlyGoalPlanner.selectNumHours")}
                          descriptionKey="monthlyGoalPlanner.hoursQuranListening"
                          quranGoalType="LISTENING"
                          onSave={(hours) => {
                            setQuranMetrics((prev) => ({
                              ...prev,
                              listeningHours: hours,
                            }));
                            saveQuranHoursGoal("LISTENING", hours);
                          }}
                        />
                      </View>
                    )}
                    {quran.id === "quran-tajweed" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <QuranTimeSelection
                          title={t("monthlyGoalPlanner.selectNumHours")}
                          descriptionKey="monthlyGoalPlanner.hoursQuranTajweed"
                          quranGoalType="TAJWEED"
                          onSave={(hours) => {
                            setQuranMetrics((prev) => ({
                              ...prev,
                              tajweedHours: hours,
                            }));
                            saveQuranHoursGoal("TAJWEED", hours);
                          }}
                        />
                      </View>
                    )}
                    {quran.id === "quran-recitation" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <QuranRecitationGoalSelection
                          {...quranReferenceProps}
                          title={t("monthlyGoalPlanner.selectTrackingMetric")}
                          onMetricsChange={handleQuranMetricsChange}
                          variant="others"
                          onSave={({ metric }) =>
                            saveQuranMetricGoal("recitation", metric)
                          }
                        />
                      </View>
                    )}

                    {quran.id === "quran-memorization" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <QuranRecitationGoalSelection
                          {...quranReferenceProps}
                          title={t("monthlyGoalPlanner.selectTrackingMetric")}
                          onMetricsChange={handleQuranMetricsChange}
                          variant="memorization"
                          onSave={({ metric }) =>
                            saveQuranMetricGoal("memorization", metric)
                          }
                        />
                      </View>
                    )}
                  </View>
                );
              }

              if (activeTab === "fasting") {
                const fasting = item;
                if (fasting.isLoadingPlaceholder) {
                  return (
                    <View key={fasting.id} style={styles.goalListItem}>
                      <GoalCardWithDescriptionAndOptionToSelectGoal
                        initialValue={false}
                        title="---"
                        description="----------------------------------------------"
                        imageSource={undefined}
                        isLoading
                        handleSeeMorePRess={() => {}}
                      />
                    </View>
                  );
                }
                const isOn = selectedGoals[fasting.id] ?? fasting.isSelected;
                return (
                  <View
                    key={fasting.fastingType ?? fasting.id}
                    style={styles.goalListItem}
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                      title={t(`goalsData.${fasting.id}.title`).toUpperCase()}
                      imageSource={fasting.image}
                      handleSeeMorePRess={() =>
                        router.push({
                          pathname: "/(private)/goaldescriptiondetails/[goal]",
                          params: { goal: fasting.id },
                        })
                      }
                      description={t(`goalsData.${fasting.id}.description`)}
                      onToggle={(val) =>
                        handleFastingToggle(
                          fasting.id,
                          fasting.fastingType,
                          val,
                        )
                      }
                    />
                    {fasting.id === "missed-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedRamadanFastGoalSelection
                          calendarWindow={fastingCalendarWindow}
                          onSave={(selectedDates: string[]) => {
                            setFastingMetrics((prev) => ({
                              ...prev,
                              [fasting.id]:
                                formatFastingReviewRowsFromDates(selectedDates),
                            }));
                          }}
                        />
                      </View>
                    )}
                    {fasting.id === "dawood-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <ProphetDawoodFastGoalSelection
                          calendarWindow={fastingCalendarWindow}
                          onSave={() => {}}
                        />
                      </View>
                    )}
                    {fasting.id === "monday-and-thursday-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MondayThursdayFastGoalSelection
                          calendarWindow={fastingCalendarWindow}
                          onSave={(selectedDates: string[]) => {
                            setFastingMetrics((prev) => ({
                              ...prev,
                              [fasting.id]:
                                formatFastingReviewRowsFromDates(selectedDates),
                            }));
                            setMondayThursdaySelectedGoalFasts(selectedDates);
                          }}
                        />
                      </View>
                    )}
                    {fasting.id === "white-days-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <WhiteDaysFastGoalSelection
                          calendarWindow={fastingCalendarWindow}
                          onSave={() => {
                            setFastingMetrics((prev) => {
                              const next = { ...prev };
                              delete next[fasting.id];
                              return next;
                            });
                          }}
                        />
                      </View>
                    )}
                  </View>
                );
              }

              if (activeTab === "sadaqah") {
                const sadaqah = item;
                if (sadaqah.isLoadingPlaceholder) {
                  return (
                    <View key={sadaqah.id} style={styles.goalListItem}>
                      <GoalCardWithDescriptionAndOptionToSelectGoal
                        initialValue={false}
                        title="---"
                        description="----------------------------------------------"
                        imageSource={undefined}
                        isLoading
                        handleSeeMorePRess={() => {}}
                      />
                    </View>
                  );
                }
                const isOn = selectedGoals[sadaqah.id] ?? sadaqah.isSelected;
                return (
                  <View
                    key={sadaqah.sadaqahType ?? sadaqah.id}
                    style={styles.goalListItem}
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                      title={t(`goalsData.${sadaqah.id}.title`).toUpperCase()}
                      imageSource={sadaqah.image}
                      handleSeeMorePRess={() =>
                        router.push({
                          pathname: "/(private)/goaldescriptiondetails/[goal]",
                          params: { goal: sadaqah.id },
                        })
                      }
                      description={t(`goalsData.${sadaqah.id}.description`)}
                      onToggle={(val) =>
                        handleSadaqahToggle(
                          sadaqah.id,
                          sadaqah.sadaqahType,
                          val,
                        )
                      }
                    />

                    {sadaqah.id === "missed-zakat" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedZakats
                          count={missedZakatAmount}
                          setCount={setMissedZakatAmount}
                          control={control}
                          name="missedZakat"
                          title={t(
                            "monthlyGoalPlanner.reviewLabels.missedZakat",
                          )}
                          handleDecrease={() => {
                            setMissedZakatAmount((prev) =>
                              Math.max(0, prev - 1),
                            );
                          }}
                          handleIncrease={() => {
                            setMissedZakatAmount((prev) => prev + 1);
                          }}
                          countTitle={t("monthlyGoalPlanner.amount")}
                          isSaving={isSavingSadaqah}
                          onSave={(done) =>
                            saveMissedZakatGoal(sadaqah.id, done)
                          }
                          onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
                        />
                      </View>
                    )}

                    {sadaqah.id === "kafarah-for-breaking-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                          isSaving={isSavingSadaqah}
                          onSave={(done) => saveKaffarahGoal(sadaqah.id, done)}
                        />
                      </View>
                    )}
                    {sadaqah.id === "fidya" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
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
                          isSaving={isSavingSadaqah}
                          onSave={(done) => saveFidyaGoal(sadaqah.id, done)}
                        />
                      </View>
                    )}

                    {sadaqah.id === "lilah-donations" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedZakats
                          count={lillahAmount}
                          setCount={setLillahAmount}
                          control={control}
                          name="lillahDonation"
                          // title={t(
                          //   "monthlyGoalPlanner.reviewLabels.lilahDonations",
                          // )}
                          title="Select target for this month"
                          handleDecrease={() => {
                            setLillahAmount((prev) => Math.max(0, prev - 1));
                          }}
                          handleIncrease={() => {
                            setLillahAmount((prev) => prev + 1);
                          }}
                          countTitle={t("monthlyGoalPlanner.amount")}
                          isSaving={isSavingSadaqah}
                          onSave={(done) => saveLillahGoal(sadaqah.id, done)}
                          onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
                        />
                      </View>
                    )}

                    {sadaqah.id === "volunteering-services" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <FidyaSelector
                          count={volunteeringHours}
                          setCount={setVolunteeringHours}
                          handleDecrease={() => {
                            setVolunteeringHours((prev) =>
                              Math.max(0, prev - 1),
                            );
                          }}
                          handleIncrease={() => {
                            setVolunteeringHours((prev) => prev + 1);
                          }}
                          title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
                          countTitle="Volunteering Hour(s)"
                          isSaving={isSavingSadaqah}
                          onSave={(done) =>
                            saveVolunteeringGoal(sadaqah.id, done)
                          }
                        />
                      </View>
                    )}
                    {sadaqah.id === "sadaqah-jariyah" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedZakats
                          count={sadaqahJariyahAmount}
                          setCount={setSadaqahJariyahAmount}
                          control={control}
                          name="sadaqahJariyah"
                          title="Select target for this month"
                          handleDecrease={() => {
                            setSadaqahJariyahAmount((prev) =>
                              Math.max(0, prev - 1),
                            );
                          }}
                          handleIncrease={() => {
                            setSadaqahJariyahAmount((prev) => prev + 1);
                          }}
                          countTitle={t("monthlyGoalPlanner.amount")}
                          isSaving={isSavingSadaqah}
                          onSave={(done) =>
                            saveSadaqahJariyahGoal(sadaqah.id, done)
                          }
                          onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
                        />
                      </View>
                    )}
                  </View>
                );
              }
              if (activeTab === "review") {
                const reviewItem = item;
                return (
                  <View style={styles.reviewSection}>
                    <ReviewGoalBtn
                      reviewItem={reviewItem}
                      reviewExpanded={reviewExpanded}
                      handleReviewItemPress={() =>
                        handleReviewItemPress(reviewItem)
                      }
                    />

                    {reviewExpanded === reviewItem?.name &&
                      reviewItem?.appliedGoals?.map((goal: any) => {
                        const isEditing = editingGoal === goal.title;
                        // Prefer local session metrics after an in-sheet save;
                        // otherwise use cycle-detail selectedGoals.
                        // Ignore stale fasting summary rows like
                        // { label: "Missed Ramadan Fasts", value: "23" }.
                        const apiSelected = goal.selectedGoals ?? [];
                        const localFasting = (
                          fastingMetrics?.[goal.title] ?? []
                        ).filter((entry: any) =>
                          String(entry?.value ?? "").includes("/"),
                        );
                        // Fidya / lillah / jariyah / volunteering: header only (ignore stale sub-rows)
                        const headerOnlySadaqah = new Set([
                          "fidya",
                          "lilah-donations",
                          "lillah-donations",
                          "volunteering-services",
                          "sadaqah-jariyah",
                        ]);
                        const localSadaqah = headerOnlySadaqah.has(
                          String(goal.title),
                        )
                          ? []
                          : (sadaqahMetrics?.[goal.title] ?? []);
                        const localSelected = [
                          ...localFasting,
                          ...localSadaqah,
                          ...(quranMetrics?.[goal.title] ?? []),
                        ];
                        const mergedSelected = (
                          localSelected.length > 0 ? localSelected : apiSelected
                        ).map((entry: any, i: number) => ({
                          id: i + 1,
                          name: entry?.name ?? `item-${i + 1}`,
                          label: entry?.label ?? "",
                          value: entry?.value ?? "",
                        }));
                        let goalWithSelected = mergedSelected.length
                          ? { ...goal, selectedGoals: mergedSelected }
                          : goal;
                        if (
                          goal.title === "quran-recitation-by-juz" &&
                          localSelected.length > 0
                        ) {
                          const rangeRow = localSelected.find((entry: any) =>
                            String(entry?.name ?? "").startsWith("JUZ-RANGE"),
                          );
                          const range = parseJuzRangeReviewName(
                            String(rangeRow?.name ?? ""),
                          );
                          if (range) {
                            goalWithSelected = {
                              ...goalWithSelected,
                              totalValue: countJuzInRange(
                                range.from,
                                range.to,
                              ),
                            };
                          }
                        }
                        return (
                          <View
                            key={String(goal.title ?? goal.id)}
                            style={styles.reviewGoalBlock}
                          >
                            <ReviewGoalCard
                              goal={goalWithSelected}
                              handleEditPress={() => {
                                setEditingGoal(goal.title);
                                setReviewExpanded(reviewItem?.name);
                              }}
                            />

                            {isEditing ? renderGoalEditor(goal) : null}
                          </View>
                        );
                      })}
                  </View>
                );
              }
              return null;
            }}
          />
        </BottomSheet>
        <WarningModal
          visible={fastingGoalConflictModal.visible}
          title="SET GOAL?"
          message={fastingGoalConflictModal.message}
          primaryButtonText="Ok"
          secondaryButtonText={null}
          primaryButtonVariant="green"
          onPrimaryPress={closeFastingGoalConflictModal}
          onBackdropPress={closeFastingGoalConflictModal}
          primaryButtonStyle={{
            alignSelf: "center",
          }}
        />
        <WarningModal
          visible={finishSaveModalVisible}
          title={t("monthlyGoalPlanner.finishAndSaveModalTitle")}
          message={t("monthlyGoalPlanner.finishAndSaveModalMessage")}
          primaryButtonText={t("monthlyGoalPlanner.finishAndSaveYes")}
          secondaryButtonText={t("monthlyGoalPlanner.finishAndSaveCancel")}
          primaryButtonVariant="green"
          onPrimaryPress={confirmFinishAndSave}
          onSecondaryPress={closeFinishSaveModal}
          onBackdropPress={closeFinishSaveModal}
          secondaryButtonTextStyle={{
            color: Colors.light.subtext,
          }}
        />
      </>
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
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.greybuttonBackground,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.light.green,
  },
  tabDisabled: {
    opacity: 0.35,
  },
  tabText: {
    color: Colors.light.dullWhite,
    fontSize: 14,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.1,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  tabTextActive: {
    color: Colors.light.white,
  },
  // ── Category chip inside tabs
  tabChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  tabChipActive: {
    backgroundColor: Colors.light.green,
  },
  tabChipInactive: {
    backgroundColor: Colors.light.calendarBg,
  },
  tabChipText: {
    color: Colors.light.dullWhite,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
    fontWeight: "400",
    lineHeight: 16,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  tabChipTextActive: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontWeight: "500",
  },
  tabDivider: {},
  // Goal card list spacing:
  // - 20 between cards (and between selection → next card)
  // - 12 between card → its selection panel
  goalListItem: {
    marginBottom: 20,
  },
  goalSelectionBelowCard: {
    marginTop: 12,
  },
  reviewSection: {
    marginBottom: 12,
    gap: 12,
  },
  reviewGoalBlock: {
    gap: 12,
  },
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
