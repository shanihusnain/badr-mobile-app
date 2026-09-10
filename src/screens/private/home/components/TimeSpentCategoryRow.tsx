import { TopSpace } from "@/components/atoms/TopSpace";
import { View, Text, type ViewStyle } from "react-native";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";
import type { CategoryRowData } from "../timeSpentData";
import { styles } from "../styles";

function getCategoryTranslationKey(label: string): string {
  const keyMap: Record<string, string> = {
    "Quran Listening": "homeScreen.timeSpentCategory_quran-listening",
    "Quran Recitation": "homeScreen.timeSpentCategory_quran-recitation",
    "Quran Memorization": "homeScreen.timeSpentCategory_quran-memorization",
    "Quran Tajweed": "homeScreen.timeSpentCategory_quran-tajweed",
    "Missed Ramadan Fasts": "homeScreen.timeSpentCategory_missed-ramadan-fasts",
    "The Fast of Prophet Dawud (AS)": "homeScreen.timeSpentCategory_the-fast-of-prophet-dawud-as",
    "Mondays & Thursdays": "homeScreen.timeSpentCategory_mondays-thursdays",
    "The White Days": "homeScreen.timeSpentCategory_the-white-days",
    "Sunnah Rawatib": "homeScreen.timeSpentCategory_sunnah-rawatib",
    "Qiyam Al-Layl": "homeScreen.timeSpentCategory_qiyam-al-layl",
    "Missed Fard Prayers": "homeScreen.timeSpentCategory_missed-fard-prayers",
    "The 5 Daily Prayers": "homeScreen.timeSpentCategory_the-5-daily-prayers",
    "Prayer of Wudhu": "homeScreen.timeSpentCategory_prayer-of-wudhu",
    "Congregational Prayer in Mosque": "homeScreen.timeSpentCategory_congregational-prayer-in-mosque",
    "Duha Prayer": "homeScreen.timeSpentCategory_duha-prayer",
    "Tasbih Prayer": "homeScreen.timeSpentCategory_tasbih-prayer",
    "Ishraq Prayer": "homeScreen.timeSpentCategory_ishraq-prayer",
    "Shukr Prayer": "homeScreen.timeSpentCategory_shukr-prayer",
    "Volunteering Services": "homeScreen.timeSpentCategory_volunteering-services",
    "Missed Zakat": "homeScreen.timeSpentCategory_missed-zakat",
    "Fidya": "homeScreen.timeSpentCategory_fidya",
    "Iftaar Donations": "homeScreen.timeSpentCategory_iftaar-donations",
    "Sadaqah for Parents": "homeScreen.timeSpentCategory_sadaqah-for-parents",
    "Donating to Mosques": "homeScreen.timeSpentCategory_donating-to-mosques",
    "Donating to Water Well Projects": "homeScreen.timeSpentCategory_donating-to-water-well-projects",
    "Kaffarah for Breaking Fasts or Oaths": "homeScreen.timeSpentCategory_kaffarah-for-breaking-fasts-or-oaths",
  };
  return keyMap[label] || label;
}

type Props = CategoryRowData;

export function TimeSpentCategoryRow({
  label,
  percent,
  timeLabel,
  progressPercent,
}: Props) {
  const { t } = useTypedTranslation();
  const clampedPercent = Math.min(100, Math.max(0, progressPercent));
  
  const translatedLabel = t(getCategoryTranslationKey(label) as any);

  return (
    <View>
      <View style={styles.timeSpentCategoryRowHeader}>
        <Text style={styles.timeSpentCategoryLabel}>
          {translatedLabel} ({percent}%)
        </Text>
        <View style={styles.timeSpentCategoryTimeBadge}>
          <Text style={styles.timeSpentCategoryTimeBadgeText}>{timeLabel}</Text>
        </View>
      </View>
      <TopSpace top={13} />
      <View style={styles.timeSpentCategoryProgressTrack}>
        <View
          style={[
            styles.timeSpentCategoryProgressFill,
            { width: `${clampedPercent}%` as ViewStyle["width"] },
          ]}
        />
      </View>
    </View>
  );
}
