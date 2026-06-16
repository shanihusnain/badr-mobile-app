import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import type { ProgressLogEntry } from "../types";
import DailyProgressLogging from "./DailyProgressLogging";
import QuranHoursLoggingFlow from "../flows/QuranHoursLoggingFlow";
import TahiyatUlWudhuLoggingFlow from "../flows/TahiyatUlWudhuLoggingFlow";
import MissedPrayersLoggingFlow from "../flows/MissedPrayersLoggingFlow";
import TahiyatAlMasjidLoggingFlow from "../flows/TahiyatAlMasjidLoggingFlow";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
};

export function LoggingFlowSlot({ goalData, onLogComplete }: Props) {
  const template = getLoggingFlowTemplate(goalData.id);

  if (template === "quran-hours") {
    return (
      <QuranHoursLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "tahiyat-ul-wudhu") {
    return (
      <TahiyatUlWudhuLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "missed-prayers") {
    return (
      <MissedPrayersLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "tahiyat-al-masjid") {
    return (
      <TahiyatAlMasjidLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  return (
    <DailyProgressLogging goalData={goalData} onLogComplete={onLogComplete} />
  );
}
