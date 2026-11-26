import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export type HelpCentreQuestion = {
  question: string;
  answer: string;
  bold: string[];
};

export type HelpCentreData = {
  title: string;
  searchTitle: string;
  searchPlaceholder: string;
  commonQuestionsTitle: string;
  questions: HelpCentreQuestion[];
  browseTitle: string;
  browseLabel: string;
  stillNeedHelpTitle: string;
  chatButton: string;
};

const getHelpCentre = async (): Promise<HelpCentreData> => {
  const response = await api.get("api/more/help-centre");
  return response.data?.data;
};

export const useGetHelpCentre = () => {
  return useQuery({
    queryKey: ["help-centre"],
    queryFn: getHelpCentre,
  });
};

/** Split `answer` so each phrase in `bold` renders with emphasis (longest match first). */
export function splitAnswerWithBold(
  answer: string,
  bold: string[] | null | undefined,
): Array<{ text: string; bold: boolean }> {
  const phrases = (bold ?? [])
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!answer || phrases.length === 0) {
    return [{ text: answer ?? "", bold: false }];
  }

  const escaped = phrases.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = answer.split(regex).filter((part) => part.length > 0);
  const boldSet = new Set(phrases);

  return parts.map((part) => ({
    text: part,
    bold: boldSet.has(part),
  }));
}
