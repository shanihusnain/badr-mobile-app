import { useQuery } from "@tanstack/react-query";
import { api } from "..";
import { resolveFastingType } from "@/src/utils/fastingGoalMap";

export type FastingLogWizardMode =
  | "PLANNED_DATE"
  | "EARLIER_THAN_PLANNED"
  | "MAKE_UP"
  | string;

export type FastingLogWizardDay = {
  date: string;
  available: boolean;
};

export type FastingLogWizardStepField =
  | "date"
  | "plannedDate"
  | "time"
  | string;

export type FastingLogWizardStep = {
  field: FastingLogWizardStepField;
  title: string;
  days?: FastingLogWizardDay[];
};

export type FastingLogWizardOption = {
  mode: FastingLogWizardMode;
  enabled: boolean;
  label: string;
  hint: string;
  steps: FastingLogWizardStep[];
};

export type FastingLogWizardData = {
  fastingType: string;
  options: FastingLogWizardOption[];
};

export type FastingUiLogType =
  | "completed_planned"
  | "completed_early"
  | "made_up_skipped";

export const fastingGoalLogWizardQueryKey = (fastingType: string) =>
  ["fasting-goal-log-wizard", fastingType] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeDay(raw: unknown): FastingLogWizardDay | null {
  const row = asRecord(raw);
  if (!row || typeof row.date !== "string" || !row.date) return null;
  return {
    date: row.date.slice(0, 10),
    available: row.available !== false,
  };
}

function normalizeStep(raw: unknown): FastingLogWizardStep | null {
  const row = asRecord(raw);
  if (!row || typeof row.field !== "string") return null;
  const daysRaw = Array.isArray(row.days) ? row.days : [];
  return {
    field: row.field,
    title: typeof row.title === "string" ? row.title : "",
    days: daysRaw
      .map(normalizeDay)
      .filter((day): day is FastingLogWizardDay => day != null),
  };
}

function normalizeOption(raw: unknown): FastingLogWizardOption | null {
  const row = asRecord(raw);
  if (!row || typeof row.mode !== "string") return null;
  const stepsRaw = Array.isArray(row.steps) ? row.steps : [];
  return {
    mode: row.mode,
    enabled: row.enabled !== false,
    label: typeof row.label === "string" ? row.label : row.mode,
    hint: typeof row.hint === "string" ? row.hint : "",
    steps: stepsRaw
      .map(normalizeStep)
      .filter((step): step is FastingLogWizardStep => step != null),
  };
}

export function normalizeFastingLogWizardResponse(
  axiosData: unknown,
): FastingLogWizardData | null {
  const root = asRecord(axiosData);
  const payload = asRecord(root?.data) ?? root;
  if (!payload) return null;
  const optionsRaw = Array.isArray(payload.options) ? payload.options : [];
  return {
    fastingType:
      typeof payload.fastingType === "string" ? payload.fastingType : "",
    options: optionsRaw
      .map(normalizeOption)
      .filter((option): option is FastingLogWizardOption => option != null),
  };
}

export function mapWizardModeToUiLogType(
  mode: FastingLogWizardMode,
): FastingUiLogType | null {
  switch (mode) {
    case "PLANNED_DATE":
      return "completed_planned";
    case "EARLIER_THAN_PLANNED":
      return "completed_early";
    case "MAKE_UP":
      return "made_up_skipped";
    default:
      return null;
  }
}

export function mapUiLogTypeToWizardMode(
  logType: FastingUiLogType,
): FastingLogWizardMode {
  switch (logType) {
    case "completed_planned":
      return "PLANNED_DATE";
    case "completed_early":
      return "EARLIER_THAN_PLANNED";
    case "made_up_skipped":
      return "MAKE_UP";
  }
}

/** Available (selectable) dates for a wizard step field. */
export function getWizardAvailableDates(
  option: FastingLogWizardOption | null | undefined,
  field: FastingLogWizardStepField,
): string[] {
  const step = option?.steps.find((item) => item.field === field);
  if (!step?.days?.length) return [];
  return step.days
    .filter((day) => day.available)
    .map((day) => day.date)
    .filter(Boolean)
    .sort();
}

export function getWizardStepTitle(
  option: FastingLogWizardOption | null | undefined,
  field: FastingLogWizardStepField,
): string | null {
  const title = option?.steps.find((item) => item.field === field)?.title;
  return title?.trim() ? title : null;
}

export const getFastingGoalLogWizard = async (
  fastingType: string,
): Promise<FastingLogWizardData | null> => {
  const response = await api.get(
    `api/goal-cycles/current/fasting-goals/${fastingType}/log-wizard`,
  );
  return normalizeFastingLogWizardResponse(response.data);
};

export const useGetFastingGoalLogWizard = (
  fastingTypeInput: string | null | undefined,
  options?: { enabled?: boolean },
) => {
  const fastingType = fastingTypeInput
    ? resolveFastingType(fastingTypeInput)
    : "";
  const enabled = !!fastingType && (options?.enabled ?? true);

  return useQuery({
    queryKey: fastingGoalLogWizardQueryKey(fastingType),
    queryFn: () => getFastingGoalLogWizard(fastingType),
    enabled,
  });
};
