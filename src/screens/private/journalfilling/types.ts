export type JournalAnswerValue = boolean | null;

export type JournalAnswer = {
  questionId: string;
  answer: JournalAnswerValue;
};

export type JournalEntry = {
  date: string;
  notes: string;
  answers: JournalAnswer[];
  updatedAt: string;
};

export type JournalDateCapsule = {
  date: string;
  weekdayLabel: string;
  dayOfMonth: number;
  isSelected: boolean;
  isToday: boolean;
  isCompleted: boolean;
};

export type JournalDraftState = {
  answers: Record<string, JournalAnswerValue>;
  notes: string;
};
