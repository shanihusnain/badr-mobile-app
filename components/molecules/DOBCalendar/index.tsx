/**
 * DOBCalendar — reusable Date-of-Birth picker component.
 * Layout: dropdown header (month/year) → nav row (← range →) → CalendarGrid → OK / Cancel
 */

import { Colors } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ScrollView as GHScrollView,
  TouchableOpacity as GHTouchableOpacity,
} from "react-native-gesture-handler";
import moment from "moment-hijri";
import { fonts } from "@/assets/fonts";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { BackChevron, DownArrowIcon, Forwardchevron } from "@/assets/icons";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MINIMUM_AGE_YEARS = 13;
/** One row height × 12 months — year panel uses the same fixed height. */
const DROPDOWN_ITEM_HEIGHT = 24;
const DROPDOWN_PANEL_HEIGHT = DROPDOWN_ITEM_HEIGHT * MONTHS.length;

type DropdownType = "month" | "year" | null;

// ── Props ──────────────────────────────────────────────────────────────────────

interface DOBCalendarProps {
  /** Previously saved date (YYYY-MM-DD or DD/MM/YYYY) to restore on open. */
  value?: string;
  /** Called with the selected date string (YYYY-MM-DD) when OK is pressed. */
  onSave?: (date: string) => void;
  /** Called when Cancel is pressed. */
  onCancel?: () => void;
  /** Minimum allowed age in years. Defaults to 13. */
  minimumAgeYears?: number;
  /**
   * Fired when month/year dropdown open state changes. Parent screens can
   * disable their ScrollView while true so Android nested year scrolling works.
   */
  onDropdownOpenChange?: (open: boolean) => void;
}

