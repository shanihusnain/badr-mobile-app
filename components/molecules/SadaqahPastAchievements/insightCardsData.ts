// Static insight card data for all sadaqah past achievement goals.
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

export const SADAQAH_INSIGHT_CARDS: Partial<Record<string, PeriodCardMap>> = {
  "sadaqah-zakat": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "5", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "2", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$10", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "$2", trendValue: "$1", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 12m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "45", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$20", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$10", trendValue: "$1", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "2h 15m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$50", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$20", trendValue: "$1", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 35m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
  "sadaqah-kafarah": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "8", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "3", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "2", subValue: "meals", trendValue: "1 meal", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 12m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "62", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "8", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "5", subValue: "meals", trendValue: "1 meal", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 25m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "10", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "6", subValue: "meals", trendValue: "1 meal", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 50m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
  "sadaqah-fidya": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "5", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "2", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "4", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "2", subValue: "meals", trendValue: "1 meal", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 12m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "68", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "12", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "3", subValue: "meals", trendValue: "1 meal", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 26m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "145", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "12", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "10", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "7", subValue: "meals", trendValue: "1 meal", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 50m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
  "sadaqah-Lillah": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "18", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "5", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$10", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "$5", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 12m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "66", subValue: "active days", trendValue: "2 days", trendDirection: "down" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$12", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$30", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 28m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "150", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$50", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$20", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 45m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
  "sadaqah-volunteering": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "22", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "4", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "4", subValue: "hours", trendValue: "2 hours", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "2", subValue: "hours", trendValue: "1 hour", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 38m", trendValue: "0h 10m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "78", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "5", subValue: "hours", trendValue: "2 hours", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "3", subValue: "hours", trendValue: "1 hour", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 28m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "160", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "8", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "6", subValue: "hours", trendValue: "2 hours", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "4", subValue: "hours", trendValue: "1 hour", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 45m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },
  "sadaqah-jariyah": {
    monthly: [
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "20", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "3", subValue: "days", trendValue: "1 day", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$10", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "WEEKLY AVERAGE", value: "$5", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 5m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    threeMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "3", subValue: "months", footerText: "• 3 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "70", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$12", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$30", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 28m", trendValue: "0h 05m", trendDirection: "up" },
    ],
    sixMonths: [
      { iconFamily: "Ionicons", iconName: "calendar-outline", title: "GOAL TRACKED", value: "6", subValue: "months", footerText: "• 6 months" },
      { iconFamily: "Ionicons", iconName: "checkmark-circle-outline", title: "COMPLETED IN", value: "146", subValue: "active days", trendValue: "2 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "flash", title: "LONGEST STREAK", value: "6", subValue: "days", trendValue: "5 days", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "sparkles", title: "BEST DAY", value: "$50", trendValue: "$2", trendDirection: "up" },
      { iconFamily: "MaterialCommunityIcons", iconName: "scale-balance", title: "MONTHLY AVERAGE", value: "$20", trendValue: "$1", trendDirection: "up" },
      { iconFamily: "Ionicons", iconName: "time-outline", title: "TIME SPENT", value: "0h 45m", trendValue: "0h 05m", trendDirection: "up" },
    ],
  },};
