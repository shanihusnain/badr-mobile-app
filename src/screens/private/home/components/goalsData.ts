import { Colors } from "@/constants/theme";

export type GoalId =
  | "prayer-tahiyyat"
  | "prayer-tahiyyatMasjid"
  | "prayer-tawbah"
  | "prayer-istikhara"
  | "prayer-shukr"
  | "prayer-sunnah"
  | "prayer-duha"
  | "prayer-qiyam"
  | "prayer-missed"
  | "prayer-fiveDailyPrayers"
  | "quran-recitation"
  | "quran-memorisation"
  | "quran-listening"
  | "quran-Tajweed"
  | "fasting-ramadan"
  | "fasting-whiteDays"
  | "fasting-mondayThursday"
  | "fasting-Dawwod"
  | "sadaqah-jariyah"
  | "sadaqah-daily"
  | "sadaqah-zakat"
  | "sadaqah-kafarah"
  | "sadaqah-fidya"
  | "sadaqah-Lillah"
  | "sadaqah-volunteering";

export interface GoalData {
  id: GoalId;
  category: "PRAYER" | "QURAN" | "FASTING" | "SADAQAH";
  title: string;
  count: string;
  label: string;
  percentage: string;
  progressColor: string;
  titleFontSize?: number;
  description: string;
  previousProgress: string;
}

