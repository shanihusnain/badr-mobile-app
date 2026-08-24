import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { BlurView } from "expo-blur";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import { ScrollView as RNScrollView } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  hasConfiguredTargets,
  mapPrayerGoalsFromApi,
  PRAYER_TYPE_TO_UI_ID,
} from "@/src/utils/prayerGoalMap";
import { useTogglePrayerGoalByType } from "@/src/api/mutations/useTogglePrayerGoalByType";
import { useUpsertPrayerGoal } from "@/src/api/mutations/useUpsertPrayerGoal";
import type { UpsertPrayerGoalPayload } from "@/src/api/mutations/useUpsertPrayerGoal";
import { useGetAllQuranGoals } from "@/src/api/queries/useGetAllQuranGoals";
import { useGetAllFastingGoals } from "@/src/api/queries/useGetAllFastingGoals";
import { useGetAllSadaqahGoals } from "@/src/api/queries/useGetAllSadaqahGoals";
import { useGetFastingCalendarPreview } from "@/src/api/queries/useGetFastingCalendarPreview";
import { useGetMe } from "@/src/api/queries/useGetMe";
import { useGetGoalCycleById } from "@/src/api/queries/useGetGoalCycleById";
import {
  mapReviewFromGoalCycle,
  resolveJuzOrHizbReviewRow,
  formatFastingReviewRowsFromDates,
  buildJuzRecitationRangeReviewRow,
  buildSurahRecitationReviewSelectedGoals,
  countJuzInRange,
  parseJuzRangeReviewName,
} from "@/src/utils/mapReviewFromGoalCycle";
import {
  hydrateQuranSurahFrequencies,
  rememberQuranSurahFrequencies,
} from "@/src/storage/quranSurahFrequencyStorage";
import { useToggleQuranGoalByType } from "@/src/api/mutations/useToggleQuranGoalByType";
import { useToggleFastingGoalByType } from "@/src/api/mutations/useToggleFastingGoalByType";
import { useToggleSadaqahGoalByType } from "@/src/api/mutations/useToggleSadaqahGoalByType";
import { useUpsertSadaqahGoal } from "@/src/api/mutations/useUpsertSadaqahGoal";
import { useBulkUpsertQuranGoals } from "@/src/api/mutations/useUpsertQuranGoal";
import {
  buildBulkQuranGoalsForVariant,
  buildHoursQuranPayload,
  getQuranTypesForUiId,
  hasConfiguredQuranGoal,
  mapQuranGoalsFromApi,
  QURAN_GOAL_LOADING_PLACEHOLDERS,
  type QuranGoalApiItem,
} from "@/src/utils/quranGoalMap";
import {
  FASTING_GOAL_LOADING_PLACEHOLDERS,
  hasConfiguredFastingGoal,
  mapFastingGoalsFromApi,
  resolveFastingType,
} from "@/src/utils/fastingGoalMap";
import {
  SADAQAH_GOAL_LOADING_PLACEHOLDERS,
  hasConfiguredSadaqahGoal,
  mapSadaqahGoalsFromApi,
  resolveSadaqahType,
  resolveSadaqahUiId,
  extractCurrencyCode,
} from "@/src/utils/sadaqahGoalMap";
import { currencyOptionFromCode } from "@/components/molecules/CurrencyAndAmountSelector";
import { buildFastingCalendarWindow } from "@/src/utils/fastingCalendarPreview";
import { showToast } from "@/src/config/toastConfig";

const OTHER_FASTING_GOAL_IDS = [
  "missed-fasts",
  "monday-and-thursday-fasts",
  "white-days-fasts",
] as const;
const DAWOOD_FAST_GOAL_ID = "dawood-fasts";
/** Wait for the current editor to show SAVED! and collapse before opening the next. */
const ADVANCE_TO_NEXT_GOAL_MS = 2100;
/** Fallback row height until onLayout measures each goal card. */
const GOAL_ITEM_ESTIMATED_HEIGHT = 380;
const GOAL_LIST_ITEM_GAP = 20;

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

