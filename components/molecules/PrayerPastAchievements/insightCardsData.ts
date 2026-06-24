// Static insight card data for all prayer past achievement goals.
// Each entry is keyed by goalId, then by period ("monthly" | "threeMonths" | "sixMonths").

export type InsightCardData = {
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  iconName: string;
  title: string;
  value: string;
  subValue?: string;
  trendValue?: string;
  trendDirection?: "up" | "down";
  footerText?: string;
};

export type PeriodCardMap = {
  monthly: InsightCardData[];
  threeMonths: InsightCardData[];
  sixMonths: InsightCardData[];
};

export const PRAYER_INSIGHT_CARDS: Partial<Record<string, PeriodCardMap>> = {
  "prayer-qiyam": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "7", subValue: "active nights", trendValue: "1 night", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "cursor-pointer", title: "WITR PRAYED", value: "6", subValue: "of 7 nights", footerText: "Last Month: 4 of 6" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "2", subValue: "nights", trendValue: "5 nights", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "4", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "2", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "1h 12m", trendValue: "0h 20m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "21", subValue: "active nights", trendValue: "2 nights", trendDirection: "down" },
      { iconFamily: "MaterialCommunityIcons", iconName: "cursor-pointer", title: "WITR PRAYED", value: "18", subValue: "of 21 nights", footerText: "Last 3M: 64 of 70" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "8", subValue: "nights", trendValue: "1 night", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "3", subValue: "prayers", trendValue: "1 prayer", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "7", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "03h 5m", trendValue: "0h 20m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", trendValue: "2 months", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "64", subValue: "active nights", trendValue: "4 nights", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "cursor-pointer", title: "WITR PRAYED", value: "54", subValue: "of 64 nights", footerText: "Last 6M: 55 of 100" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "12", subValue: "nights", trendValue: "3 nights", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "23", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "6h 12m", trendValue: "0h 39m", trendDirection: "up" },
    ],
  },

  "prayer-shukr": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "15", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "3", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "3", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "5", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "1h 12m", trendValue: "0h 20m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "64", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "6", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "18", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "2h 10m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "158", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "20", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "3h 25m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-tawbah": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "5", subValue: "active days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "3", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "1", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 50m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "55", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "10", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "21", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "2h 6m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "102", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "7", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "3h 25m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-duha": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "15", subValue: "active days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "4", subValue: "prayers", trendValue: "2 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 20m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "55", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "10", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "8", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "1h 0m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "5", subValue: "months", trendValue: "2 months", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "140", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "7", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "1h 55m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-sunnah": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "28", subValue: "active days", footerText: "• 28 days" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "3", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "35", subValue: "prayers", trendValue: "10 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "4h 12m", trendValue: "0h 20m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "84", subValue: "active days", trendValue: "28 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "3 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "138", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "7h 12m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "168", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "196", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "8h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-tahiyyatMasjid": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "10", subValue: "active days", trendValue: "4 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "2 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "4", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "6", subValue: "prayers", footerText: "\u2022 6 prayers" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 56m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "\u2022 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "56", subValue: "active days", trendValue: "12 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "6", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "28", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "3h 12m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "\u2022 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "30", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "8h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-fiveDailyPrayers": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "28", subValue: "active days", footerText: "\u2022 28 days" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "3", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "mosque", title: "MOSQUE PRAYERS", value: "80", subValue: "prayers", trendValue: "10 prayers", trendDirection: "down" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "33", subValue: "prayers", trendValue: "2 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "3h 12m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "\u2022 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "84", subValue: "active days", trendValue: "28 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "mosque", title: "MOSQUE PRAYERS", value: "280", subValue: "days", trendValue: "20 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "138", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "7h 12m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "\u2022 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "168", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "mosque", title: "MOSQUE PRAYERS", value: "540", subValue: "days", trendValue: "12 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "540", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-missed": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "20", subValue: "active days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "restore", title: "PERIOD MADE-UP", value: "22", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "2", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "4", subValue: "prayers", trendValue: "2 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "1h 20m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "2", subValue: "months", trendValue: "1 month", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "45", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "restore", title: "PERIOD MADE-UP", value: "72", subValue: "days", trendValue: "17 days", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "6", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "4", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "5h 30m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "5", subValue: "months", trendValue: "1 month", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "restore", title: "PERIOD MADE-UP", value: "102", subValue: "days", trendValue: "12 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "6", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-tahiyyat": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "15", subValue: "active days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 20m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "\u2022 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "45", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "6", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "4", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 30m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "5", subValue: "months", trendValue: "2 months", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "6", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },

  "prayer-istikhara": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "10", subValue: "active days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "2", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "4", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "2", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 30m", trendValue: "0h 5m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "\u2022 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "56", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "10", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "12", subValue: "prayers", trendValue: "1 prayer", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "2h 10m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "\u2022 6 month" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "128", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "prayers", trendValue: "2 prayers", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "10", subValue: "prayers", trendValue: "3 prayers", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "3h 25m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
};
