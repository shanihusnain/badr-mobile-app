import type {
  JournalDayBehaviorStatus,
  JournalDayData,
} from "@/src/api/queries/useGetJournalDay";
import type { JournalDayEntryUpdate } from "@/src/api/mutations/useUpdateJournalDay";
import type { JournalFillingSection } from "./journalFillingQuestions";
import type { JournalAnswerValue, JournalDraftState } from "./types";

export function mapJournalDayStatusToAnswer(
  status: JournalDayBehaviorStatus,
): JournalAnswerValue {
  if (status === "COMPLETED") return true;
  if (status === "INCOMPLETE") return false;
  return null;
}

export function mapAnswerToJournalDayStatus(
  answer: JournalAnswerValue,
): "COMPLETED" | "INCOMPLETE" | null {
  if (answer === true) return "COMPLETED";
  if (answer === false) return "INCOMPLETE";
  return null;
}

export function mapJournalDayToSections(
  data: JournalDayData,
): JournalFillingSection[] {
  return (data.categories ?? []).map((category) => ({
    id: category.key,
    title: category.label,
    questions: (category.behaviors ?? []).map((behavior) => ({
      id: behavior.behaviorId,
      text: behavior.description,
    })),
  }));
}

export function mapJournalDayToDraft(data: JournalDayData): JournalDraftState {
  const answers: Record<string, JournalAnswerValue> = {};

  for (const category of data.categories ?? []) {
    for (const behavior of category.behaviors ?? []) {
      answers[behavior.behaviorId] = mapJournalDayStatusToAnswer(
        behavior.status,
      );
    }
  }

  return {
    answers,
    notes: data.note ?? "",
  };
}

export function draftToJournalDayEntries(
  answers: Record<string, JournalAnswerValue>,
): JournalDayEntryUpdate[] {
  const entries: JournalDayEntryUpdate[] = [];

  for (const [behaviorId, answer] of Object.entries(answers)) {
    const status = mapAnswerToJournalDayStatus(answer);
    if (status) {
      entries.push({ behaviorId, status });
    }
  }

  return entries;
}