export const GOALS_DATA: Record<GoalId, GoalData> = {
  // Prayer Goals
  "prayer-tahiyyat": {
    id: "prayer-tahiyyat",
    category: "PRAYER",
    title: "Tahiyyat Al-Wudhu",
    count: "10",
    label: "/25 prayers",
    percentage: "40%",
    progressColor: Colors.light.ringPrayer,
    titleFontSize: 15,
    description:
      "Tahiyyat Al-Wudhu is the two Rak'ahs prayer performed after ablution (Wudhu). It is a recommended Sunnah that keeps the heart fresh and connected to Allah.",
    previousProgress: "10/25 prayers completed",
  },
  "prayer-tahiyyatMasjid": {
    id: "prayer-tahiyyatMasjid",
    category: "PRAYER",
    title: "Tahiyyat Al-Masjid\nPrayer",
    count: "12",
    label: "/47 prayers",
    percentage: "25%",
    progressColor: Colors.light.ringPrayer,
    titleFontSize: 15,
    description:
      "Tahiyyat Al-Masjid is a greeting prayer offered upon entering a mosque. It honors the sanctity of the sacred space.",
    previousProgress: "12/47 prayers completed",
  },
  "prayer-tawbah": {
    id: "prayer-tawbah",
    category: "PRAYER",
    title: "Tawbah Prayer",
    count: "4",
    label: "/10 prayers",
    percentage: "40%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Tawbah Prayer is the prayer of repentance offered when seeking forgiveness from Allah. It represents seeking divine mercy and turning back to the right path.",
    previousProgress: "4/10 prayers completed",
  },
  "prayer-istikhara": {
    id: "prayer-istikhara",
    category: "PRAYER",
    title: "Istikhara Prayer",
    count: "2",
    label: "/9 prayers",
    percentage: "22%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Istikhara is the prayer of seeking guidance from Allah before making important decisions. It helps us align our choices with Allah's wisdom.",
    previousProgress: "2/9 prayers completed",
  },
  "prayer-shukr": {
    id: "prayer-shukr",
    category: "PRAYER",
    title: "Shukr Prayer",
    count: "3",
    label: "/8 prayers",
    percentage: "37%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Shukr Prayer is offered to express gratitude to Allah for His blessings. Gratitude purifies the heart and attracts more divine blessings.",
    previousProgress: "3/8 prayers completed",
  },
  "prayer-sunnah": {
    id: "prayer-sunnah",
    category: "PRAYER",
    title: "Sunnah Rawatib",
    count: "5",
    label: "/12 prayers",
    percentage: "42%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Sunnah Rawatib are the regular Sunnah prayers performed with the five daily obligatory prayers. They strengthen our connection to the Sunnah.",
    previousProgress: "5/12 prayers completed",
  },
  "prayer-duha": {
    id: "prayer-duha",
    category: "PRAYER",
    title: "Duha Prayer",
    count: "11",
    label: "/22 prayers",
    percentage: "50%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Duha Prayer is performed in the morning after sunrise. It brings ease and opens doors of blessing throughout the day.",
    previousProgress: "11/22 prayers completed",
  },
  "prayer-qiyam": {
    id: "prayer-qiyam",
    category: "PRAYER",
    title: "Qiyam Al-Layl",
    count: "3",
    label: "/10 prayers",
    percentage: "30%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Qiyam Al-Layl is the night prayer performed in the latter part of the night. It brings the soul closer to Allah and fills the heart with tranquility.",
    previousProgress: "3/10 prayers completed",
  },
  "prayer-missed": {
    id: "prayer-missed",
    category: "PRAYER",
    title: "Missed Past Prayers",
    count: "2",
    label: "/17 prayers",
    percentage: "12%",
    progressColor: Colors.light.ringPrayer,
    description:
      "Making up missed obligatory prayers is a duty that helps us fulfill our religious obligations and maintain our connection with Allah.",
    previousProgress: "2/17 prayers completed",
  },
  "prayer-fiveDailyPrayers": {
    id: "prayer-fiveDailyPrayers",
    category: "PRAYER",
    title: "The Five Daily\nPrayers",
    count: "3",
    label: "/28 days",
    percentage: "11%",
    progressColor: Colors.light.ringPrayer,
    titleFontSize: 14.5,
    description:
      "The five daily prayers are the foundation of Islamic practice. They connect us to Allah five times a day and structure our entire day.",
    previousProgress: "3/28 days completed",
  },

  // Quran Goals
  "quran-recitation": {
    id: "quran-recitation",
    category: "QURAN",
    title: "Quran Recitation",
    count: "3",
    label: "/10 pages",
    percentage: "30%",
    progressColor: Colors.light.ringQuran,
    description:
      "Regular Quran recitation keeps the Quran alive in our hearts. Each recitation is a dialogue with the Divine Word.",
    previousProgress: "3/10 pages completed",
  },
  "quran-memorisation": {
    id: "quran-memorisation",
    category: "QURAN",
    title: "Quran Memorisation",
    count: "1",
    label: "/5 pages",
    percentage: "20%",
    progressColor: Colors.light.ringQuran,
    description:
      "Memorizing the Quran is a noble act that preserves the Word of Allah in the heart and mind for a lifetime.",
    previousProgress: "1/5 pages completed",
  },
  "quran-listening": {
    id: "quran-listening",
    category: "QURAN",
    title: "Quran Listening",
    count: "9",
    label: "/60 hours",
    percentage: "15%",
    progressColor: Colors.light.ringQuran,
    description:
      "Listening to the Quran allows us to absorb its meanings and feel the beauty of the Divine Word deeply.",
    previousProgress: "9/60 hours completed",
  },
  "quran-Tajweed": {
    id: "quran-Tajweed",
    category: "QURAN",
    title: "Quran Tajweed",
    count: "9",
    label: "/60 hours",
    percentage: "15%",
    progressColor: Colors.light.ringQuran,
    description:
      "Tajweed perfects Quranic recitation as revealed to the Prophet (PBUH), preserving its authentic pronunciation and rhythm.",
    previousProgress: "9/60 hours completed",
  },

  // Fasting Goals
  "fasting-ramadan": {
    id: "fasting-ramadan",
    category: "FASTING",
    title: "Ramadan Fasts",
    count: "20",
    label: "/30 days",
    percentage: "67%",
    progressColor: Colors.light.green,
    description:
      "Ramadan fasting is a pillar of Islam that purifies the soul, builds discipline, and increases empathy for the needy.",
    previousProgress: "20/30 days fasted",
  },
  "fasting-whiteDays": {
    id: "fasting-whiteDays",
    category: "FASTING",
    title: "White Days Fasts",
    count: "2",
    label: "/3 days",
    percentage: "67%",
    progressColor: Colors.light.green,
    description:
      "The white days (13th, 14th, 15th) are blessed days for fasting and spiritual practice throughout the Islamic year.",
    previousProgress: "2/3 days fasted",
  },
  "fasting-mondayThursday": {
    id: "fasting-mondayThursday",
    category: "FASTING",
    title: "Monday & Thursday\nFasts",
    count: "3",
    label: "/8 days",
    percentage: "38%",
    progressColor: Colors.light.green,
    description:
      "The Prophet Muhammad (PBUH) encouraged fasting on Mondays and Thursdays as these are days when deeds are presented to Allah.",
    previousProgress: "3/8 days fasted",
  },
  "fasting-Dawwod": {
    id: "fasting-Dawwod",
    category: "FASTING",
    title: "Prophet Dawwod(AS)\nFasts",
    count: "13",
    label: "/14 days",
    percentage: "93%",
    progressColor: Colors.light.green,
    description:
      "The Prophet Dawwod (AS) fasted every other day, maintaining a perfect balance between worship and worldly life.",
    previousProgress: "13/14 days fasted",
  },

  // Sadaqah Goals
  "sadaqah-jariyah": {
    id: "sadaqah-jariyah",
    category: "SADAQAH",
    title: "Sadaqah Jariyah",
    count: "$200",
    label: "/$1000",
    percentage: "20%",
    progressColor: Colors.light.ringSadaqah,
    description:
      "Sadaqah Jariyah (ongoing charity) continues to benefit others and brings continuous rewards even after we pass away.",
    previousProgress: "$200/$1000 donated",
  },
  "sadaqah-daily": {
    id: "sadaqah-daily",
    category: "SADAQAH",
    title: "Daily Charity",
    count: "12",
    label: "/28 days",
    percentage: "43%",
    progressColor: Colors.light.ringSadaqah,
    description:
      "Daily charity, even if small, purifies wealth and keeps our hearts connected to those in need.",
    previousProgress: "12/28 days with charity",
  },
  "sadaqah-zakat": {
    id: "sadaqah-zakat",
    category: "SADAQAH",
    title: "Missed zakat",
    count: "16",
    label: "/28 days",
    percentage: "60%",
    progressColor: Colors.light.ringSadaqah,
    description:
      "Zakat is one of the five pillars of Islam. Fulfilling zakat obligations purifies wealth and supports the community.",
    previousProgress: "16/28 days tracked",
  },
  "sadaqah-kafarah": {
    id: "sadaqah-kafarah",
    category: "SADAQAH",
    title: "Kaffarah for breaking\nFasts or Oaths",
    count: "1",
    label: "/2 days",
    percentage: "50%",
    progressColor: Colors.light.ringSadaqah,
    titleFontSize: 14,
    description:
      "Kaffarah serves as expiation for breaking fasts or oaths, demonstrating repentance and commitment to fulfilling obligations.",
    previousProgress: "1/2 kaffarah paid",
  },
  "sadaqah-fidya": {
    id: "sadaqah-fidya",
    category: "SADAQAH",
    title: "Fidya",
    count: "$12",
    label: "/$30",
    percentage: "44%",
    progressColor: Colors.light.ringSadaqah,
    description:
      "Fidya is compensation paid for not being able to fast due to illness or age, supporting those in need while fulfilling religious duty.",
    previousProgress: "$12/$30 paid",
  },
  "sadaqah-Lillah": {
    id: "sadaqah-Lillah",
    category: "SADAQAH",
    title: "Lillah Donation",
    count: "$50",
    label: "/$100",
    percentage: "50%",
    progressColor: Colors.light.ringSadaqah,
    description:
      "Lillah donation is given purely for the sake of Allah without expectation. It purifies intention and strengthens faith.",
    previousProgress: "$50/$100 donated",
  },
  "sadaqah-volunteering": {
    id: "sadaqah-volunteering",
    category: "SADAQAH",
    title: "Volunteering\nServices",
    count: "2",
    label: "/4",
    percentage: "50%",
    progressColor: Colors.light.ringQuran,
    description:
      "Volunteering time and skills is a form of sadaqah that directly benefits the community and demonstrates care.",
    previousProgress: "2/4 volunteer days completed",
  },
};

/**
 * Get goal data by ID
 */
export const getGoalById = (goalId: GoalId): GoalData | null => {
  return GOALS_DATA[goalId] || null;
};

/**
 * Get all goals for a specific category
 */
export const getGoalsByCategory = (
  category: "PRAYER" | "QURAN" | "FASTING" | "SADAQAH"
): GoalData[] => {
  return Object.values(GOALS_DATA).filter((goal) => goal.category === category);
};
