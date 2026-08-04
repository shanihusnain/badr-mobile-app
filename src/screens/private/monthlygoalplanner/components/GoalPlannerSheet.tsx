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
import { mapReviewFromGoalCycle } from "@/src/utils/mapReviewFromGoalCycle";
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
import { buildFastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
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

    const closeFastingGoalConflictModal = useCallback(() => {
      setFastingGoalConflictModal({ visible: false, message: "" });
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

    const quranReferenceProps = useMemo(
      () => ({
        surahReference: allQuranGoalsResponse?.reference.surahs ?? [],
        hizbReference: allQuranGoalsResponse?.reference.hizb ?? [],
        isReferenceLoading: loadingQuranGoals,
      }),
      [allQuranGoalsResponse, loadingQuranGoals],
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
      () => mapReviewFromGoalCycle(goalCycleDetail, t),
      [goalCycleDetail, t],
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
              persistSadaqahMetrics(goalKey, [
                {
                  id: 1,
                  label: t("monthlyGoalPlanner.meals"),
                  value: String(fidyaMeals),
                },
              ]);
              onDone?.();
            },
          },
        );
      },
      [fidyaMeals, upsertSadaqahGoal, persistSadaqahMetrics, t],
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
              persistSadaqahMetrics(goalKey, [
                {
                  id: 1,
                  label: t("monthlyGoalPlanner.amount"),
                  value: String(lillahAmount),
                },
              ]);
              onDone?.();
            },
          },
        );
      },
      [lillahAmount, upsertSadaqahGoal, getValues, persistSadaqahMetrics, t],
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
              persistSadaqahMetrics(goalKey, [
                {
                  id: 1,
                  label: t("monthlyGoalPlanner.hours"),
                  value: String(volunteeringHours),
                },
              ]);
              onDone?.();
            },
          },
        );
      },
      [volunteeringHours, upsertSadaqahGoal, persistSadaqahMetrics, t],
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
              persistSadaqahMetrics(goalKey, [
                {
                  id: 1,
                  label: t("monthlyGoalPlanner.amount"),
                  value: String(sadaqahJariyahAmount),
                },
              ]);
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
        t,
      ],
    );

    // Seed sadaqah counters / currency from API when goals load (don't overwrite in-progress edits)
    useEffect(() => {
      const sourceGoals =
        sadaqahGoals.length > 0
          ? sadaqahGoals
          : (goalCycleDetail?.sadaqahGoals ?? []);
      if (!sourceGoals.length) return;

      const seedCurrencyIfEmpty = (
        field: "missedZakat" | "lillahDonation" | "sadaqahJariyah",
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
    }, [sadaqahGoals, goalCycleDetail?.sadaqahGoals, getValues, setValue]);

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
        case "tahayyat-ul-wuddu":
          return (
            <TahiyatWuduGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("TAHIYYAT_AL_WUDHU", value);
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
              {...quranReferenceProps}
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
              {...quranReferenceProps}
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
              {...quranReferenceProps}
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
              {...quranReferenceProps}
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
              {...quranReferenceProps}
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
              {...quranReferenceProps}
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
              calendarWindow={fastingCalendarWindow}
              onSave={(selectedDates: string[]) => {
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: [
                    {
                      id: 1,
                      label: "Missed Ramadan Fasts",
                      value: String(selectedDates.length),
                    },
                  ],
                }));
                setEditingGoal(null);
              }}
            />
          );
        case "dawood-fasts":
          return (
            <ProphetDawoodFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={(dawoodStartDay: 1 | 2) => {
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: [
                    {
                      id: 1,
                      label: "Start day",
                      value: String(dawoodStartDay),
                    },
                  ],
                }));
                setEditingGoal(null);
              }}
            />
          );
        case "monday-and-thursday-fasts":
          return (
            <MondayThursdayFastGoalSelection
              calendarWindow={fastingCalendarWindow}
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
          return (
            <WhiteDaysFastGoalSelection
              calendarWindow={fastingCalendarWindow}
              onSave={(selectedDates: string[]) => {
                setFastingMetrics((prev) => ({
                  ...prev,
                  [goal.title]: [
                    {
                      id: 1,
                      label: "White Days Fasts",
                      value: String(selectedDates.length),
                    },
                  ],
                }));
                setEditingGoal(null);
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
              onSave={() =>
                saveMissedZakatGoal(goal.title, () => setEditingGoal(null))
              }
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
              onSave={() =>
                saveKaffarahGoal(goal.title, () => setEditingGoal(null))
              }
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
              onSave={() =>
                saveFidyaGoal(goal.title, () => setEditingGoal(null))
              }
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
              onSave={() =>
                saveLillahGoal(goal.title, () => setEditingGoal(null))
              }
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
              onSave={() =>
                saveVolunteeringGoal(goal.title, () => setEditingGoal(null))
              }
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
              onSave={() =>
                saveSadaqahJariyahGoal(goal.title, () => setEditingGoal(null))
              }
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
                setEditingGoal(null);
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
                setEditingGoal(null);
              }}
            />
          );
        case "tahayyat-ul-masjid":
          return (
            <TahiyyatMasjidGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 140}
              onSave={(value) => {
                saveSimplePrayerTarget("TAHIYYAT_AL_MASJID", value);
                setEditingGoal(null);
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
                setEditingGoal(null);
              }}
            />
          );
        case "duha-prayer":
          return (
            <DuhaPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 40}
              onSave={(value) => {
                saveSimplePrayerTarget("DUHA", value);
                setEditingGoal(null);
              }}
            />
          );
        case "tawba-prayer":
          return (
            <TawbahPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("TAWBAH", value);
                setEditingGoal(null);
              }}
            />
          );
        case "istikhara-prayer":
          return (
            <IstikharaPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("ISTIKHARA", value);
                setEditingGoal(null);
              }}
            />
          );
        case "shukr-prayer":
          return (
            <ShukarPrayerGoalSelection
              initialValue={sourcePrayer?.targetCount ?? 25}
              onSave={(value) => {
                saveSimplePrayerTarget("SHUKR", value);
                setEditingGoal(null);
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
                setEditingGoal(null);
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
            ListHeaderComponent={
              activeTab === "cycle" ? (
                <CycleStartTab
                  selectedStartDate={cycleStartDate}
                  selectedEndDate={cycleEndDate}
                  onDateSelect={handleCycleDateSelect}
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
                            pathname:
                              "/(private)/goaldescriptiondetails/[goal]",
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
                              beforeAsrRakahOption:
                                payload.beforeAsrRakahOption,
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
                        description={t(
                          "monthlyGoalPlanner.hoursQuranListening",
                        )}
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
                        {...quranReferenceProps}
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
                        onSave={({ metric }) =>
                          saveQuranMetricGoal("recitation", metric)
                        }
                      />
                    )}

                    {quran.id === "quran-memorization" && isOn && (
                      <QuranRecitationGoalSelection
                        {...quranReferenceProps}
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
                        onSave={({ metric }) =>
                          saveQuranMetricGoal("memorization", metric)
                        }
                      />
                    )}
                    <TopSpace top={10} />
                  </View>
                );
              }

              if (activeTab === "fasting") {
                const fasting = item;
                if (fasting.isLoadingPlaceholder) {
                  return (
                    <View key={fasting.id}>
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
                const isOn = selectedGoals[fasting.id] ?? fasting.isSelected;
                return (
                  <View key={fasting.fastingType ?? fasting.id}>
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
                      <MissedRamadanFastGoalSelection
                        calendarWindow={fastingCalendarWindow}
                        onSave={(selectedDates: string[]) => {
                          setFastingMetrics((prev) => ({
                            ...prev,
                            [fasting.id]: [
                              {
                                id: 1,
                                label: "Missed Ramadan Fasts",
                                value: String(selectedDates.length),
                              },
                            ],
                          }));
                        }}
                      />
                    )}
                    {fasting.id === "dawood-fasts" && isOn && (
                      <ProphetDawoodFastGoalSelection
                        calendarWindow={fastingCalendarWindow}
                        onSave={(dawoodStartDay: 1 | 2) => {
                          setFastingMetrics((prev) => ({
                            ...prev,
                            [fasting.id]: [
                              {
                                id: 1,
                                label: "Start day",
                                value: String(dawoodStartDay),
                              },
                            ],
                          }));
                        }}
                      />
                    )}
                    {fasting.id === "monday-and-thursday-fasts" && isOn && (
                      <MondayThursdayFastGoalSelection
                        calendarWindow={fastingCalendarWindow}
                        onSave={(selectedDates: string[]) => {
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
                            let hijriLabel = gregorian;
                            try {
                              // eslint-disable-next-line @typescript-eslint/no-var-requires
                              const moment = require("moment-hijri");
                              const hijriParts =
                                moment(ds).format("iD iMMM, iYYYY");
                              hijriLabel = `${hijriParts}`;
                            } catch {
                              // ignore
                            }
                            return {
                              id: idx + 1,
                              label: weekday,
                              value: `${hijriLabel} / ${gregorian}`,
                            };
                          });
                          setFastingMetrics((prev) => ({
                            ...prev,
                            [fasting.id]: formatted,
                          }));
                          setMondayThursdaySelectedGoalFasts(selectedDates);
                        }}
                      />
                    )}
                    {fasting.id === "white-days-fasts" && isOn && (
                      <WhiteDaysFastGoalSelection
                        calendarWindow={fastingCalendarWindow}
                        onSave={(selectedDates: string[]) => {
                          setFastingMetrics((prev) => ({
                            ...prev,
                            [fasting.id]: [
                              {
                                id: 1,
                                label: "White Days Fasts",
                                value: String(selectedDates.length),
                              },
                            ],
                          }));
                        }}
                      />
                    )}
                    <TopSpace top={10} />
                  </View>
                );
              }

              if (activeTab === "sadaqah") {
                const sadaqah = item;
                if (sadaqah.isLoadingPlaceholder) {
                  return (
                    <View key={sadaqah.id}>
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
                const isOn = selectedGoals[sadaqah.id] ?? sadaqah.isSelected;
                return (
                  <View key={sadaqah.sadaqahType ?? sadaqah.id}>
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
                      <MissedZakats
                        count={missedZakatAmount}
                        setCount={setMissedZakatAmount}
                        control={control}
                        name="missedZakat"
                        title={t("monthlyGoalPlanner.reviewLabels.missedZakat")}
                        handleDecrease={() => {
                          setMissedZakatAmount((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setMissedZakatAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                        isSaving={isSavingSadaqah}
                        onSave={() => saveMissedZakatGoal(sadaqah.id)}
                      />
                    )}

                    {sadaqah.id === "kafarah-for-breaking-fasts" && isOn && (
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
                        onSave={() => saveKaffarahGoal(sadaqah.id)}
                      />
                    )}
                    {sadaqah.id === "fidya" && isOn && (
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
                        onSave={() => saveFidyaGoal(sadaqah.id)}
                      />
                    )}

                    {sadaqah.id === "lilah-donations" && isOn && (
                      <MissedZakats
                        count={lillahAmount}
                        setCount={setLillahAmount}
                        control={control}
                        name="lillahDonation"
                        title={t(
                          "monthlyGoalPlanner.reviewLabels.lilahDonations",
                        )}
                        handleDecrease={() => {
                          setLillahAmount((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setLillahAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                        isSaving={isSavingSadaqah}
                        onSave={() => saveLillahGoal(sadaqah.id)}
                      />
                    )}

                    {sadaqah.id === "volunteering-services" && isOn && (
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
                        countTitle={t("monthlyGoalPlanner.hours")}
                        isSaving={isSavingSadaqah}
                        onSave={() => saveVolunteeringGoal(sadaqah.id)}
                      />
                    )}
                    {sadaqah.id === "sadaqah-jariyah" && isOn && (
                      <MissedZakats
                        count={sadaqahJariyahAmount}
                        setCount={setSadaqahJariyahAmount}
                        control={control}
                        name="sadaqahJariyah"
                        title={t(
                          "monthlyGoalPlanner.reviewLabels.sadaqahJariyah",
                        )}
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
                        onSave={() => saveSadaqahJariyahGoal(sadaqah.id)}
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
                          // Prefer cycle-detail selectedGoals; fall back to local session metrics.
                          const apiSelected = goal.selectedGoals ?? [];
                          const localSelected =
                            apiSelected.length === 0
                              ? [
                                  ...(fastingMetrics?.[goal.title] ?? []),
                                  ...(sadaqahMetrics?.[goal.title] ?? []),
                                  ...(quranMetrics?.[goal.title] ?? []),
                                ]
                              : [];
                          const mergedSelected = [
                            ...apiSelected,
                            ...localSelected,
                          ].map((entry: any, i: number) => ({
                            id: i + 1,
                            name: entry?.name ?? `item-${i + 1}`,
                            label: entry?.label ?? "",
                            value: entry?.value ?? "",
                          }));
                          const goalWithSelected = mergedSelected.length
                            ? { ...goal, selectedGoals: mergedSelected }
                            : goal;
                          return (
                            <View key={String(goal.id)}>
                              <ReviewGoalCard
                                goal={goalWithSelected}
                                handleEditPress={() => {
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
            paddingVertical: 4,
            alignSelf: "center",
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
  tabDisabled: {
    opacity: 0.35,
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
