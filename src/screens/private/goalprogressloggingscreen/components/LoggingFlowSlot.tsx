import React from "react";
import { GoalData } from "../../home/components/goalsData";
import { getLoggingFlowTemplate } from "../loggingFlowRegistry";
import type { ProgressLogEntry } from "../types";
import DailyProgressLogging from "./DailyProgressLogging";
import QuranHoursLoggingFlow from "../flows/QuranHoursLoggingFlow";
import { SurahRecitationLoggingSection } from "./SurahRecitationLoggingSection";
import { SurahMemorisationLoggingSection } from "./SurahMemorisationLoggingSection";
import { HizbMemorisationLoggingSection } from "./HizbMemorisationLoggingSection";
import { JuzMemorisationLoggingSection } from "./JuzMemorisationLoggingSection";
import { isHizbMemorisationGoalId } from "../quranMemorisationHizbTarget";
import { isJuzMemorisationGoalId } from "../quranMemorisationJuzTarget";
import { isSurahMemorisationGoalId } from "../quranMemorisationTarget";
import { CompletionRecitationLoggingSection } from "./CompletionRecitationLoggingSection";
import { JuzRecitationLoggingSection } from "./JuzRecitationLoggingSection";
import TahiyatUlWudhuLoggingFlow from "../flows/TahiyatUlWudhuLoggingFlow";
import MissedPrayersLoggingFlow from "../flows/MissedPrayersLoggingFlow";
import TahiyatAlMasjidLoggingFlow from "../flows/TahiyatAlMasjidLoggingFlow";
import DuhaPrayerLoggingFlow from "../flows/DuhaPrayerLoggingFlow";
import TawbahPrayerLoggingFlow from "../flows/TawbahPrayerLoggingFlow";
import IstikharaPrayerLoggingFlow from "../flows/IstikharaPrayerLoggingFlow";
import ShukrPrayerLoggingFlow from "../flows/ShukrPrayerLoggingFlow";
import QiyamLoggingFlow from "../flows/QiyamLoggingFlow";
import SunnahRawatibLoggingFlow from "../flows/SunnahRawatibLoggingFlow";
import MissedZakatLoggingFlow from "../flows/MissedZakatLoggingFlow";
import MissedRamadanFastsLoggingFlow from "../flows/MissedRamadanFastsLoggingFlow";
import MondayThursdayFastsLoggingFlow from "../flows/MondayThursdayFastsLoggingFlow";
import WhiteDaysFastsLoggingFlow from "../flows/WhiteDaysFastsLoggingFlow";

type Props = {
  goalData: GoalData;
  onLogComplete?: (entry: ProgressLogEntry) => void;
  onDropdownOpenChange?: (open: boolean) => void;
};

export function LoggingFlowSlot({
  goalData,
  onLogComplete,
  onDropdownOpenChange,
}: Props) {
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

  if (template === "quran-memorisation" && isJuzMemorisationGoalId(goalData.id)) {
    return (
      <JuzMemorisationLoggingSection
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "quran-memorisation" && isHizbMemorisationGoalId(goalData.id)) {
    return (
      <HizbMemorisationLoggingSection
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "quran-memorisation" && isSurahMemorisationGoalId(goalData.id)) {
    return (
      <SurahMemorisationLoggingSection
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

  if (template === "quran-juz") {
    return (
      <JuzRecitationLoggingSection
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
      <DuhaPrayerLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "tawbah-prayer") {
    return (
      <TawbahPrayerLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "istikhara-prayer") {
    return (
      <IstikharaPrayerLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "shukr-prayer") {
    return (
      <ShukrPrayerLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "qiyam-al-layl") {
    return (
      <QiyamLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  if (template === "sunnah-rawatib") {
    return (
      <SunnahRawatibLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
      />
    );
  }

  if (template === "missed-ramadan-fasts") {
    return (
      <MissedRamadanFastsLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
        onDropdownOpenChange={onDropdownOpenChange}
      />
    );
  }

  if (template === "monday-thursday-fasts") {
    return (
      <MondayThursdayFastsLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
        onDropdownOpenChange={onDropdownOpenChange}
      />
    );
  }

  if (template === "white-days-fasts") {
    return (
      <WhiteDaysFastsLoggingFlow
        goalData={goalData}
        onLogComplete={onLogComplete}
        onDropdownOpenChange={onDropdownOpenChange}
      />
    );
  }

  if (template === "missed-zakat") {
    return (
      <MissedZakatLoggingFlow goalData={goalData} onLogComplete={onLogComplete} />
    );
  }

  return (
    <DailyProgressLogging goalData={goalData} onLogComplete={onLogComplete} />
  );
}
