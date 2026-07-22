import type { ImageSourcePropType } from "react-native";
import {
  tahiyyatalwudhubottomsheetimage,
  missedpastprayerbottomsheetimage,
  tahiyyatalmasjidbottomsheetimage,
  sunnahrawatibbottomsheetimage,
  duhaprayerbottomsheetimage,
  tawbahprayerbottomsheetimage,
  istikharaprayerbottomsheetimage,
  shukarprayerbottomsheetimage,
  fivedailyprayerbottomsheetimage,
  qiyamallaylbottomsheetimage,
} from "@/assets/images";

/** Backend prayerType enum → local UI id (goalsData keys, selection panels) */
export const PRAYER_TYPE_TO_UI_ID: Record<string, string> = {
  TAHIYYAT_AL_WUDHU: "tahayyat-ul-wudhu",
  FIVE_DAILY_PRAYERS: "fiveDailyPrayers",
  SUNNAH_RAWATIB: "sunnahRawatib",
  TAHIYYAT_AL_MASJID: "thayyat-ul-masjid",
  MISSED_PAST_PRAYERS: "missedPastPrayers",
  DUHA: "duhaPrayer",
  TAWBAH: "tawbaPrayer",
  ISTIKHARA: "istikharah",
  SHUKR: "shukrPrayer",
  QIYAM_AL_LAYL: "qiyamalLail",
};

const PRAYER_TYPE_IMAGES: Record<string, ImageSourcePropType> = {
  TAHIYYAT_AL_WUDHU: tahiyyatalwudhubottomsheetimage,
  FIVE_DAILY_PRAYERS: fivedailyprayerbottomsheetimage,
  SUNNAH_RAWATIB: sunnahrawatibbottomsheetimage,
  TAHIYYAT_AL_MASJID: tahiyyatalmasjidbottomsheetimage,
  MISSED_PAST_PRAYERS: missedpastprayerbottomsheetimage,
  DUHA: duhaprayerbottomsheetimage,
  TAWBAH: tawbahprayerbottomsheetimage,
  ISTIKHARA: istikharaprayerbottomsheetimage,
  SHUKR: shukarprayerbottomsheetimage,
  QIYAM_AL_LAYL: qiyamallaylbottomsheetimage,
};

export type PrayerGoalApiItem = {
  prayerType: string;
  isActive: boolean;
  title?: string;
  description?: string;
  config?: Record<string, number | string | boolean>;
  base?: Record<string, unknown>;
  adjusted?: Record<string, unknown>;
};

export type PrayerGoalListItem = PrayerGoalApiItem & {
  id: string;
  isSelected: boolean;
  image?: ImageSourcePropType;
};

export function mapPrayerGoalsFromApi(
  goals: PrayerGoalApiItem[] | undefined | null,
): PrayerGoalListItem[] {
  if (!Array.isArray(goals)) return [];

  return goals
    .map((goal) => {
      const id = PRAYER_TYPE_TO_UI_ID[goal.prayerType];
      if (!id) return null;

      return {
        ...goal,
        id,
        isSelected: Boolean(goal.isActive),
        image: PRAYER_TYPE_IMAGES[goal.prayerType],
      };
    })
    .filter(Boolean) as PrayerGoalListItem[];
}