function GoalPlannerSheetContainer({ children }: { children?: ReactNode }) {
  const content = (
    <GestureHandlerRootView style={styles.sheetOverlayRoot}>
      {children}
    </GestureHandlerRootView>
  );

  if (Platform.OS === "ios") {
    return <FullWindowOverlay>{content}</FullWindowOverlay>;
  }

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="none"
      presentationStyle="overFullScreen"
    >
      {content}
    </Modal>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export const GoalPlannerSheet = forwardRef<BottomSheetModal, Props>(
  ({ onClose, initialTab }, ref) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "cycle");
    const [cycleStartDate, setCycleStartDate] = useState<string | null>(null);
    const [cycleEndDate, setCycleEndDate] = useState<string | null>(null);
    const [hasCommittedCycle, setHasCommittedCycle] = useState(false);
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
    const quranMetricsRef = useRef(quranMetrics);
    quranMetricsRef.current = quranMetrics;
    // lifted fasting metrics collected from children
    const [fastingMetrics, setFastingMetrics] = useState<Record<string, any>>(
      {},
    );
    const [fastingGoalConflictModal, setFastingGoalConflictModal] = useState<{
      visible: boolean;
      message: string;
    }>({ visible: false, message: "" });
    const [dawoodFastConfirmModalVisible, setDawoodFastConfirmModalVisible] =
      useState(false);
    const [unfinishedGoalModal, setUnfinishedGoalModal] = useState<{
      visible: boolean;
      goalName: string;
    }>({ visible: false, goalName: "" });
    const [finishSaveModalVisible, setFinishSaveModalVisible] = useState(false);
    const [sheetScrollEnabled, setSheetScrollEnabled] = useState(true);
    /**
     * Goal toggled on in a category but not yet saved/configured.
     * Backend `isActive` goals that already have targets are NOT pending —
     * multiple of those can stay on. Only one unfinished toggle per category.
     */
    const [pendingUnconfiguredGoalId, setPendingUnconfiguredGoalId] = useState<{
      prayer: string | null;
      quran: string | null;
      fasting: string | null;
      sadaqah: string | null;
    }>({
      prayer: null,
      quran: null,
      fasting: null,
      sadaqah: null,
    });
    /** Which goal's selection panel should be expanded (toggle ON opens; save closes). */
    const [expandedGoalSelectionId, setExpandedGoalSelectionId] = useState<{
      prayer: string | null;
      quran: string | null;
      fasting: string | null;
      sadaqah: string | null;
    }>({
      prayer: null,
      quran: null,
      fasting: null,
      sadaqah: null,
    });
    /** Goals saved in this session (covers the gap before API refetch). */
    const [locallyConfiguredGoalIds, setLocallyConfiguredGoalIds] = useState<
      Record<string, boolean>
    >({});

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
          if (
            payload.metric === "surah" &&
            payload.value?.surahSettings &&
            typeof payload.value.surahSettings === "object"
          ) {
            rememberQuranSurahFrequencies(payload.value.surahSettings);
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

    const closeDawoodFastConfirmModal = useCallback(() => {
      setDawoodFastConfirmModalVisible(false);
    }, []);

    const closeUnfinishedGoalModal = useCallback(() => {
      setUnfinishedGoalModal({ visible: false, goalName: "" });
    }, []);

    const closeFinishSaveModal = useCallback(() => {
      setFinishSaveModalVisible(false);
    }, []);

    const confirmFinishAndSave = useCallback(() => {
      setFinishSaveModalVisible(false);
      if (ref && typeof ref !== "function") {
        ref.current?.dismiss();
      }
      router.replace("/(tabs)/(home)");
    }, [ref]);

    const handleSeeMorePress = useCallback(
      (goal: string) => {
        if (ref && typeof ref !== "function") {
          ref.current?.dismiss();
        }
        router.push({
          pathname: "/(private)/goaldescriptiondetails/[goal]",
          params: { goal },
        });
      },
      [ref],
    );

    const { data: meUser } = useGetMe();
    const userId = meUser?.id ?? null;
    const goalCycleId = meUser?.goalCycleId ?? null;
    const { data: goalCycleDetail } = useGetGoalCycleById(goalCycleId);
    const locallyToggledGoalIdsRef = useRef<Record<string, boolean>>({});
    const listRef = useRef<BottomSheetFlatListMethods>(null);
    const goalItemHeightsRef = useRef<Record<string, number>>({});
    const advanceToNextGoalTimerRef = useRef<ReturnType<
      typeof setTimeout
    > | null>(null);
    const advanceToNextGoalRef = useRef<(savedGoalId: string) => void>(
      () => {},
    );
    const enableGoalInActiveTabRef = useRef<(goal: any) => void>(() => {});
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;
    const selectedGoalsRef = useRef(selectedGoals);
    selectedGoalsRef.current = selectedGoals;

    const registerGoalItemLayout = useCallback(
      (goalId: string, height: number) => {
        if (!goalId || height <= 0) return;
        goalItemHeightsRef.current[goalId] = height;
      },
      [],
    );

    const scrollToGoalItemIdRef = useRef<(goalId: string) => void>(() => {});

    useEffect(() => {
      hydrateQuranSurahFrequencies();
    }, []);

    // Drop previous-user toggle/config state when the account or cycle changes.
    useEffect(() => {
      locallyToggledGoalIdsRef.current = {};
      setSelectedGoals({});
      setLocallyConfiguredGoalIds({});
      setPendingUnconfiguredGoalId({
        prayer: null,
        quran: null,
        fasting: null,
        sadaqah: null,
      });
      setExpandedGoalSelectionId({
        prayer: null,
        quran: null,
        fasting: null,
        sadaqah: null,
      });
      setHasCommittedCycle(false);
      if (advanceToNextGoalTimerRef.current) {
        clearTimeout(advanceToNextGoalTimerRef.current);
        advanceToNextGoalTimerRef.current = null;
      }
    }, [userId, goalCycleId]);

    // Hydrate cycle dates from API as the source of truth when the user returns.
    useEffect(() => {
      if (!goalCycleDetail?.startDate) return;
      setCycleStartDate((prev) => prev ?? goalCycleDetail.startDate);
      setCycleEndDate((prev) => prev ?? goalCycleDetail.endDate);
      setHasCommittedCycle(true);
    }, [goalCycleDetail?.startDate, goalCycleDetail?.endDate]);

    const { data: prayerGoalsFromApi, isLoading: loadingPrayerGoals } =
      useGetAllPrayerGoals({
        enabled: activeTab === "prayer" || activeTab === "review",
        userId,
      });

    const {
      data: allQuranGoalsResponse,
      isLoading: loadingQuranGoals,
      isError: errorLoadingQuranGoals,
      refetch: refetchQuranGoals,
    } = useGetAllQuranGoals({
      enabled: activeTab === "quran" || activeTab === "review",
      userId,
    });

    const { data: allFastingGoalsResponse, isLoading: loadingFastingGoals } =
      useGetAllFastingGoals({
        enabled: activeTab === "fasting" || activeTab === "review",
        userId,
      });

    const { data: allSadaqahGoalsResponse, isLoading: loadingSadaqahGoals } =
      useGetAllSadaqahGoals({
        enabled: activeTab === "sadaqah" || activeTab === "review",
        userId,
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
    const { control, getValues, setValue, reset } = useForm({
      defaultValues: {
        missedZakat: "",
        kafarahForBreakingFasts: "",
        lillahDonation: "",
        sadaqahJariyah: "",
      },
      mode: "onChange",
    });

    useEffect(() => {
      reset({
        missedZakat: "",
        kafarahForBreakingFasts: "",
        lillahDonation: "",
        sadaqahJariyah: "",
      });
      setMissedZakatAmount(0);
      setLillahAmount(0);
      setSadaqahJariyahAmount(0);
      setFidyaMeals(0);
      setKafarahMeals(0);
      setKafarahCloths(0);
      setVolunteeringHours(0);
    }, [userId, goalCycleId, reset]);

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

    const setExpandedSelectionForCategory = useCallback(
      (
        category: "prayer" | "quran" | "fasting" | "sadaqah",
        goalId: string | null,
      ) => {
        setExpandedGoalSelectionId((prev) => ({ ...prev, [category]: goalId }));
        if (goalId) {
          setTimeout(() => scrollToGoalItemIdRef.current(goalId), 150);
        }
      },
      [],
    );

    const markGoalConfigured = useCallback((goalId: string) => {
      if (!goalId) return;
      setLocallyConfiguredGoalIds((prev) =>
        prev[goalId] ? prev : { ...prev, [goalId]: true },
      );
      setPendingUnconfiguredGoalId((prev) => {
        const next = { ...prev };
        let changed = false;
        (["prayer", "quran", "fasting", "sadaqah"] as const).forEach((key) => {
          if (next[key] === goalId) {
            next[key] = null;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setExpandedGoalSelectionId((prev) => {
        const next = { ...prev };
        let changed = false;
        (["prayer", "quran", "fasting", "sadaqah"] as const).forEach((key) => {
          if (next[key] === goalId) {
            next[key] = null;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      advanceToNextGoalRef.current(goalId);
    }, []);

    const isPrayerGoalConfigured = useCallback(
      (goalId: string) => {
        if (locallyConfiguredGoalIds[goalId]) return true;
        const goal = prayerGoals.find((item) => item.id === goalId);
        return hasConfiguredTargets(goal);
      },
      [locallyConfiguredGoalIds, prayerGoals],
    );

    const isQuranGoalConfigured = useCallback(
      (goalId: string) => {
        if (locallyConfiguredGoalIds[goalId]) return true;
        const goal = quranGoals.find((item) => item.id === goalId);
        return hasConfiguredQuranGoal(goal);
      },
      [locallyConfiguredGoalIds, quranGoals],
    );

    const isFastingGoalConfigured = useCallback(
      (goalId: string) => {
        if (locallyConfiguredGoalIds[goalId]) return true;
        const goal = fastingGoals.find((item) => item.id === goalId);
        return hasConfiguredFastingGoal(goal);
      },
      [locallyConfiguredGoalIds, fastingGoals],
    );

    const isOtherFastingGoalActive = useCallback(() => {
      return OTHER_FASTING_GOAL_IDS.some((goalId) => {
        if (selectedGoals[goalId] !== undefined) {
          return Boolean(selectedGoals[goalId]);
        }
        return Boolean(
          fastingGoals.find((goal) => goal.id === goalId)?.isSelected,
        );
      });
    }, [selectedGoals, fastingGoals]);

    const isSadaqahGoalConfigured = useCallback(
      (goalId: string) => {
        if (locallyConfiguredGoalIds[goalId]) return true;
        const resolvedId = resolveSadaqahUiId(goalId);
        if (locallyConfiguredGoalIds[resolvedId]) return true;
        const goal = sadaqahGoals.find(
          (item) => item.id === goalId || item.id === resolvedId,
        );
        return hasConfiguredSadaqahGoal(goal);
      },
      [locallyConfiguredGoalIds, sadaqahGoals],
    );

    const getGoalDisplayName = useCallback(
      (
        category: "prayer" | "quran" | "fasting" | "sadaqah",
        goalId: string,
      ) => {
        if (category === "prayer") {
          const goal = prayerGoals.find((item) => item.id === goalId);
          return (
            goal?.title ||
            t(`goalsData.${goalId}.title`, { defaultValue: goalId })
          );
        }
        if (category === "quran") {
          const goal = quranGoals.find((item) => item.id === goalId);
          return (
            goal?.title ||
            t(`goalsData.${goalId}.title`, { defaultValue: goalId })
          );
        }
        if (category === "fasting") {
          return t(`goalsData.${goalId}.title`, { defaultValue: goalId });
        }
        return t(`goalsData.${goalId}.title`, { defaultValue: goalId });
      },
      [prayerGoals, quranGoals, t],
    );

    const canEnableGoalInCategory = useCallback(
      (
        category: "prayer" | "quran" | "fasting" | "sadaqah",
        goalId: string,
      ) => {
        const pendingId = pendingUnconfiguredGoalId[category];
        if (!pendingId || pendingId === goalId) return true;

        setUnfinishedGoalModal({
          visible: true,
          goalName: getGoalDisplayName(category, pendingId),
        });
        return false;
      },
      [pendingUnconfiguredGoalId, getGoalDisplayName],
    );

    const trackPendingOnToggle = useCallback(
      (
        category: "prayer" | "quran" | "fasting" | "sadaqah",
        goalId: string,
        isSelected: boolean,
        isConfigured: boolean,
      ) => {
        setPendingUnconfiguredGoalId((prev) => {
          if (!isSelected) {
            if (prev[category] !== goalId) return prev;
            return { ...prev, [category]: null };
          }
          // Backend-configured (or already saved) goals are not "pending".
          if (isConfigured) {
            if (prev[category] !== goalId) return prev;
            return { ...prev, [category]: null };
          }
          if (prev[category] === goalId) return prev;
          return { ...prev, [category]: goalId };
        });
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
        if (tabId !== "cycle" && !hasCommittedCycle) return;
        setActiveTab(tabId);
      },
      [hasCommittedCycle],
    );

    // Keep user on the cycle tab until they tap Commit (selecting a date alone must not advance).
    useEffect(() => {
      if (!cycleStartDate) {
        setActiveTab("cycle");
      }
    }, [cycleStartDate]);

    // When opening the sheet from a step, honor that tab only if the cycle is already committed.
    useEffect(() => {
      if (!initialTab) return;
      if (initialTab === "cycle" || hasCommittedCycle) {
        setActiveTab(initialTab);
      } else {
        setActiveTab("cycle");
      }
    }, [initialTab]);

    const snapPoints = useMemo(
      () => [
        Math.round(windowHeight * 0.28),
        Math.round(windowHeight * 0.58),
        Math.round(windowHeight - insets.top + 24),
      ],
      [windowHeight, insets.top],
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
          opacity={1}
          // Transparent host so BlurView can soft-blur the screen behind (incl. header).
          style={[props.style, styles.backdropHost]}
        >
          <BlurView
            intensity={22}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.backdropDim} />
        </BottomSheetBackdrop>
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
    const { mutate: bulkUpsertQuranGoals, isPending: isSavingQuran } =
      useBulkUpsertQuranGoals();

    // React-query exposes a single `isSavingPrayer` boolean for the whole category.
    // Track the specific prayerType being saved so only that goal shows loading.
    const [savingPrayerType, setSavingPrayerType] = useState<string | null>(
      null,
    );
    useEffect(() => {
      if (!isSavingPrayer) setSavingPrayerType(null);
    }, [isSavingPrayer]);

    const handlePrayerToggle = useCallback(
      (prayerId: string, prayerType: string, isSelected: boolean) => {
        if (isSelected && !canEnableGoalInCategory("prayer", prayerId)) {
          return;
        }
        handleGoalToggle(prayerId, isSelected);
        if (isSelected) {
          setExpandedSelectionForCategory("prayer", prayerId);
        } else {
          setExpandedGoalSelectionId((prev) =>
            prev.prayer === prayerId ? { ...prev, prayer: null } : prev,
          );
        }
        trackPendingOnToggle(
          "prayer",
          prayerId,
          isSelected,
          isPrayerGoalConfigured(prayerId),
        );
        togglePrayerGoalByType(
          { prayerType, isActive: isSelected },
          {
            onError: () => {
              handleGoalToggle(prayerId, !isSelected);
              if (isSelected) {
                setExpandedSelectionForCategory("prayer", null);
              }
              trackPendingOnToggle(
                "prayer",
                prayerId,
                !isSelected,
                isPrayerGoalConfigured(prayerId),
              );
            },
          },
        );
      },
      [
        canEnableGoalInCategory,
        handleGoalToggle,
        isPrayerGoalConfigured,
        setExpandedSelectionForCategory,
        togglePrayerGoalByType,
        trackPendingOnToggle,
      ],
    );

    const handleQuranToggle = useCallback(
      async (
        quranId: string,
        apiGoals: { quranGoalType: string }[] | undefined,
        isSelected: boolean,
      ) => {
        if (isSelected && !canEnableGoalInCategory("quran", quranId)) {
          return;
        }
        handleGoalToggle(quranId, isSelected);
        if (isSelected) {
          setExpandedSelectionForCategory("quran", quranId);
        } else {
          setExpandedGoalSelectionId((prev) =>
            prev.quran === quranId ? { ...prev, quran: null } : prev,
          );
        }
        trackPendingOnToggle(
          "quran",
          quranId,
          isSelected,
          isQuranGoalConfigured(quranId),
        );

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
          if (isSelected) {
            setExpandedSelectionForCategory("quran", null);
          }
          trackPendingOnToggle(
            "quran",
            quranId,
            !isSelected,
            isQuranGoalConfigured(quranId),
          );
        }
      },
      [
        canEnableGoalInCategory,
        handleGoalToggle,
        isQuranGoalConfigured,
        setExpandedSelectionForCategory,
        toggleQuranGoalByType,
        trackPendingOnToggle,
      ],
    );

    const handleFastingToggle = useCallback(
      (
        fastingId: string,
        fastingType: string | undefined,
        isSelected: boolean,
      ) => {
        if (isSelected && !canEnableGoalInCategory("fasting", fastingId)) {
          return;
        }
        const type = resolveFastingType(fastingType || fastingId);
        handleGoalToggle(fastingId, isSelected);
        if (isSelected) {
          setExpandedSelectionForCategory("fasting", fastingId);
        } else {
          setExpandedGoalSelectionId((prev) =>
            prev.fasting === fastingId ? { ...prev, fasting: null } : prev,
          );
        }
        trackPendingOnToggle(
          "fasting",
          fastingId,
          isSelected,
          isFastingGoalConfigured(fastingId),
        );
        toggleFastingGoalByType(
          { fastingType: type, isActive: isSelected },
          {
            onError: (error: any) => {
              handleGoalToggle(fastingId, !isSelected);
              if (isSelected) {
                setExpandedSelectionForCategory("fasting", null);
              }
              trackPendingOnToggle(
                "fasting",
                fastingId,
                !isSelected,
                isFastingGoalConfigured(fastingId),
              );
              const message =
                error?.response?.data?.message ??
                "You can only set this goal if you do not set goals for the other three fasting options.";
              setFastingGoalConflictModal({ visible: true, message });
            },
          },
        );
      },
      [
        canEnableGoalInCategory,
        handleGoalToggle,
        isFastingGoalConfigured,
        setExpandedSelectionForCategory,
        toggleFastingGoalByType,
        trackPendingOnToggle,
      ],
    );

    const confirmDawoodFastGoal = useCallback(() => {
      setDawoodFastConfirmModalVisible(false);
      const dawoodGoal = fastingGoals.find(
        (goal) => goal.id === DAWOOD_FAST_GOAL_ID,
      );
      handleFastingToggle(DAWOOD_FAST_GOAL_ID, dawoodGoal?.fastingType, true);
    }, [fastingGoals, handleFastingToggle]);

    const handleSadaqahToggle = useCallback(
      (
        sadaqahId: string,
        sadaqahType: string | undefined,
        isSelected: boolean,
      ) => {
        if (isSelected && !canEnableGoalInCategory("sadaqah", sadaqahId)) {
          return;
        }
        const type = resolveSadaqahType(sadaqahType || sadaqahId);
        handleGoalToggle(sadaqahId, isSelected);
        if (isSelected) {
          setExpandedSelectionForCategory("sadaqah", sadaqahId);
        } else {
          setExpandedGoalSelectionId((prev) =>
            prev.sadaqah === sadaqahId ? { ...prev, sadaqah: null } : prev,
          );
        }
        trackPendingOnToggle(
          "sadaqah",
          sadaqahId,
          isSelected,
          isSadaqahGoalConfigured(sadaqahId),
        );
        toggleSadaqahGoalByType(
          { sadaqahType: type, isActive: isSelected },
          {
            onError: () => {
              handleGoalToggle(sadaqahId, !isSelected);
              if (isSelected) {
                setExpandedGoalSelectionId((prev) =>
                  prev.sadaqah === sadaqahId
                    ? { ...prev, sadaqah: null }
                    : prev,
                );
              }
              trackPendingOnToggle(
                "sadaqah",
                sadaqahId,
                !isSelected,
                isSadaqahGoalConfigured(sadaqahId),
              );
            },
          },
        );
      },
      [
        canEnableGoalInCategory,
        handleGoalToggle,
        isSadaqahGoalConfigured,
        setExpandedSelectionForCategory,
        toggleSadaqahGoalByType,
        trackPendingOnToggle,
      ],
    );

    enableGoalInActiveTabRef.current = (goal: any) => {
      if (!goal?.id) return;
      const tab = activeTabRef.current;
      if (tab === "prayer") {
        handlePrayerToggle(goal.id, goal.prayerType, true);
        return;
      }
      if (tab === "quran") {
        void handleQuranToggle(goal.id, goal.apiGoals, true);
        return;
      }
      if (tab === "fasting") {
        handleFastingToggle(goal.id, goal.fastingType, true);
        return;
      }
      if (tab === "sadaqah") {
        handleSadaqahToggle(goal.id, goal.sadaqahType, true);
      }
    };

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

    const requireSadaqahCurrencyCode = useCallback(
      (field: (typeof SADAQAH_CURRENCY_FIELDS)[number]) => {
        const code = extractCurrencyCode(getValues(field), "");
        if (!code) {
          showToast("error", t("monthlyGoalPlanner.selectCurrencyRequired"));
          return null;
        }
        return code;
      },
      [getValues, t],
    );

    const saveMissedZakatGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (missedZakatAmount < 1) {
          showToast("error", "Enter a missed zakat amount greater than 0");
          onFail?.();
          return;
        }
        const currencyCode = requireSadaqahCurrencyCode("missedZakat");
        if (!currencyCode) {
          onFail?.();
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "MISSED_ZAKAT",
            targetAmount: missedZakatAmount,
            currencyCode,
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
              markGoalConfigured("missed-zakat");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        missedZakatAmount,
        upsertSadaqahGoal,
        requireSadaqahCurrencyCode,
        persistSadaqahMetrics,
        markGoalConfigured,
        t,
      ],
    );

    const saveKaffarahGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (kafarahMeals < 1 && kafarahCloths < 1) {
          showToast("error", "Enter meals or clothing items for kaffarah");
          onFail?.();
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
              markGoalConfigured("kafarah-for-breaking-fasts");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        kafarahMeals,
        kafarahCloths,
        upsertSadaqahGoal,
        persistSadaqahMetrics,
        markGoalConfigured,
        t,
      ],
    );

    const saveFidyaGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (fidyaMeals < 1) {
          showToast("error", "Enter a fidya meal count greater than 0");
          onFail?.();
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
              markGoalConfigured("fidya");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        fidyaMeals,
        upsertSadaqahGoal,
        persistSadaqahMetrics,
        markGoalConfigured,
      ],
    );

    const saveLillahGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (lillahAmount < 1) {
          showToast("error", "Enter a lillah amount greater than 0");
          onFail?.();
          return;
        }
        const currencyCode = requireSadaqahCurrencyCode("lillahDonation");
        if (!currencyCode) {
          onFail?.();
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "LILLAH",
            targetAmount: lillahAmount,
            currencyCode,
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              markGoalConfigured("lilah-donations");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        lillahAmount,
        upsertSadaqahGoal,
        requireSadaqahCurrencyCode,
        persistSadaqahMetrics,
        markGoalConfigured,
      ],
    );

    const saveVolunteeringGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (volunteeringHours < 1) {
          showToast("error", "Enter volunteering hours greater than 0");
          onFail?.();
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
              markGoalConfigured("volunteering-services");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        volunteeringHours,
        upsertSadaqahGoal,
        persistSadaqahMetrics,
        markGoalConfigured,
      ],
    );

    const saveSadaqahJariyahGoal = useCallback(
      (goalKey: string, onDone?: () => void, onFail?: () => void) => {
        if (sadaqahJariyahAmount < 1) {
          showToast("error", "Enter a sadaqah jariyah amount greater than 0");
          onFail?.();
          return;
        }
        const currencyCode = requireSadaqahCurrencyCode("sadaqahJariyah");
        if (!currencyCode) {
          onFail?.();
          return;
        }
        upsertSadaqahGoal(
          {
            sadaqahType: "SADAQAH_JARIYAH",
            targetAmount: sadaqahJariyahAmount,
            currencyCode,
            causeCategory: "general",
          },
          {
            onSuccess: () => {
              persistSadaqahMetrics(goalKey, []);
              markGoalConfigured("sadaqah-jariyah");
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [
        sadaqahJariyahAmount,
        upsertSadaqahGoal,
        requireSadaqahCurrencyCode,
        persistSadaqahMetrics,
        markGoalConfigured,
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
        const option = currencyOptionFromCode(currencyCode);
        if (!option) return;
        setValue(field, option, {
          shouldDirty: false,
        });
      };

      for (const goal of sourceGoals) {
        if (!hasConfiguredSadaqahGoal(goal)) continue;
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
    }, [
      sadaqahGoals,
      goalCycleDetail?.sadaqahGoals,
      userId,
      goalCycleId,
      getValues,
      setValue,
    ]);

    const applyDefaultSadaqahCurrency = useCallback(
      (currencyOptionValue: string) => {
        for (const field of SADAQAH_CURRENCY_FIELDS) {
          setValue(field, currencyOptionValue, { shouldDirty: true });
        }
      },
      [setValue],
    );

    const persistPrayerGoal = useCallback(
      (
        payload: UpsertPrayerGoalPayload,
        goalId?: string,
        onDone?: () => void,
        onFail?: () => void,
      ) => {
        setSavingPrayerType(payload.prayerType);
        upsertPrayerGoal(payload, {
          onSuccess: () => {
            const id = goalId ?? PRAYER_TYPE_TO_UI_ID[payload.prayerType];
            if (id) markGoalConfigured(id);
            onDone?.();
          },
          onError: () => onFail?.(),
        });
      },
      [upsertPrayerGoal, markGoalConfigured],
    );

    const saveSimplePrayerTarget = useCallback(
      (
        prayerType: string,
        targetCount: number,
        onDone?: () => void,
        onFail?: () => void,
      ) => {
        persistPrayerGoal(
          {
            prayerType,
            isActive: true,
            targetCount,
            sliderValue: targetCount,
          },
          undefined,
          onDone,
          onFail,
        );
      },
      [persistPrayerGoal],
    );

    const saveQuranHoursGoal = useCallback(
      (
        quranGoalType: "LISTENING" | "TAJWEED",
        hours: number,
        onDone?: () => void,
        onFail?: () => void,
      ) => {
        bulkUpsertQuranGoals(
          {
            goals: [buildHoursQuranPayload(quranGoalType, hours)],
          },
          {
            onSuccess: () => {
              markGoalConfigured(
                quranGoalType === "LISTENING"
                  ? "quran-listening"
                  : "quran-tajweed",
              );
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [bulkUpsertQuranGoals, markGoalConfigured],
    );

    const saveQuranMetricGoal = useCallback(
      (
        variant: "recitation" | "memorization",
        /** When set (review editors), only that metric is sent; otherwise all configured metrics. */
        onlyMetric?: "surah" | "juz" | "completion" | "hizb",
        onDone?: () => void,
        onFail?: () => void,
      ) => {
        const goals = buildBulkQuranGoalsForVariant(
          variant,
          quranMetricsRef.current,
          onlyMetric,
        );
        if (goals.length === 0) {
          showToast("error", "Please complete your goal selection");
          onFail?.();
          return;
        }
        bulkUpsertQuranGoals(
          { goals },
          {
            onSuccess: () => {
              markGoalConfigured(
                variant === "recitation"
                  ? "quran-recitation"
                  : "quran-memorization",
              );
              onDone?.();
            },
            onError: () => onFail?.(),
          },
        );
      },
      [bulkUpsertQuranGoals, markGoalConfigured],
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

    const tabDataRef = useRef(tabData);
    tabDataRef.current = tabData;

    scrollToGoalItemIdRef.current = (goalId: string) => {
      const goals = tabDataRef.current;
      const index = goals.findIndex((item) => item?.id === goalId);
      if (index < 0 || !listRef.current) return;

      const computeOffset = () => {
        let offset = 12;
        for (let i = 0; i < index; i++) {
          const id = goals[i]?.id;
          offset +=
            (id ? goalItemHeightsRef.current[id] : undefined) ??
            GOAL_ITEM_ESTIMATED_HEIGHT;
          offset += GOAL_LIST_ITEM_GAP;
        }
        return offset;
      };

      const runScroll = () => {
        listRef.current?.scrollToOffset({
          offset: Math.max(0, computeOffset()),
          animated: true,
        });
      };

      runScroll();
      setTimeout(runScroll, 350);
      setTimeout(runScroll, 750);
    };

    advanceToNextGoalRef.current = (savedGoalId: string) => {
      const tab = activeTabRef.current;
      if (tab === "cycle" || tab === "review") return;

      if (advanceToNextGoalTimerRef.current) {
        clearTimeout(advanceToNextGoalTimerRef.current);
      }

      advanceToNextGoalTimerRef.current = setTimeout(() => {
        advanceToNextGoalTimerRef.current = null;
        if (activeTabRef.current !== tab) return;

        const goals = tabDataRef.current;
        const index = goals.findIndex((item) => item?.id === savedGoalId);
        if (index < 0 || index >= goals.length - 1) return;

        const next = goals[index + 1];
        if (!next?.id || next.isLoadingPlaceholder) return;

        setTimeout(() => scrollToGoalItemIdRef.current(next.id), 450);
        setTimeout(() => scrollToGoalItemIdRef.current(next.id), 950);
        setTimeout(() => scrollToGoalItemIdRef.current(next.id), 1500);
      }, ADVANCE_TO_NEXT_GOAL_MS);
    };

    useEffect(() => {
      return () => {
        if (advanceToNextGoalTimerRef.current) {
          clearTimeout(advanceToNextGoalTimerRef.current);
        }
      };
    }, []);

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
      console.log("the goal is ", goal);
      switch (key) {
        case "tahayyat-ul-wudhu":
          return (
            <TahiyatWuduGoalSelection
              isSaving={isSavingPrayer}
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget(
                  "TAHIYYAT_AL_WUDHU",
                  value,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        case "quran-listening":
          return (
            <QuranTimeSelection
              openOnMount={true}
              title={t("monthlyGoalPlanner.selectNumHours")}
              descriptionKey="monthlyGoalPlanner.hoursQuranListening"
              quranGoalType="LISTENING"
              isSaving={isSavingQuran}
              onSave={(hours: number, onDone, onFail) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  listeningHours: hours,
                }));
                saveQuranHoursGoal("LISTENING", hours, onDone, onFail);
              }}
            />
          );
        case "quran-tajweed":
          return (
            <QuranTimeSelection
              openOnMount={true}
              title={t("monthlyGoalPlanner.selectNumHours")}
              descriptionKey="monthlyGoalPlanner.hoursQuranTajweed"
              quranGoalType="TAJWEED"
              isSaving={isSavingQuran}
              onSave={(hours: number, onDone, onFail) => {
                setQuranMetrics((prev) => ({
                  ...prev,
                  tajweedHours: hours,
                }));
                saveQuranHoursGoal("TAJWEED", hours, onDone, onFail);
              }}
            />
          );
        case "quran-recitation-by-surah":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="others"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
                setQuranMetrics((prev) => {
                  const surah = prev?.surah ?? {};
                  return {
                  ...prev,
                    [key]: buildSurahRecitationReviewSelectedGoals(surah, t),
                  };
                });
                saveQuranMetricGoal("recitation", "surah", onDone, onFail);
              }}
            />
          );
        case "quran-recitation-by-completion":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationByCompletion")}
              initialMetric="completion"
              allowedMetrics={["completion"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="others"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
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
                saveQuranMetricGoal("recitation", "completion", onDone, onFail);
              }}
            />
          );
        case "quran-recitation-by-juz":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.recitationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="others"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
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
                    const rangeRow = buildJuzRecitationRangeReviewRow(
                      from,
                      to,
                      t,
                    );
                    rows.push({ ...rangeRow, value: "" });
                  }
                  return { ...prev, [key]: rows };
                });
                saveQuranMetricGoal("recitation", "juz", onDone, onFail);
              }}
            />
          );
        case "quran-memorization-by-juz":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationByJuz")}
              initialMetric="juz"
              allowedMetrics={["juz"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
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
                saveQuranMetricGoal("memorization", "juz", onDone, onFail);
              }}
            />
          );
        case "quran-memorization-by-hizb":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationByHizb")}
              initialMetric="hizb"
              allowedMetrics={["hizb"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
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
                saveQuranMetricGoal("memorization", "hizb", onDone, onFail);
              }}
            />
          );
        case "quran-memorization-by-surah":
          return (
            <QuranRecitationGoalSelection
              openOnMount={true}
              {...quranReferenceProps}
              title={t("monthlyGoalPlanner.memorizationBySurah")}
              initialMetric="surah"
              allowedMetrics={["surah"]}
              onMetricsChange={handleQuranMetricsChange}
              variant="memorization"
              isSaving={isSavingQuran}
              onSave={(_payload, onDone, onFail) => {
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
                saveQuranMetricGoal("memorization", "surah", onDone, onFail);
              }}
            />
          );
        case "missed-fasts":
          return (
            <MissedRamadanFastGoalSelection
              openOnMount={true}
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
              openOnMount={true}
              calendarWindow={fastingCalendarWindow}
              onSave={() => {}}
            />
          );
        case "monday-and-thursday-fasts":
          return (
            <MondayThursdayFastGoalSelection
              openOnMount={true}
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
              openOnMount={true}
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
              openOnMount={true}
                count={missedZakatAmount}
                setCount={setMissedZakatAmount}
                control={control}
                name="missedZakat"
              title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
                handleDecrease={() =>
                  setMissedZakatAmount((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setMissedZakatAmount((prev) => prev + 1)}
                countTitle={t("monthlyGoalPlanner.amount")}
              isSaving={isSavingSadaqah}
              onSave={(done, fail) =>
                saveMissedZakatGoal(goal.title, done, fail)
              }
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "kafarah-for-breaking-fasts":
          return (
              <KafarahForBreakingFastsOrOAthSelector
              openOnMount={true}
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
              onSave={(done, fail) => saveKaffarahGoal(goal.title, done, fail)}
            />
          );
        case "fidya":
          return (
              <FidyaSelector
              openOnMount={true}
                count={fidyaMeals}
                setCount={setFidyaMeals}
                handleDecrease={() =>
                  setFidyaMeals((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setFidyaMeals((prev) => prev + 1)}
                title={t("monthlyGoalPlanner.fidyaMealsTitle")}
              isSaving={isSavingSadaqah}
              onSave={(done, fail) => saveFidyaGoal(goal.title, done, fail)}
            />
          );
        case "lilah-donations":
          return (
              <MissedZakats
              openOnMount={true}
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
              onSave={(done, fail) => saveLillahGoal(goal.title, done, fail)}
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "volunteering-services":
          return (
              <FidyaSelector
              openOnMount={true}
                count={volunteeringHours}
                setCount={setVolunteeringHours}
                handleDecrease={() =>
                  setVolunteeringHours((prev) => Math.max(0, prev - 1))
                }
                handleIncrease={() => setVolunteeringHours((prev) => prev + 1)}
                title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
              countTitle={t("monthlyGoalPlanner.hours")}
              isSaving={isSavingSadaqah}
              onSave={(done, fail) =>
                saveVolunteeringGoal(goal.title, done, fail)
              }
            />
          );
        case "sadaqah-jariyah":
          return (
              <MissedZakats
              openOnMount={true}
                count={sadaqahJariyahAmount}
                setCount={setSadaqahJariyahAmount}
                control={control}
                name="sadaqahJariyah"
              title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
                handleDecrease={() =>
                  setSadaqahJariyahAmount((prev) => Math.max(0, prev - 1))
                }
              handleIncrease={() => setSadaqahJariyahAmount((prev) => prev + 1)}
                countTitle={t("monthlyGoalPlanner.amount")}
              isSaving={isSavingSadaqah}
              onSave={(done, fail) =>
                saveSadaqahJariyahGoal(goal.title, done, fail)
              }
              onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
            />
          );
        case "five-daily-prayers":
          return (
            <DailyPrayerGoalSelection
              openOnMount={true}
              cycleStartDate={cycleStartDate ?? undefined}
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
              isSaving={isSavingPrayer}
              onSave={(
                fajr,
                dhuhr,
                asar,
                maghrib,
                isha,
                jumuah,
                trackCongregation,
                onDone,
                onFail,
              ) => {
                persistPrayerGoal(
                  {
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
                  },
                  undefined,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        case "sunnah-rawatib":
          return (
            <SunnahRawatibGoalSelection
              openOnMount={true}
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
              isSaving={isSavingPrayer}
              onSave={(payload, onDone, onFail) => {
                persistPrayerGoal(
                  {
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
                  },
                  undefined,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        case "tahayyat-ul-masjid":
          return (
            <TahiyyatMasjidGoalSelection
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget(
                  "TAHIYYAT_AL_MASJID",
                  value,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        case "missed-past-prayers":
          return (
            <MissedPrayerGoalSelection
              openOnMount={true}
              initialValue={
                sourcePrayer?.targetDays ?? sourcePrayer?.targetCount ?? 3
              }
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                persistPrayerGoal(
                  {
                    prayerType: "MISSED_PAST_PRAYERS",
                    isActive: true,
                    targetDays: value,
                    targetCount: value * 5,
                    sliderValue: value,
                  },
                  undefined,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        case "duha-prayer":
          return (
            <DuhaPrayerGoalSelection
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget("DUHA", value, onDone, onFail);
              }}
            />
          );
        case "tawba-prayer":
          return (
            <TawbahPrayerGoalSelection
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget("TAWBAH", value, onDone, onFail);
              }}
            />
          );
        case "istikhara-prayer":
          return (
            <IstikharaPrayerGoalSelection
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget("ISTIKHARA", value, onDone, onFail);
              }}
            />
          );
        case "shukr-prayer":
          return (
            <ShukarPrayerGoalSelection
              openOnMount={true}
              initialValue={sourcePrayer?.targetCount ?? 1}
              isSaving={isSavingPrayer}
              onSave={(value, onDone, onFail) => {
                saveSimplePrayerTarget("SHUKR", value, onDone, onFail);
              }}
            />
          );
        case "qiyal-al-lail-prayer":
          return (
            <QiyamalLaylGoalSelection
              openOnMount={true}
              initialValues={getQiyamInitial({
                qiyamConfig: sourcePrayer?.qiyamConfig,
                isFlexible: sourcePrayer?.qiyamConfig?.isFlexible,
                trackTahajjud: sourcePrayer?.qiyamConfig?.trackTahajjud,
              })}
              isSaving={isSavingPrayer}
              onSave={(
                payload: {
                commitment: "every_night" | "flexible";
                twoRakahPrayers: number;
                witrPrayers: number;
                trackTahajjud: "yes" | "no";
                },
                onDone,
                onFail,
              ) => {
                persistPrayerGoal(
                  {
                    prayerType: "QIYAM_AL_LAYL",
                    isActive: true,
                    qiyamConfig: {
                      isFlexible: payload.commitment === "flexible",
                      unitTarget: payload.twoRakahPrayers,
                      trackTahajjud: payload.trackTahajjud === "yes",
                    },
                  },
                  undefined,
                  onDone,
                  onFail,
                );
              }}
            />
          );
        default:
          return null;
      }
    };

    return (
      <>
        <BottomSheetModal
        ref={ref}
          index={2}
        snapPoints={snapPoints}
          topInset={insets.top}
          bottomInset={insets.bottom}
        enablePanDownToClose
          enableHandlePanningGesture
          enableContentPanningGesture
          onDismiss={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
          containerComponent={GoalPlannerSheetContainer}
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
              const isDisabled = tab.id !== "cycle" && !hasCommittedCycle;
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
            ref={listRef}
          data={tabData}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
            scrollEnabled={sheetScrollEnabled}
            onScrollToIndexFailed={({ index, averageItemLength }) => {
              const fallbackOffset = Math.max(
                0,
                (averageItemLength ||
                  GOAL_ITEM_ESTIMATED_HEIGHT + GOAL_LIST_ITEM_GAP) * index,
              );
              listRef.current?.scrollToOffset({
                offset: fallbackOffset,
                animated: true,
              });
              setTimeout(() => {
                listRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0,
                });
              }, 300);
            }}
          ListHeaderComponent={
              activeTab === "cycle" ? (
                <CycleStartTab
                  selectedStartDate={cycleStartDate}
                  selectedEndDate={cycleEndDate}
                  backendStartDate={goalCycleDetail?.startDate ?? null}
                  onDateSelect={handleCycleDateSelect}
                  onCommit={() => {
                    setHasCommittedCycle(true);
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
                <View
                  style={[
                    styles.footerContainer,
                    { paddingBottom: Math.max(insets.bottom, 20) },
                  ]}
                >
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
                    onLayout={(event) =>
                      registerGoalItemLayout(
                        prayer.id,
                        event.nativeEvent.layout.height,
                      )
                    }
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                      title={(
                        prayer.title || t(`goalsData.${prayer.id}.title`)
                    ).toUpperCase()}
                    imageSource={prayer?.image}
                    handleSeeMorePRess={() =>
                        handleSeeMorePress(prayer.prayerType)
                      }
                      description={(() => {
                        const localCopy = t(`goalsData.${prayer.id}`, {
                          returnObjects: true,
                        }) as {
                          summaryDescription?: string;
                          description?: string;
                        };
                        return (
                          (typeof localCopy?.summaryDescription === "string" &&
                            localCopy.summaryDescription) ||
                          prayer.summaryDescription ||
                          (typeof localCopy?.description === "string" &&
                            localCopy.description) ||
                          prayer.description ||
                          t(`goalsData.${prayer.id}.description`)
                        );
                      })()}
                      onToggle={(isSelected) =>
                        handlePrayerToggle(
                          prayer.id,
                          prayer.prayerType,
                          isSelected,
                        )
                      }
                      canToggle={(nextValue) =>
                        !nextValue ||
                        canEnableGoalInCategory("prayer", prayer.id)
                      }
                    />
                    {prayer.id === "tahayyat-ul-wudhu" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <TahiyatWuduGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "fiveDailyPrayers" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <DailyPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          cycleStartDate={cycleStartDate ?? undefined}
                          initialValues={getFiveDailyInitial(prayer)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(
                            fajr,
                            dhuhr,
                            asar,
                            maghrib,
                            isha,
                            jumuah,
                            trackCongregation,
                            onDone,
                            onFail,
                          ) => {
                            persistPrayerGoal(
                              {
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
                              },
                              undefined,
                              onDone,
                              onFail,
                            );
                          }}
                        />
                      </View>
                    )}
                    {prayer.id === "sunnahRawatib" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <SunnahRawatibGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValues={getSunnahInitial(prayer)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(payload, onDone, onFail) => {
                            persistPrayerGoal(
                              {
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
                              },
                              undefined,
                              onDone,
                              onFail,
                            );
                          }}
                        />
                      </View>
                    )}
                    {prayer.id === "thayyat-ul-masjid" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <TahiyyatMasjidGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "missedPastPrayers" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getMissedTargetDays(prayer, 3)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) => {
                            persistPrayerGoal(
                              {
                                prayerType: prayer.prayerType,
                                isActive: true,
                                targetDays: value,
                                targetCount: value * 5,
                                sliderValue: value,
                              },
                              undefined,
                              onDone,
                              onFail,
                            );
                          }}
                        />
                      </View>
                    )}
                    {prayer.id === "duhaPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <DuhaPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "tawbaPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <TawbahPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "istikharah" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <IstikharaPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "shukrPrayer" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <ShukarPrayerGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValue={getSimpleTargetCount(prayer, 1)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(value, onDone, onFail) =>
                            saveSimplePrayerTarget(
                              prayer.prayerType,
                              value,
                              onDone,
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}
                    {prayer.id === "qiyamalLail" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <QiyamalLaylGoalSelection
                          openOnMount={expandedGoalSelectionId.prayer === prayer.id}
                          initialValues={getQiyamInitial(prayer)}
                          isSaving={
                            isSavingPrayer &&
                            savingPrayerType === prayer.prayerType
                          }
                          onSave={(payload, onDone, onFail) => {
                            persistPrayerGoal(
                              {
                                prayerType: prayer.prayerType,
                                isActive: true,
                                qiyamConfig: {
                                  isFlexible: payload.commitment === "flexible",
                                  unitTarget: payload.twoRakahPrayers,
                                  trackTahajjud:
                                    payload.trackTahajjud === "yes",
                                },
                              },
                              undefined,
                              onDone,
                              onFail,
                            );
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
                  <View
                    key={quran.id}
                    style={styles.goalListItem}
                    onLayout={(event) =>
                      registerGoalItemLayout(
                        quran.id,
                        event.nativeEvent.layout.height,
                      )
                    }
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                      title={(
                        quran.title || t(`goalsData.${quran.id}.title`)
                      ).toUpperCase()}
                      imageSource={quran.image}
                      handleSeeMorePRess={() => handleSeeMorePress(quran.id)}
                      description={(() => {
                        const localCopy = t(`goalsData.${quran.id}`, {
                          returnObjects: true,
                        }) as {
                          summaryDescription?: string;
                          description?: string;
                        };
                        return (
                          (typeof localCopy?.summaryDescription === "string" &&
                            localCopy.summaryDescription) ||
                          quran.summaryDescription ||
                          (typeof localCopy?.description === "string" &&
                            localCopy.description) ||
                          quran.description ||
                          t(`goalsData.${quran.id}.description`)
                        );
                      })()}
                      onToggle={(val) =>
                        handleQuranToggle(quran.id, quran.apiGoals, val)
                      }
                      canToggle={(nextValue) =>
                        !nextValue || canEnableGoalInCategory("quran", quran.id)
                      }
                    />
                    {quran.id === "quran-listening" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <QuranTimeSelection
                          openOnMount={expandedGoalSelectionId.quran === quran.id}
                        title={t("monthlyGoalPlanner.selectNumHours")}
                          descriptionKey="monthlyGoalPlanner.hoursQuranListening"
                          quranGoalType="LISTENING"
                          isSaving={isSavingQuran}
                          onSave={(hours, onDone, onFail) => {
                            setQuranMetrics((prev) => ({
                              ...prev,
                              listeningHours: hours,
                            }));
                            saveQuranHoursGoal(
                              "LISTENING",
                              hours,
                              onDone,
                              onFail,
                            );
                          }}
                        />
                      </View>
                    )}
                    {quran.id === "quran-tajweed" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                    <QuranTimeSelection
                          openOnMount={expandedGoalSelectionId.quran === quran.id}
                      title={t("monthlyGoalPlanner.selectNumHours")}
                          descriptionKey="monthlyGoalPlanner.hoursQuranTajweed"
                          quranGoalType="TAJWEED"
                          isSaving={isSavingQuran}
                          onSave={(hours, onDone, onFail) => {
                            setQuranMetrics((prev) => ({
                              ...prev,
                              tajweedHours: hours,
                            }));
                            saveQuranHoursGoal(
                              "TAJWEED",
                              hours,
                              onDone,
                              onFail,
                            );
                          }}
                        />
                      </View>
                    )}
                    {quran.id === "quran-recitation" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <QuranRecitationGoalSelection
                          openOnMount={expandedGoalSelectionId.quran === quran.id}
                          {...quranReferenceProps}
                        title={t("monthlyGoalPlanner.selectTrackingMetric")}
                          onMetricsChange={handleQuranMetricsChange}
                          variant="others"
                          isSaving={isSavingQuran}
                          onSave={({ metric }, onDone, onFail) =>
                            saveQuranMetricGoal(
                              "recitation",
                              metric,
                              () => {
                                if (metric === "surah") {
                          setQuranMetrics((prev) => ({
                            ...prev,
                                    "quran-recitation-by-surah":
                                      buildSurahRecitationReviewSelectedGoals(
                                        quranMetricsRef.current?.surah ?? {},
                                        t,
                                      ),
                                  }));
                                }
                                onDone?.();
                              },
                              onFail,
                            )
                          }
                        />
                      </View>
                    )}

                    {quran.id === "quran-memorization" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <QuranRecitationGoalSelection
                          openOnMount={expandedGoalSelectionId.quran === quran.id}
                          {...quranReferenceProps}
                        title={t("monthlyGoalPlanner.selectTrackingMetric")}
                          onMetricsChange={handleQuranMetricsChange}
                        variant="memorization"
                          isSaving={isSavingQuran}
                          onSave={({ metric }, onDone, onFail) =>
                            saveQuranMetricGoal(
                              "memorization",
                              metric,
                              onDone,
                              onFail,
                            )
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
                    onLayout={(event) =>
                      registerGoalItemLayout(
                        fasting.id,
                        event.nativeEvent.layout.height,
                      )
                    }
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                    title={t(`goalsData.${fasting.id}.title`).toUpperCase()}
                      imageSource={fasting.image}
                      handleSeeMorePRess={() => handleSeeMorePress(fasting.id)}
                      description={(() => {
                        const localCopy = t(`goalsData.${fasting.id}`, {
                          returnObjects: true,
                        }) as {
                          summaryDescription?: string;
                          description?: string;
                        };
                        return (
                          (typeof localCopy?.summaryDescription === "string" &&
                            localCopy.summaryDescription) ||
                          (typeof localCopy?.description === "string" &&
                            localCopy.description) ||
                          t(`goalsData.${fasting.id}.description`)
                        );
                      })()}
                      onToggle={(val) =>
                        handleFastingToggle(
                          fasting.id,
                          fasting.fastingType,
                          val,
                        )
                      }
                      canToggle={(nextValue) => {
                        if (!nextValue) return true;
                        if (
                          fasting.id === DAWOOD_FAST_GOAL_ID &&
                          !isOtherFastingGoalActive()
                        ) {
                          setDawoodFastConfirmModalVisible(true);
                          return false;
                        }
                        return canEnableGoalInCategory("fasting", fasting.id);
                      }}
                    />
                    {fasting.id === "missed-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MissedRamadanFastGoalSelection
                          openOnMount={expandedGoalSelectionId.fasting === fasting.id}
                          calendarWindow={fastingCalendarWindow}
                          onSave={(selectedDates: string[]) => {
                            setFastingMetrics((prev) => ({
                              ...prev,
                              [fasting.id]:
                                formatFastingReviewRowsFromDates(selectedDates),
                            }));
                            markGoalConfigured(fasting.id);
                          }}
                        />
                      </View>
                    )}
                    {fasting.id === "dawood-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <ProphetDawoodFastGoalSelection
                          openOnMount={expandedGoalSelectionId.fasting === fasting.id}
                          calendarWindow={fastingCalendarWindow}
                          onSave={() => {
                            markGoalConfigured(fasting.id);
                          }}
                        />
                      </View>
                    )}
                    {fasting.id === "monday-and-thursday-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <MondayThursdayFastGoalSelection
                          openOnMount={expandedGoalSelectionId.fasting === fasting.id}
                          calendarWindow={fastingCalendarWindow}
                          onSave={(selectedDates: string[]) => {
                            setFastingMetrics((prev) => ({
                              ...prev,
                              [fasting.id]:
                                formatFastingReviewRowsFromDates(selectedDates),
                            }));
                            setMondayThursdaySelectedGoalFasts(selectedDates);
                            markGoalConfigured(fasting.id);
                          }}
                        />
                      </View>
                    )}
                    {fasting.id === "white-days-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                        <WhiteDaysFastGoalSelection
                          openOnMount={expandedGoalSelectionId.fasting === fasting.id}
                          calendarWindow={fastingCalendarWindow}
                          onSave={() => {
                            setFastingMetrics((prev) => {
                              const next = { ...prev };
                              delete next[fasting.id];
                              return next;
                            });
                            markGoalConfigured(fasting.id);
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
                    onLayout={(event) =>
                      registerGoalItemLayout(
                        sadaqah.id,
                        event.nativeEvent.layout.height,
                      )
                    }
                  >
                    <GoalCardWithDescriptionAndOptionToSelectGoal
                      initialValue={isOn}
                    title={t(`goalsData.${sadaqah.id}.title`).toUpperCase()}
                      imageSource={sadaqah.image}
                      handleSeeMorePRess={() => handleSeeMorePress(sadaqah.id)}
                      description={(() => {
                        const localCopy = t(`goalsData.${sadaqah.id}`, {
                          returnObjects: true,
                        }) as {
                          summaryDescription?: string;
                          description?: string;
                        };
                        return (
                          (typeof localCopy?.summaryDescription === "string" &&
                            localCopy.summaryDescription) ||
                          (typeof localCopy?.description === "string" &&
                            localCopy.description) ||
                          t(`goalsData.${sadaqah.id}.description`)
                        );
                      })()}
                      onToggle={(val) =>
                        handleSadaqahToggle(
                          sadaqah.id,
                          sadaqah.sadaqahType,
                          val,
                        )
                      }
                      canToggle={(nextValue) =>
                        !nextValue ||
                        canEnableGoalInCategory("sadaqah", sadaqah.id)
                      }
                    />

                    {sadaqah.id === "missed-zakat" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <MissedZakats
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
                        count={missedZakatAmount}
                        setCount={setMissedZakatAmount}
                        control={control}
                        name="missedZakat"
                          title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
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
                          onSave={(done, fail) =>
                            saveMissedZakatGoal(sadaqah.id, done, fail)
                          }
                          onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
                      />
                      </View>
                    )}

                    {sadaqah.id === "kafarah-for-breaking-fasts" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <KafarahForBreakingFastsOrOAthSelector
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
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
                          onSave={(done, fail) =>
                            saveKaffarahGoal(sadaqah.id, done, fail)
                          }
                      />
                      </View>
                    )}
                    {sadaqah.id === "fidya" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                    <FidyaSelector
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
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
                          onSave={(done, fail) =>
                            saveFidyaGoal(sadaqah.id, done, fail)
                          }
                    />
                      </View>
                  )}

                    {sadaqah.id === "lilah-donations" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <MissedZakats
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
                        count={lillahAmount}
                        setCount={setLillahAmount}
                        control={control}
                        name="lillahDonation"
                          title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
                        handleDecrease={() => {
                          setLillahAmount((prev) => Math.max(0, prev - 1));
                        }}
                        handleIncrease={() => {
                          setLillahAmount((prev) => prev + 1);
                        }}
                        countTitle={t("monthlyGoalPlanner.amount")}
                          isSaving={isSavingSadaqah}
                          onSave={(done, fail) =>
                            saveLillahGoal(sadaqah.id, done, fail)
                          }
                          onSetAsDefaultCurrency={applyDefaultSadaqahCurrency}
                      />
                      </View>
                    )}

                    {sadaqah.id === "volunteering-services" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <FidyaSelector
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
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
                          onSave={(done, fail) =>
                            saveVolunteeringGoal(sadaqah.id, done, fail)
                          }
                      />
                      </View>
                    )}
                    {sadaqah.id === "sadaqah-jariyah" && isOn && (
                      <View style={styles.goalSelectionBelowCard}>
                      <MissedZakats
                          openOnMount={expandedGoalSelectionId.sadaqah === sadaqah.id}
                        count={sadaqahJariyahAmount}
                        setCount={setSadaqahJariyahAmount}
                        control={control}
                        name="sadaqahJariyah"
                          title={t("monthlyGoalPlanner.volunteeringMonthTitle")}
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
                          onSave={(done, fail) =>
                            saveSadaqahJariyahGoal(sadaqah.id, done, fail)
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
                        let mergedSelected = (
                          localSelected.length > 0 ? localSelected : apiSelected
                        ).map((entry: any, i: number) => ({
                          id: i + 1,
                          name: entry?.name ?? `item-${i + 1}`,
                          label: entry?.label ?? "",
                          value: entry?.value ?? "",
                        }));

                        // Recitation-by-surah: rebuild from live per-surah
                        // settings so weekly/daily is not flattened by the
                        // API's single goal-level frequency.
                        if (
                          goal.title === "quran-recitation-by-surah" &&
                          Array.isArray(quranMetrics?.surah?.selectedSurahs) &&
                          quranMetrics.surah.selectedSurahs.length > 0
                        ) {
                          mergedSelected =
                            buildSurahRecitationReviewSelectedGoals(
                              quranMetrics.surah,
                              t,
                            );
                        }

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
                              totalValue: countJuzInRange(range.from, range.to),
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
        </BottomSheetModal>
        <WarningModal
          visible={fastingGoalConflictModal.visible}
          title="SET GOAL?"
          message={fastingGoalConflictModal.message}
          primaryButtonText="Ok"
          secondaryButtonText={null}
          primaryButtonVariant="green"
          primaryButtonSize="modal"
          onPrimaryPress={closeFastingGoalConflictModal}
          onBackdropPress={closeFastingGoalConflictModal}
          primaryButtonStyle={styles.modalPrimaryButton}
        />
        <WarningModal
          visible={dawoodFastConfirmModalVisible}
          title={t("monthlyGoalPlanner.dawoodFastConfirmModalTitle")}
          message={t("monthlyGoalPlanner.dawoodFastConfirmModalMessage")}
          primaryButtonText={t("monthlyGoalPlanner.dawoodFastConfirmContinue")}
          secondaryButtonText={t("monthlyGoalPlanner.dawoodFastConfirmCancel")}
          primaryButtonVariant="green"
          primaryButtonSize="modal"
          onPrimaryPress={confirmDawoodFastGoal}
          onSecondaryPress={closeDawoodFastConfirmModal}
          onBackdropPress={closeDawoodFastConfirmModal}
          primaryButtonStyle={styles.modalPrimaryButton}
          secondaryButtonTextStyle={{
            color: Colors.light.subtext,
          }}
        />
        <WarningModal
          visible={unfinishedGoalModal.visible}
          title={t("monthlyGoalPlanner.unfinishedGoalModalTitle")}
          message={t("monthlyGoalPlanner.unfinishedGoalModalMessage", {
            goalName: unfinishedGoalModal.goalName,
          })}
          primaryButtonText={t("monthlyGoalPlanner.unfinishedGoalModalOk")}
          secondaryButtonText={null}
          primaryButtonVariant="green"
          primaryButtonSize="modal"
          onPrimaryPress={closeUnfinishedGoalModal}
          onBackdropPress={closeUnfinishedGoalModal}
          primaryButtonStyle={styles.modalPrimaryButton}
        />
        <WarningModal
          visible={finishSaveModalVisible}
          title={t("monthlyGoalPlanner.finishAndSaveModalTitle")}
          message={t("monthlyGoalPlanner.finishAndSaveModalMessage")}
          primaryButtonText={t("monthlyGoalPlanner.finishAndSaveYes")}
          secondaryButtonText={t("monthlyGoalPlanner.finishAndSaveCancel")}
          primaryButtonVariant="green"
          primaryButtonSize="modal"
          onPrimaryPress={confirmFinishAndSave}
          onSecondaryPress={closeFinishSaveModal}
          onBackdropPress={closeFinishSaveModal}
          primaryButtonStyle={styles.modalPrimaryButton}
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
  modalPrimaryButton: {
    alignSelf: "center",
  },
  sheetOverlayRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    // height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBg: {
    backgroundColor: Colors.light.blackBackground,
  },
  backdropHost: {
    backgroundColor: "transparent",
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 26, 47, 0.55)",
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
