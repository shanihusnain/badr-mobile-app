import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type TutorialViewKey =
  | "INTRO_VIDEO"
  | "VIEW_IBADAT_DETAILS"
  | "WEEK_IN_REVIEW"
  | "MONTHLY_PROGRESS"
  | (string & {});

export type TutorialTaskKey =
  | "PERSONALIZE_NOTIFICATIONS"
  | "SET_UP_JOURNAL"
  | "VIEW_IBADAT_DETAILS"
  | "WEEK_IN_REVIEW"
  | "MONTHLY_PROGRESS"
  | "FORGE_SUPPORT_TEAM"
  | "PREPARE_NEXT_CYCLE"
  | (string & {});

export type TutorialTask = {
  key: TutorialTaskKey;
  title: string;
  done: boolean;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
};

export type TutorialsData = {
  title: string;
  welcome: {
    title: string;
    message: string;
  };
  video: {
    key: TutorialViewKey;
    durationLabel: string;
    done: boolean;
    url?: string | null;
    thumbnailUrl?: string | null;
    imageUrl?: string | null;
  };
  progress: {
    completed: number;
    total: number;
    label: string;
  };
  tasks: TutorialTask[];
};

/** Keys accepted by POST /more/tutorials/:key/viewed */
export const TUTORIAL_VIEW_ONLY_KEYS = [
  "INTRO_VIDEO",
  "VIEW_IBADAT_DETAILS",
  "WEEK_IN_REVIEW",
  "MONTHLY_PROGRESS",
] as const;

export function isTutorialViewKey(key: string): key is TutorialViewKey {
  return (TUTORIAL_VIEW_ONLY_KEYS as readonly string[]).includes(key);
}

const getTutorials = async (): Promise<TutorialsData> => {
  const response = await api.get("api/more/tutorials");
  return response.data?.data;
};

export const useGetTutorials = () => {
  return useQuery({
    queryKey: ["tutorials"],
    queryFn: getTutorials,
  });
};
