import type { ImageSourcePropType } from "react-native";
import {
  missedzakatbottomsheetimage,
  kaffarahbottomsheetimage,
  fidyabottomsheetimage,
  lillahdonationbottomsheetimage,
  volunteeringservicesbottomsheetimage,
  sadaqahjariyahbottomsheetimage,
} from "@/assets/images";

/** Backend sadaqahType → local UI card id */
export const SADAQAH_TYPE_TO_UI_ID: Record<string, string> = {
  MISSED_ZAKAT: "missed-zakat",
  KAFFARAH: "kafarah-for-breaking-fasts",
  FIDYA: "fidya",
  LILLAH: "lilah-donations",
  VOLUNTEERING: "volunteering-services",
  SADAQAH_JARIYAH: "sadaqah-jariyah",
  // SADAQAH_PARENTS: no planner card / description content yet
};

export const UI_ID_TO_SADAQAH_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(SADAQAH_TYPE_TO_UI_ID).map(([sadaqahType, uiId]) => [
    uiId,
    sadaqahType,
  ]),
);

const SADAQAH_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  MISSED_ZAKAT: missedzakatbottomsheetimage,
  KAFFARAH: kaffarahbottomsheetimage,
  FIDYA: fidyabottomsheetimage,
  LILLAH: lillahdonationbottomsheetimage,
  VOLUNTEERING: volunteeringservicesbottomsheetimage,
  SADAQAH_JARIYAH: sadaqahjariyahbottomsheetimage,
};

export const SADAQAH_GOAL_LOADING_PLACEHOLDERS = Object.keys(
  SADAQAH_TYPE_TO_UI_ID,
).map((_, index) => ({
  id: `sadaqah-loading-${index}`,
  isLoadingPlaceholder: true,
}));

export type SadaqahGoalApiItem = {
  sadaqahGoalId: string | null;
  sadaqahType: string;
  isActive: boolean;
  targetAmount?: number;
  targetUnit?: string;
  currencyCode?: string | null;
  kaffarahSubtype?: string | null;
  kaffarahMealsTarget?: number;
  kaffarahItemsTarget?: number;
  causeCategory?: string | null;
  notes?: string | null;
  completedAmount?: number;
  progressPercent?: number;
};

export type SadaqahGoalListItem = SadaqahGoalApiItem & {
  id: string;
  isSelected: boolean;
  image?: ImageSourcePropType;
};

export function resolveSadaqahType(goalKey: string): string {
  if (SADAQAH_TYPE_TO_UI_ID[goalKey]) return goalKey;
  return UI_ID_TO_SADAQAH_TYPE[goalKey] ?? goalKey;
}

export function resolveSadaqahUiId(goalKey: string): string {
  if (UI_ID_TO_SADAQAH_TYPE[goalKey]) return goalKey;
  return SADAQAH_TYPE_TO_UI_ID[goalKey] ?? goalKey;
}

export function isSadaqahGoalKey(goalKey: string): boolean {
  return !!SADAQAH_TYPE_TO_UI_ID[goalKey] || !!UI_ID_TO_SADAQAH_TYPE[goalKey];
}

export function mapSadaqahGoalsFromApi(
  goals: SadaqahGoalApiItem[] | undefined | null,
): SadaqahGoalListItem[] {
  if (!Array.isArray(goals)) return [];

  return goals
    .map((goal) => {
      const uiId = SADAQAH_TYPE_TO_UI_ID[goal.sadaqahType];
      if (!uiId) return null;

      return {
        ...goal,
        id: uiId,
        isSelected: Boolean(goal.isActive),
        image: SADAQAH_TYPE_IMAGES[goal.sadaqahType],
      };
    })
    .filter(Boolean) as SadaqahGoalListItem[];
}

/** Pull ISO 4217 code from dropdown labels like "🇸🇦 SAR – Saudi Riyal (ر.س)" */
export function extractCurrencyCode(
  value: string | undefined | null,
  fallback = "SAR",
): string {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  const match = trimmed.match(/\b([A-Z]{3})\b/);
  return match?.[1] ?? fallback;
}
