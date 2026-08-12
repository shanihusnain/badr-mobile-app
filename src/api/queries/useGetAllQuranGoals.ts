import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import {
  mapHizbOptionsFromReference,
  mapJuzOptionsFromReference,
  mapSurahOptionsFromReference,
  type QuranGoalApiItem,
  type QuranHizbOption,
  type QuranJuzOption,
  type QuranSurahOption,
} from "@/src/utils/quranGoalMap";

export type QuranGoalsReference = {
  surahs: QuranSurahOption[];
  juz: QuranJuzOption[];
  hizb: QuranHizbOption[];
};

export type AllQuranGoalsResponse = {
  goals: QuranGoalApiItem[];
  reference: QuranGoalsReference;
};

const EMPTY_REFERENCE: QuranGoalsReference = {
  surahs: [],
  juz: [],
  hizb: [],
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function extractGoals(value: unknown): QuranGoalApiItem[] {
  if (Array.isArray(value)) return value as QuranGoalApiItem[];
  const record = asRecord(value);
  if (!record) return [];
  if (Array.isArray(record.goals)) return record.goals as QuranGoalApiItem[];
  // Rare double-wrap: { data: { goals } }
  const nested = asRecord(record.data);
  if (Array.isArray(nested?.goals)) return nested.goals as QuranGoalApiItem[];
  if (Array.isArray(nested)) return nested as QuranGoalApiItem[];
  return [];
}

function extractReferenceRaw(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  if (!record) return {};
  const direct = asRecord(record.reference);
  if (direct) return direct;
  const nested = asRecord(record.data);
  const nestedRef = asRecord(nested?.reference);
  return nestedRef ?? {};
}

function mapReference(raw: Record<string, unknown>): QuranGoalsReference {
  try {
    const surahRows = (raw.surahs as unknown[]) ?? [];
    return {
      surahs: mapSurahOptionsFromReference(surahRows),
      juz: mapJuzOptionsFromReference((raw.juz as unknown[]) ?? [], surahRows),
      hizb: mapHizbOptionsFromReference((raw.hizb as unknown[]) ?? [], surahRows),
    };
  } catch (error) {
    console.error("[quran-goals] failed to map reference", error);
    return EMPTY_REFERENCE;
  }
}

/**
 * Normalize GET api/goal-cycles/current/quran-goals
 * Expected: { data: { goals: [...], reference: { surahs, juz, hizb } } }
 * Legacy:   { data: Goal[] }
 */
export function normalizeAllQuranGoalsResponse(
  axiosData: unknown,
): AllQuranGoalsResponse {
  const root = asRecord(axiosData);
  // Prefer envelope.data, else treat body as the payload itself
  const payload: unknown = root?.data ?? axiosData;

  if (Array.isArray(payload)) {
    return { goals: payload as QuranGoalApiItem[], reference: EMPTY_REFERENCE };
  }

  const goals = extractGoals(payload);
  const reference = mapReference(extractReferenceRaw(payload));

  return { goals, reference };
}

const getAllQuranGoals = async (): Promise<AllQuranGoalsResponse> => {
  const response = await api.get("api/goal-cycles/current/quran-goals");
  const normalized = normalizeAllQuranGoalsResponse(response.data);
  if (__DEV__) {
    console.log(
      "[quran-goals] goals:",
      normalized.goals.length,
      "surahs:",
      normalized.reference.surahs.length,
      "juz:",
      normalized.reference.juz.length,
      "hizb:",
      normalized.reference.hizb.length,
    );
  }
  return normalized;
};

export const useGetAllQuranGoals = ({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId?: string | null;
}) => {
  return useQuery({
    // v2: response is { goals, reference } (not a bare goals array)
    queryKey: ["all-quran-goals", "v2", userId ?? "anonymous"],
    queryFn: getAllQuranGoals,
    enabled,
    staleTime: 0,
  });
};
