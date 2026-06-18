import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import type { ProgressLogEntry } from "../types";
import DailyProgressLogging from "./DailyProgressLogging";
import QuranHoursLoggingFlow from "../flows/QuranHoursLoggingFlow";
import { SurahRecitationLoggingSection } from "./SurahRecitationLoggingSection";
import { CompletionRecitationLoggingSection } from "./CompletionRecitationLoggingSection";
import TahiyatUlWudhuLoggingFlow from "../flows/TahiyatUlWudhuLoggingFlow";
import MissedPrayersLoggingFlow from "../flows/MissedPrayersLoggingFlow";
import TahiyatAlMasjidLoggingFlow from "../flows/TahiyatAlMasjidLoggingFlow";
import DuhaPrayerLoggingFlow from "../flows/DuhaPrayerLoggingFlow";
import TawbahPrayerLoggingFlow from "../flows/TawbahPrayerLoggingFlow";
import IstikharaPrayerLoggingFlow from "../flows/IstikharaPrayerLoggingFlow";
import ShukrPrayerLoggingFlow from "../flows/ShukrPrayerLoggingFlow";
import QiyamLoggingFlow from "../flows/QiyamLoggingFlow";
import SunnahRawatibLoggingFlow from "../flows/SunnahRawatibLoggingFlow";

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

  if (template === "quran-recitation") {
    return (
      <SurahRecitationLoggingSection
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "quran-completion") {
    return (
      <CompletionRecitationLoggingSection
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

  if (template === "duha-prayer") {
    return (
      <DuhaPrayerLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "tawbah-prayer") {
    return (
      <TawbahPrayerLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "istikhara-prayer") {
    return (
      <IstikharaPrayerLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "shukr-prayer") {
    return (
      <ShukrPrayerLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "qiyam-al-layl") {
    return (
      <QiyamLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "sunnah-rawatib") {
    return (
      <SunnahRawatibLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  return (
    <DailyProgressLogging goalData={goalData} onLogComplete={onLogComplete} />
  );
}
