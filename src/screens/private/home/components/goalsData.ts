import { Colors } from "@/constants/theme";
import { getSurahRecitationGoals } from "@/src/screens/private/goalprogressloggingscreen/quranRecitationSurahGoals";
import { getMemorisationAggregateProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationSurahGoals";
import { getHizbMemorisationAggregateProgress as getHizbMemorisationLiveProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationHizbGoals";
import { getJuzMemorisationAggregateProgress as getJuzMemorisationLiveProgress } from "@/src/screens/private/goalprogressloggingscreen/quranMemorisationJuzGoals";
import {
  getMissedRamadanFastCompletedCount,
  getMissedRamadanFastCompletionPercent,
  getMissedRamadanFastGoalTarget,
} from "@/src/screens/private/goalprogressloggingscreen/missedRamadanFastsData";

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
  | "quran-recitationBySurah-daily"
  | "quran-recitationBySurah-weekly"
  | "quran-recitationByCompletion"
  | "quran-recitationByJuz"
  | "quran-memorisationBySurah"
  | "quran-memorisationByHizb"
  | "quran-memorisationByJuz"
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
  target?: number | string;
  studyMaterial?: {
    id: number;
    thumbnail: string;
    type: "video" | "podcast" | "article";
    description: string;
  }[];
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
    title: "Tahiyyat Al-Masjid",
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

  "quran-recitationBySurah-daily": {
    id: "quran-recitationBySurah-daily",
    category: "QURAN",
    title: "Quran Recitation By Surah (Daily)",
    count: "32",
    label: "/140 recitations",
    percentage: "23%",
    progressColor: Colors.light.ringQuran,
    description: "Track daily surah recitation goals across a 28-day cycle.",
    previousProgress: "32/140 recitations completed",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
  },
  "quran-recitationBySurah-weekly": {
    id: "quran-recitationBySurah-weekly",
    category: "QURAN",
    title: "Quran Recitation By Surah (Weekly)",
    count: "5",
    label: "/12 recitations",
    percentage: "42%",
    progressColor: Colors.light.ringQuran,
    description:
      "Track weekly surah recitation goals across a 28-day cycle (4 weeks).",
    previousProgress: "5/12 recitations completed",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
  },
  "quran-recitationByCompletion": {
    id: "quran-recitationByCompletion",
    category: "QURAN",
    title: "Quran Recitation By Completion",
    count: "3",
    label: "/10 pages",
    percentage: "30%",
    progressColor: Colors.light.ringQuran,
    description:
      "Quran recitation by completion helps us focus on specific pages and improve our recitation skills.",
    previousProgress: "3/10 pages completed",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
  },
  "quran-recitationByJuz": {
    id: "quran-recitationByJuz",
    category: "QURAN",
    title: "Quran Recitation By Juz",
    count: "3",
    label: "/10 pages",
    percentage: "30%",
    progressColor: Colors.light.ringQuran,
    description:
      "Quran recitation by juz helps us focus on specific juzs and improve our recitation skills.",
    previousProgress: "3/10 juzs completed",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
  },

  "quran-memorisationBySurah": {
    id: "quran-memorisationBySurah",
    category: "QURAN",
    title: "Quran Memorisation By Surah",
    count: "77",
    label: "/4 surahs",
    percentage: "10%",
    progressColor: Colors.light.ringQuran,
    target: "4 Surahs",
    description:
      "Track cumulative surah memorisation progress across your long-term journey.",
    previousProgress: "77/782 ayahs memorized",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Techniques for memorising long surahs effectively",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "article",
        description: "How to review memorised portions consistently",
      },
    ],
  },

  "quran-memorisationByJuz": {
    id: "quran-memorisationByJuz",
    category: "QURAN",
    title: "Quran Memorisation By Juz",
    count: "77",
    label: "/4 juzs",
    percentage: "10%",
    progressColor: Colors.light.ringQuran,
    target: "4 Juzs",
    description:
      "Track cumulative juz memorisation progress across your long-term journey.",
    previousProgress: "77/782 ayahs memorized",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Techniques for memorising long juzs effectively",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "article",
        description: "How to review memorised portions consistently",
      },
    ],
  },
  "quran-memorisationByHizb": {
    id: "quran-memorisationByHizb",
    category: "QURAN",
    title: "Quran Memorisation By Hizb",
    count: "77",
    label: "/4 hizbs",
    percentage: "10%",
    progressColor: Colors.light.ringQuran,
    target: "4 Hizbs",
    description:
      "Track cumulative hizb memorisation progress across your long-term journey.",
    previousProgress: "77/782 ayahs memorized",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Techniques for memorising long hizbs effectively",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "article",
        description: "How to review memorised portions consistently",
      },
    ],
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
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
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
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
  },

  // Fasting Goals
  "fasting-ramadan": {
    id: "fasting-ramadan",
    category: "FASTING",
    title: "Missed Ramadan Fasts",
    count: "0",
    label: "/5 fasts",
    target: 5,
    percentage: "0%",
    progressColor: Colors.light.ringRamadan,
    description:
      "Make up missed Ramadan fasts at your own pace. Each completed fast brings you closer to fulfilling this obligation.",
    previousProgress: "0/5 makeup fasts completed",
    studyMaterial: [
      {
        id: 1,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "Exploring Scholarly Views on Making Up  Tajweed Lessons",
      },
      {
        id: 2,
        thumbnail: "https://via.placeholder.com/150",
        type: "podcast",
        description: "How to make up  with missed Khatm-e-Quran",
      },
      {
        id: 3,
        thumbnail: "https://via.placeholder.com/150",
        type: "video",
        description: "10 Ways to increase Your Dhikr with Omar  Sulieman",
      },
    ],
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

function getSurahMemorisationAggregateProgress() {
  const { totalMemorized, totalAyahs, percent } =
    getMemorisationAggregateProgress();

  return {
    totalMemorized,
    totalTarget: totalAyahs,
    percent,
  };
}

function getHizbMemorisationDisplayProgress() {
  const { totalMemorized, totalAyahs, percent } =
    getHizbMemorisationLiveProgress();

  return {
    totalMemorized,
    totalTarget: totalAyahs,
    percent,
  };
}

function getJuzMemorisationDisplayProgress() {
  const { totalMemorized, totalAyahs, percent } =
    getJuzMemorisationLiveProgress();

  return {
    totalMemorized,
    totalTarget: totalAyahs,
    percent,
  };
}

function getSurahRecitationAggregateProgress(frequency: "daily" | "weekly") {
  const goals = getSurahRecitationGoals().filter(
    (goal) => goal.frequency === frequency,
  );
  const totalCompleted = goals.reduce(
    (sum, goal) => sum + goal.loggedRecitations,
    0,
  );
  const totalTarget = goals.reduce((sum, goal) => sum + goal.cycleTotal, 0);
  const percent =
    totalTarget > 0
      ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100))
      : 0;

  return { totalCompleted, totalTarget, percent };
}

