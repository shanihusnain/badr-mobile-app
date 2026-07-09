export type JournalFillingQuestion = {
  id: string;
  text: string;
};

export type JournalFillingSection = {
  id: string;
  title: string;
  questions: JournalFillingQuestion[];
};

export const JOURNAL_FILLING_SECTIONS: JournalFillingSection[] = [
  {
    id: "religious-habits",
    title: "Religious Habits",
    questions: [
      {
        id: "rh-1",
        text: "Did I perform five daily prayers on time?",
      },
      {
        id: "rh-2",
        text: "After returning from work, did I pray Dhuhr, Asr, and Maghrib as soon as I got home?",
      },
      {
        id: "rh-3",
        text: "Did I renew my wudhu after breaking it to maintain a state of purity?",
      },
      {
        id: "rh-4",
        text: "Did I read Quran today, even if only a few verses?",
      },
      {
        id: "rh-5",
        text: "Did I make dhikr after my prayers?",
      },
    ],
  },
  {
    id: "personal-growth",
    title: "Personal Growth",
    questions: [
      {
        id: "pg-1",
        text: "Did I exercise today?",
      },
      {
        id: "pg-2",
        text: "Did I start or finish a book today?",
      },
      {
        id: "pg-3",
        text: "Did I handle a difficult situation well today?",
      },
      {
        id: "pg-4",
        text: "Did I learn something new that helps me grow?",
      },
      {
        id: "pg-5",
        text: "Did I stay patient when I felt frustrated?",
      },
    ],
  },
  {
    id: "family",
    title: "Family",
    questions: [
      {
        id: "fm-1",
        text: "Did I spend quality time with my family today?",
      },
      {
        id: "fm-2",
        text: "Did I call or message a family member to check in?",
      },
      {
        id: "fm-3",
        text: "Did I listen attentively when a family member spoke to me?",
      },
      {
        id: "fm-4",
        text: "Did I help with household responsibilities today?",
      },
    ],
  },
  {
    id: "social-responsibility",
    title: "Social Responsibility",
    questions: [
      {
        id: "sr-1",
        text: "Did I help someone in need today?",
      },
      {
        id: "sr-2",
        text: "Did I volunteer or contribute to my community?",
      },
      {
        id: "sr-3",
        text: "Did I speak kindly to others, even when it was hard?",
      },
      {
        id: "sr-4",
        text: "Did I avoid gossip or harmful speech today?",
      },
    ],
  },
];

export function getAllJournalQuestionIds(): string[] {
  return JOURNAL_FILLING_SECTIONS.flatMap((section) =>
    section.questions.map((question) => question.id),
  );
}

export async function fetchJournalFillingSections(): Promise<
  JournalFillingSection[]
> {
  return JOURNAL_FILLING_SECTIONS;
}
