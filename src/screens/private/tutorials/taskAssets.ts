import type { ImageSourcePropType } from "react-native";
import {
  BeforeJournalCustomization,
  hometabcard,
  tawbahprayerbottomsheetimage,
  tutorialForgeSupportTeam,
  tutorialMonthlyProgress,
  tutorialPersonalizeNotifications,
  tutorialPrepareGoalCycle,
  tutorialSetupJournal,
} from "@/assets/images";
import type { TutorialTaskKey } from "@/src/api/queries/useGetTutorials";

/**
 * Figma card exports that already include title typography in the image.
 * VIEW_IBADAT_DETAILS uses a photo background + overlaid title instead.
 * Chart cards (week/month) are drawn with TutorialChartCard so bg colors match.
 */
export const TUTORIAL_TASKS_WITH_BAKED_TITLE = new Set<string>([
  "PERSONALIZE_NOTIFICATIONS",
  "SET_UP_JOURNAL",
  "FORGE_SUPPORT_TEAM",
  "PREPARE_NEXT_CYCLE",
]);

/** Chart-style cards use a taller Figma frame (343×226). */
export const TUTORIAL_CHART_KEYS = new Set<string>([
  "WEEK_IN_REVIEW",
  "MONTHLY_PROGRESS",
]);

/** Rendered with SVG so week/month share the same card background. */
export const TUTORIAL_SVG_CHART_KEYS = new Set<string>([
  "WEEK_IN_REVIEW",
  "MONTHLY_PROGRESS",
]);

/** Local art — prefer API imageUrl when present. */
export const TUTORIAL_TASK_FALLBACK_IMAGE: Partial<
  Record<TutorialTaskKey, ImageSourcePropType>
> = {
  PERSONALIZE_NOTIFICATIONS: tutorialPersonalizeNotifications,
  SET_UP_JOURNAL: tutorialSetupJournal,
  VIEW_IBADAT_DETAILS: tawbahprayerbottomsheetimage,
  MONTHLY_PROGRESS: tutorialMonthlyProgress,
  FORGE_SUPPORT_TEAM: tutorialForgeSupportTeam,
  PREPARE_NEXT_CYCLE: tutorialPrepareGoalCycle,
};

export const TUTORIAL_VIDEO_FALLBACK_IMAGE: ImageSourcePropType = hometabcard;

export function resolveTaskImage(
  key: string,
  remoteUrl?: string | null,
): ImageSourcePropType | { uri: string } | null {
  // Prefer designed local cards (full-bleed photo + title) when available —
  // API imageUrl is often a raw photo that leaves grey padding in the card.
  const local = TUTORIAL_TASK_FALLBACK_IMAGE[key as TutorialTaskKey];
  if (local) return local;
  const trimmed = remoteUrl?.trim();
  if (trimmed) return { uri: trimmed };
  return BeforeJournalCustomization;
}

export function resolveVideoThumbnail(
  remoteUrl?: string | null,
): ImageSourcePropType | { uri: string } {
  const trimmed = remoteUrl?.trim();
  if (trimmed) return { uri: trimmed };
  return TUTORIAL_VIDEO_FALLBACK_IMAGE;
}

export function chartSeriesForKey(key: string): {
  primary: number[];
  secondary: number[];
  primaryColor: string;
  secondaryColor: string;
} {
  if (key === "MONTHLY_PROGRESS") {
    return {
      primary: [28, 34, 48, 40, 30, 28, 36],
      secondary: [18, 14, 16, 46, 12, 10, 8],
      primaryColor: "#4DA3FF",
      secondaryColor: "#E85D33",
    };
  }
  return {
    primary: [28, 34, 48, 40, 30, 28, 36],
    secondary: [18, 14, 16, 46, 12, 10, 8],
    primaryColor: "#4DA3FF",
    secondaryColor: "#F5C518",
  };
}