/**
 * Resolves live progress values for goals backed by logging mock data.
 */
export function resolveGoalDisplayData(goal: GoalData): GoalData {
  if (goal.id === "quran-memorisationBySurah") {
    const { totalMemorized, totalTarget, percent } =
      getSurahMemorisationAggregateProgress();

    return {
      ...goal,
      count: String(totalMemorized),
      label: `/${totalTarget} Surahs`,
      percentage: `${percent}%`,
      previousProgress: `${totalMemorized}/${totalTarget} ayahs memorized`,
    };
  }

  if (goal.id === "quran-memorisationByJuz") {
    const { totalMemorized, totalTarget, percent } =
      getJuzMemorisationDisplayProgress();

    return {
      ...goal,
      count: String(totalMemorized),
      label: `/${totalTarget} ayahs`,
      percentage: `${percent}%`,
      previousProgress: `${totalMemorized}/${totalTarget} ayahs memorized`,
    };
  }

  if (goal.id === "quran-memorisationByHizb") {
    const { totalMemorized, totalTarget, percent } =
      getHizbMemorisationDisplayProgress();

    return {
      ...goal,
      count: String(totalMemorized),
      label: `/${totalTarget} ayahs`,
      percentage: `${percent}%`,
      previousProgress: `${totalMemorized}/${totalTarget} ayahs memorized`,
    };
  }

  if (goal.id === "quran-recitationBySurah-daily") {
    const { totalCompleted, totalTarget, percent } =
      getSurahRecitationAggregateProgress("daily");

    return {
      ...goal,
      count: String(totalCompleted),
      label: `/${totalTarget} recitations`,
      percentage: `${percent}%`,
      previousProgress: `${totalCompleted}/${totalTarget} recitations completed`,
    };
  }

  if (goal.id === "quran-recitationBySurah-weekly") {
    const { totalCompleted, totalTarget, percent } =
      getSurahRecitationAggregateProgress("weekly");

    return {
      ...goal,
      count: String(totalCompleted),
      label: `/${totalTarget} recitations`,
      percentage: `${percent}%`,
      previousProgress: `${totalCompleted}/${totalTarget} recitations completed`,
    };
  }

  if (goal.id === "fasting-ramadan") {
    const completed = getMissedRamadanFastCompletedCount();
    const target = getMissedRamadanFastGoalTarget();
    const percent = getMissedRamadanFastCompletionPercent();

    return {
      ...goal,
      count: String(completed),
      label: `/${target} fasts`,
      target,
      percentage: `${percent}%`,
      progressColor: Colors.light.ringRamadan,
      previousProgress: `${completed}/${target} makeup fasts completed`,
    };
  }

  return goal;
}

export function getResolvedGoalById(goalId: GoalId): GoalData | null {
  const goal = getGoalById(goalId);
  if (!goal) return null;
  return resolveGoalDisplayData(goal);
}

/**
 * Get all goals for a specific category
 */
export const getGoalsByCategory = (
  category: "PRAYER" | "QURAN" | "FASTING" | "SADAQAH",
): GoalData[] => {
  return Object.values(GOALS_DATA).filter((goal) => goal.category === category);
};

export function getResolvedGoalsByCategory(
  category: "PRAYER" | "QURAN" | "FASTING" | "SADAQAH",
): GoalData[] {
  const goals = getGoalsByCategory(category).map(resolveGoalDisplayData);

  if (category !== "QURAN") {
    return goals;
  }

  const priority: GoalId[] = [
    "quran-recitationBySurah-daily",
    "quran-recitationBySurah-weekly",
    "quran-memorisationBySurah",
  ];

  return [...goals].sort((left, right) => {
    const leftIndex = priority.indexOf(left.id);
    const rightIndex = priority.indexOf(right.id);

    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}
