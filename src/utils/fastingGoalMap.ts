import type { ImageSourcePropType } from "react-native";
import {
  missedramadanfastsbottomsheetimage,
  thefastsofprophetdawoodbottomsheetimage,
  mondayandthursdayfastsbottomsheetimage,
  whitedaysfastsbottomsheetimage,
} from "@/assets/images";

/** Backend fastingType → local UI card id */
export const FASTING_TYPE_TO_UI_ID: Record<string, string> = {
  MISSED_RAMADAN: "missed-fasts",
  PROPHET_DAWOOD: "dawood-fasts",
  MONDAY_THURSDAY: "monday-and-thursday-fasts",
  WHITE_DAYS: "white-days-fasts",
};

export const UI_ID_TO_FASTING_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(FASTING_TYPE_TO_UI_ID).map(([fastingType, uiId]) => [
    uiId,
    fastingType,
  ]),
);

const FASTING_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  MISSED_RAMADAN: missedramadanfastsbottomsheetimage,
  PROPHET_DAWOOD: thefastsofprophetdawoodbottomsheetimage,
  MONDAY_THURSDAY: mondayandthursdayfastsbottomsheetimage,
  WHITE_DAYS: whitedaysfastsbottomsheetimage,
};

export const FASTING_GOAL_LOADING_PLACEHOLDERS = Object.keys(
  FASTING_TYPE_TO_UI_ID,
).map((_, index) => ({
  id: `fasting-loading-${index}`,
  isLoadingPlaceholder: true,
}));

export type FastingGoalApiItem = {
  id: string | null;
  fastingType: string;
  isActive: boolean;
  targetCount?: number;
  completedCount?: number;
  dawoodStartDay?: number | null;
  plannedCount?: number;
  plannedDates?: string[];
};

export type FastingGoalListItem = FastingGoalApiItem & {
  id: string;
  fastingGoalId: string | null;
  isSelected: boolean;
  image?: ImageSourcePropType;
};

export function resolveFastingType(goalKey: string): string {
  if (FASTING_TYPE_TO_UI_ID[goalKey]) return goalKey;
  return UI_ID_TO_FASTING_TYPE[goalKey] ?? goalKey;
}

export function resolveFastingUiId(goalKey: string): string {
  if (UI_ID_TO_FASTING_TYPE[goalKey]) return goalKey;
  return FASTING_TYPE_TO_UI_ID[goalKey] ?? goalKey;
}

export function isFastingGoalKey(goalKey: string): boolean {
  return !!FASTING_TYPE_TO_UI_ID[goalKey] || !!UI_ID_TO_FASTING_TYPE[goalKey];
}

export function mapFastingGoalsFromApi(
  goals: FastingGoalApiItem[] | undefined | null,
): FastingGoalListItem[] {
  if (!Array.isArray(goals)) return [];

  return goals
    .map((goal) => {
      const uiId = FASTING_TYPE_TO_UI_ID[goal.fastingType];
      if (!uiId) return null;

      return {
        ...goal,
        id: uiId,
        fastingGoalId: goal.id,
        isSelected: Boolean(goal.isActive),
        image: FASTING_TYPE_IMAGES[goal.fastingType],
        plannedDates: goal.plannedDates ?? [],
      };
    })
    .filter(Boolean) as FastingGoalListItem[];
}