const parseCalendarDate = (value?: string): Date | null => {
  if (!value) return null;
  if (value.includes("-")) {
    const parsed = moment(value, "YYYY-MM-DD", true);
    return parsed.isValid() ? parsed.toDate() : null;
  }
  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (!day || !month || !year) return null;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export const DOBCalendar = ({
  onSave,
  onCancel,
  value,
  minimumAgeYears = MINIMUM_AGE_YEARS,
  onDropdownOpenChange,
}: DOBCalendarProps) => {
  // Allow the full cutoff year (e.g. all of 2013 when "13+" means born in 2013 or earlier).
  const maxAllowedDate = moment()
    .subtract(minimumAgeYears, "years")
    .endOf("year");
  const maxAllowedDateString = maxAllowedDate.format("YYYY-MM-DD");
  const defaultViewDate = moment().subtract(minimumAgeYears, "years");
  const initialDate = parseCalendarDate(value);
  const startDate =
    initialDate && moment(initialDate).isSameOrBefore(maxAllowedDate, "day")
      ? initialDate
      : defaultViewDate.toDate();

  const [currentMonth, setCurrentMonth] = useState(startDate.getMonth());
  const [currentYear, setCurrentYear] = useState(startDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    initialDate && moment(initialDate).isSameOrBefore(maxAllowedDate, "day")
      ? moment(initialDate).format("YYYY-MM-DD")
      : undefined,
  );
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  useEffect(() => {
    onDropdownOpenChange?.(openDropdown != null);
  }, [openDropdown, onDropdownOpenChange]);

  const currentDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const yearOptions = Array.from({ length: 100 }, (_, i) =>
    maxAllowedDate.year() - i,
  );

  const handleDayPress = (dateString: string) => {
    if (moment(dateString, "YYYY-MM-DD").isAfter(maxAllowedDate, "day")) {
      return;
    }
    setSelectedDate(dateString);
    const picked = moment(dateString, "YYYY-MM-DD");
    setCurrentMonth(picked.month());
    setCurrentYear(picked.year());
    setOpenDropdown(null);
  };

  const selectMonth = (index: number) => {
    if (
      currentYear === maxAllowedDate.year() &&
      index > maxAllowedDate.month()
    ) {
      return;
    }
    setCurrentMonth(index);
    setOpenDropdown(null);
  };

  const selectYear = (year: number) => {
    if (year > maxAllowedDate.year()) return;
    setCurrentYear(year);
    if (
      year === maxAllowedDate.year() &&
      currentMonth > maxAllowedDate.month()
    ) {
      setCurrentMonth(maxAllowedDate.month());
    }
    setOpenDropdown(null);
  };

  const goToPrevMonth = () => {
    setOpenDropdown(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const canGoNextMonth = () => {
    const next =
      currentMonth === 11
        ? moment({ year: currentYear + 1, month: 0, day: 1 })
        : moment({ year: currentYear, month: currentMonth + 1, day: 1 });
    return !next.isAfter(maxAllowedDate, "month");
  };

  const goToNextMonth = () => {
    if (!canGoNextMonth()) return;
    setOpenDropdown(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const rangeStart = moment(firstDay);
  const rangeEnd = moment(lastDay);
  const formatRangePart = (d: moment.Moment) =>
    `${d.format("MMM").toUpperCase()} ${d.format("D")}`;
  const rangeLabel = `${formatRangePart(rangeStart)} - ${formatRangePart(rangeEnd)}, ${rangeEnd.year()}`;

  const HIJRI_MONTHS_SHORT = [
    "Muh",
    "Saf",
    "RbI",
    "RbII",
    "JmI",
    "JmII",
    "Raj",
    "Shb",
    "Ram",
    "Shw",
    "DhQ",
    "DhH",
  ];
  const startHijriMonth = HIJRI_MONTHS_SHORT[rangeStart.iMonth()];
  const endHijriMonth = HIJRI_MONTHS_SHORT[rangeEnd.iMonth()];
  const startHijriDay = rangeStart.iDate();
  const endHijriDay = rangeEnd.iDate();
  const startHijriYear = rangeStart.iYear();
  const endHijriYear = rangeEnd.iYear();

  const islamicDateLabel =
    startHijriYear === endHijriYear
      ? `${startHijriMonth} ${startHijriDay} – ${endHijriMonth} ${endHijriDay}, ${endHijriYear}`
      : `${startHijriMonth} ${startHijriDay}, ${startHijriYear} – ${endHijriMonth} ${endHijriDay}, ${endHijriYear}`;

  const handleOk = () => {
    if (!selectedDate) return;
    if (moment(selectedDate, "YYYY-MM-DD").isAfter(maxAllowedDate, "day")) {
      return;
    }
    onSave?.(selectedDate);
  };
  const handleCancel = () => {
    setSelectedDate(undefined);
    onCancel?.();
  };

  const monthItems = MONTHS.map((label, index) => ({
    key: label,
    label,
    selected: index === currentMonth,
    disabled:
      currentYear === maxAllowedDate.year() && index > maxAllowedDate.month(),
    onPress: () => selectMonth(index),
  }));

  const yearItems = yearOptions.map((y) => ({
    key: String(y),
    label: String(y),
    selected: y === currentYear,
    disabled: false,
    onPress: () => selectYear(y),
  }));

  const yearListRef = useRef<GHScrollView>(null);

  const maxAllowedYear = maxAllowedDate.year();

  useEffect(() => {
    if (openDropdown !== "year") return;
    // yearOptions is maxYear, maxYear-1, … so index === maxYear - currentYear.
    const selectedIndex = Math.max(0, maxAllowedYear - currentYear);
    const timer = setTimeout(() => {
      yearListRef.current?.scrollTo({
        y: selectedIndex * DROPDOWN_ITEM_HEIGHT,
        animated: false,
      });
    }, 16);
    return () => clearTimeout(timer);
  }, [openDropdown, currentYear, maxAllowedYear]);

  const renderDropdownPanel = (
    items: Array<{
      key: string;
      label: string;
      selected: boolean;
      disabled: boolean;
      onPress: () => void;
    }>,
    options: { scrollable: boolean; kind: "month" | "year" },
  ) => {
    // Month fits in the panel — no scroll needed.
    if (!options.scrollable) {
      return (
        <View style={[styles.dropdownPanel, { height: DROPDOWN_PANEL_HEIGHT }]}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              disabled={item.disabled}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={[
                styles.listItem,
                styles.monthListItem,
                { height: DROPDOWN_ITEM_HEIGHT },
                item.disabled && styles.listItemDisabled,
              ]}
            >
              <Text
                style={[
                  styles.listItemText,
                  item.selected && styles.listItemTextSelected,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Year: gesture-handler ScrollView + TouchableOpacity so Android can scroll
    // inside KeyboardAwareScrollView without losing row taps.
    return (
      <View style={[styles.dropdownPanel, { height: DROPDOWN_PANEL_HEIGHT }]}>
        <GHScrollView
          ref={yearListRef}
          style={styles.dropdownList}
          contentContainerStyle={styles.yearListContent}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          bounces={false}
        >
          {items.map((item) => (
            <GHTouchableOpacity
              key={item.key}
              disabled={item.disabled}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={[
                styles.listItem,
                styles.yearListItem,
                { height: DROPDOWN_ITEM_HEIGHT },
                item.disabled && styles.listItemDisabled,
              ]}
            >
              <Text
                style={[
                  styles.listItemText,
                  item.selected && styles.listItemTextSelected,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </GHTouchableOpacity>
          ))}
        </GHScrollView>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Dropdown header ── */}
      <View style={styles.topBar}>
        <View style={styles.header}>
          <View style={[styles.dropdownCol, styles.monthDropdownCol]}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                openDropdown === "month" && styles.dropdownButtonOpen,
              ]}
              onPress={() =>
                setOpenDropdown((d) => (d === "month" ? null : "month"))
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  styles.monthDropdownButtonText,
                  openDropdown === "month" && styles.dropdownButtonTextOpen,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {MONTHS[currentMonth]}
              </Text>
              <View style={styles.dropdownCaret}>
                <DownArrowIcon />
              </View>
            </TouchableOpacity>
            {openDropdown === "month"
              ? renderDropdownPanel(monthItems, {
                  scrollable: false,
                  kind: "month",
                })
              : null}
          </View>

          <View style={[styles.dropdownCol, styles.yearDropdownCol]}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                openDropdown === "year" && styles.dropdownButtonOpen,
              ]}
              onPress={() =>
                setOpenDropdown((d) => (d === "year" ? null : "year"))
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  styles.yearDropdownButtonText,
                  openDropdown === "year" && styles.dropdownButtonTextOpen,
                ]}
                numberOfLines={1}
              >
                {currentYear}
              </Text>
              <View style={styles.dropdownCaret}>
                <DownArrowIcon />
              </View>
            </TouchableOpacity>
            {openDropdown === "year"
              ? renderDropdownPanel(yearItems, {
                  scrollable: true,
                  kind: "year",
                })
              : null}
          </View>
        </View>
      </View>

      {/* ── Nav row ── */}
      <View style={styles.navSection}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navArrow}
            activeOpacity={0.7}
          >
            <BackChevron />
          </TouchableOpacity>
          <View style={styles.navLabelContainer}>
            <Text style={styles.navLabel}>{rangeLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={[styles.navArrow, !canGoNextMonth() && { opacity: 0.35 }]}
            activeOpacity={0.7}
            disabled={!canGoNextMonth()}
          >
            <Forwardchevron />
          </TouchableOpacity>
        </View>

        <Text style={styles.islamicDateText}>{islamicDateLabel}</Text>
      </View>

      {/* ── Calendar grid + OK / Cancel ── */}
      <CalendarGrid
        mode="dob"
        currentDate={currentDate}
        selectedDate={selectedDate}
        maxDate={maxAllowedDateString}
        onDayPress={handleDayPress}
        borderBottomLeftRadius={12}
        borderBottomRightRadius={12}
        footer={
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.okBtn,
                !selectedDate && styles.cancelBtnDisabled,
                {
                  borderWidth: !selectedDate ? 0 : 1,
                },
              ]}
              onPress={handleOk}
              activeOpacity={0.7}
              disabled={!selectedDate}
            >
              <Text
                style={[
                  styles.okText,
                  {
                    color: !selectedDate
                      ? Colors.light.white
                      : Colors.light.green,
                  },
                ]}
              >
                Ok
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, !selectedDate && styles.okBtnDisabled]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default DOBCalendar;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    overflow: "visible",
    zIndex: 1,
  },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 16,
    zIndex: 20,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 20,
  },
  dropdownCol: {
    position: "relative",
    zIndex: 21,
  },
  monthDropdownCol: {
    width: 96,
  },
  yearDropdownCol: {
    // 4-digit year + caret; 64 was too tight and wrapped "2005" → "200"/"5".
    width: 78,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: Colors.light.greybuttonBackground,
    height: 32,
    paddingLeft: 10,
    paddingRight: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
  },
  dropdownButtonOpen: {
    borderColor: Colors.light.green,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    lineHeight: 16,
    textAlign: "left",
  },
  monthDropdownButtonText: {
    marginLeft: 4,
  },
  yearDropdownButtonText: {
    flexShrink: 0,
  },
  dropdownButtonTextOpen: {
    color: Colors.light.green,
  },
  dropdownCaret: {
    position: "absolute",
    right: 6,
    top: 2,
    bottom: 0,
    justifyContent: "center",
  },
  dropdownPanel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.light.calendarBg,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.light.greybuttonBackground,
    zIndex: 30,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownList: {
    flexGrow: 0,
    height: DROPDOWN_PANEL_HEIGHT,
  },
  yearListContent: {
    flexGrow: 0,
    paddingBottom: 4,
  },
  listItem: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  /** Match button label inset: paddingLeft 10 + month nudge 4 */
  monthListItem: {
    paddingLeft: 14,
    paddingRight: 8,
  },
  /** Match button label inset: paddingLeft 10 */
  yearListItem: {
    paddingLeft: 10,
    paddingRight: 8,
  },
  listItemDisabled: {
    opacity: 0.35,
  },
  listItemText: {
    fontSize: 13,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    textAlign: "left",
  },
  listItemTextSelected: {
    color: Colors.light.green,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },

  navSection: {
    backgroundColor: Colors.light.calendarBg,
    alignItems: "center",
    paddingVertical: 10,
    zIndex: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.calendarBg,
  },
  navArrow: { paddingHorizontal: 12 },
  navLabelContainer: {
    alignItems: "center",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
  },
  islamicDateText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "center",
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  cancelText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
  },
  okBtn: {
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.green,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnDisabled: { opacity: 0.7 },
  okBtnDisabled: { opacity: 0.7 },
  okText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },
});
