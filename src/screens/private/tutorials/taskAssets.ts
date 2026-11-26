import type { ImageSourcePropType } from "react-native";
import {
  BeforeJournalCustomization,
  hometabcard,
  tutorialForgeSupportTeam,
  tutorialMonthlyProgress,
  tutorialPersonalizeNotifications,
  tutorialPrepareGoalCycle,
  tutorialSetupJournal,
  tutorialViewIbadat,
} from "@/assets/images";
import type { TutorialTaskKey } from "@/src/api/queries/useGetTutorials";

/** Figma card exports that already include title typography. */
export const TUTORIAL_TASKS_WITH_BAKED_TITLE = new Set<string>([
  "PERSONALIZE_NOTIFICATIONS",
  "SET_UP_JOURNAL",
  "VIEW_IBADAT_DETAILS",
  "MONTHLY_PROGRESS",
  "FORGE_SUPPORT_TEAM",
  "PREPARE_NEXT_CYCLE",
]);

/** Chart-style cards use a taller Figma frame (343×226). */
export const TUTORIAL_CHART_KEYS = new Set<string>([
  "WEEK_IN_REVIEW",
  "MONTHLY_PROGRESS",
]);

/** Rendered with SVG (avoids broken screenshot crops). */
export const TUTORIAL_SVG_CHART_KEYS = new Set<string>(["WEEK_IN_REVIEW"]);

/** Local art — prefer API imageUrl when present. */
export const TUTORIAL_TASK_FALLBACK_IMAGE: Partial<
  Record<TutorialTaskKey, ImageSourcePropType>
> = {
  PERSONALIZE_NOTIFICATIONS: tutorialPersonalizeNotifications,
  SET_UP_JOURNAL: tutorialSetupJournal,
  VIEW_IBADAT_DETAILS: tutorialViewIbadat,
  MONTHLY_PROGRESS: tutorialMonthlyProgress,
  FORGE_SUPPORT_TEAM: tutorialForgeSupportTeam,
  PREPARE_NEXT_CYCLE: tutorialPrepareGoalCycle,
};

export const TUTORIAL_VIDEO_FALLBACK_IMAGE: ImageSourcePropType = hometabcard;

export function resolveTaskImage(
  key: string,
  remoteUrl?: string | null,
): ImageSourcePropType | { uri: string } | null {
  const trimmed = remoteUrl?.trim();
  if (trimmed) return { uri: trimmed };
  return (
    TUTORIAL_TASK_FALLBACK_IMAGE[key as TutorialTaskKey] ??
    BeforeJournalCustomization
  );
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
