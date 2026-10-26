import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type JournalBehaviorCategoryKey =
  | "ALL"
  | "RELIGIOUS_HABITS"
  | "PERSONAL_GROWTH"
  | "FAMILY_BONDS"
  | "SOCIAL_RESPONSIBILITY"
  | (string & {});

export type JournalBehaviorCategory = {
  key: JournalBehaviorCategoryKey;
  label: string;
  total: number;
  selectedCount: number;
};

export type JournalBehavior = {
  behaviorId: string;
  category: Exclude<JournalBehaviorCategoryKey, "ALL"> | string;
  categoryLabel: string;
  title: string;
  description: string;
  displayOrder: number;
  isSelected: boolean;
};

export type JournalBehaviorsData = {
  activeCategory: JournalBehaviorCategoryKey;
  categories: JournalBehaviorCategory[];
  behaviors: JournalBehavior[];
};

/** Maps a journal tab title to the API `category` query value. Omits for All. */
export function toJournalBehaviorCategoryParam(
  tabTitle: string,
): string | undefined {
  const normalized = tabTitle.trim().toUpperCase().replace(/\s+/g, "_");
  if (!normalized || normalized === "ALL") {
    return undefined;
  }
  return normalized;
}

const getJournalBehaviors = async (
  category?: string,
): Promise<JournalBehaviorsData> => {
  const response = await api.get("api/journal/behaviors", {
    params: category ? { category } : undefined,
  });

  return response.data?.data;
};

export const useGetJournalBehaviors = (category?: string) => {
  return useQuery({
    queryKey: ["journal-behaviors", category ?? "ALL"],
    queryFn: () => getJournalBehaviors(category),
  });
};
