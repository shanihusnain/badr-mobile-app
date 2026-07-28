import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import {
  mapHizbOptionsFromReference,
  mapSurahOptionsFromReference,
  type QuranHizbOption,
  type QuranSurahOption,
} from "@/src/utils/quranGoalMap";

const getQuranSurahs = async (): Promise<QuranSurahOption[]> => {
  const response = await api.get("api/quran-reference/surahs");
  return mapSurahOptionsFromReference(response.data?.data ?? []);
};

const getQuranHizb = async (): Promise<QuranHizbOption[]> => {
  const response = await api.get("api/quran-reference/hizb");
  return mapHizbOptionsFromReference(response.data?.data ?? []);
};

export const useGetQuranSurahs = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["quran-reference-surahs"],
    queryFn: getQuranSurahs,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60,
  });
};

export const useGetQuranHizb = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["quran-reference-hizb"],
    queryFn: getQuranHizb,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60,
  });
};
