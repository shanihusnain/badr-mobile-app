import moment from "moment-hijri";

export const FASTING_CALENDAR_FILTER_TABS = [
  "All",
  "Missed Ramadan Fasts",
  "Monday & Thursday Fasts",
  "Dawood Fasts",
  "White Days Fasts",
] as const;
export type FastingCalendarFilterTab =
  (typeof FASTING_CALENDAR_FILTER_TABS)[number];

const HIJRI_MONTHS_SHORT = [
  "Muh.",
  "Saf.",
  "Rab. I",
  "Rab. II",
  "Jum. I",
  "Jum. II",
  "Raj.",
  "Sha.",
  "Ram.",
  "Shaw.",
  "Dhul Q.",
  "Dhul H.",
];

export function getGregorianDateRangeLabel(
  startDate: string,
  endDate: string,
): string {
  const startMoment = moment(startDate, "YYYY-MM-DD");
  const endMoment = moment(endDate, "YYYY-MM-DD");
  return `${startMoment.format("MMM D")} - ${endMoment.format("MMM D")}, ${startMoment.year()}`;
}

export function getIslamicDateRangeLabel(
  startDate: string,
  endDate: string,
): string {
  const startMoment = moment(startDate, "YYYY-MM-DD");
  const endMoment = moment(endDate, "YYYY-MM-DD");
  const startMonth = HIJRI_MONTHS_SHORT[startMoment.iMonth()];
  const endMonth = HIJRI_MONTHS_SHORT[endMoment.iMonth()];
  const startYear = startMoment.iYear();
  const endYear = endMoment.iYear();

  if (startMoment.iMonth() === endMoment.iMonth() && startYear === endYear) {
    return `${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
}
