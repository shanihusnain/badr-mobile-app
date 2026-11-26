import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type CalendarViewSetting = "GREGORIAN" | "HIJRI" | (string & {});

/** Backend statusMode enum values (SCREAMING_SNAKE). */
export type StatusModeSetting =
  | "EVERYDAY_LIFE"
  | "FEELING_SICK"
  | "MENSTRUATING"
  | "TRAVELING"
  | "PREGNANT"
  | "JUST_GAVE_BIRTH"
  | "GRIEVING_A_LOSS"
  | "PREPARING_FOR_EXAMS"
  | "EXPERIENCING_WORK_OVERLOAD"
  | "COPING_WITH_FINANCIAL_CHALLENGES"
  | (string & {});

export type AppSettings = {
  calendarView: CalendarViewSetting;
  aiMemoryEnabled: boolean;
  journalEnabled: boolean;
  dailyGoalSummary: boolean;
  missedCheckIns: boolean;
  countdownAlert: boolean;
  journalingReminder: boolean;
  statusInsightsEnabled: boolean;
  statusMode: StatusModeSetting;
  hideFiveDailyPrayers: boolean;
  hideFastingCalendar: boolean;
  hideTimeSpent: boolean;
  receiveTeamInvitation: boolean;
};

export type AppSettingsPatch = Partial<AppSettings>;

const getSettings = async (): Promise<AppSettings> => {
  const response = await api.get("api/settings");
  return response.data?.data;
};

export const useGetSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
};

/** UI slug (`everyday_life`) ↔ API (`EVERYDAY_LIFE`). */
export function statusModeToApi(uiId: string): StatusModeSetting {
  return uiId.trim().toUpperCase().replace(/-/g, "_") as StatusModeSetting;
}

export function statusModeToUi(apiValue: string | null | undefined): string {
  return String(apiValue ?? "EVERYDAY_LIFE")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

export function calendarViewToApi(
  ui: "gregorian" | "hijri",
): CalendarViewSetting {
  return ui === "hijri" ? "HIJRI" : "GREGORIAN";
}

export function calendarViewToUi(
  apiValue: string | null | undefined,
): "gregorian" | "hijri" {
  return String(apiValue ?? "GREGORIAN").toUpperCase() === "HIJRI"
    ? "hijri"
    : "gregorian";
}
