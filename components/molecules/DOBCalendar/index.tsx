/**
 * DOBCalendar — reusable Date-of-Birth picker component.
 * Layout: dropdown header (month/year) → nav row (← range →) → CalendarGrid → OK / Cancel
 */

import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
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
}: DOBCalendarProps) => {
  // Allow the full cutoff year (e.g. all of 2013 when "13+" means born in 2013 or earlier).
  // Do not clamp to today's month/day inside that year.
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
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const monthBtnRef = useRef<View>(null);
  const yearBtnRef = useRef<View>(null);
  const rootRef = useRef<View>(null);

  const currentDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const yearOptions = Array.from({ length: 100 }, (_, i) =>
    String(maxAllowedDate.year() - i),
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

  // ── Dropdown helpers ────────────────────────────────────────────────────────

  const openPicker = (
    type: DropdownType,
    ref: React.RefObject<View | null>,
  ) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
      return;
    }
    ref.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownAnchor({ x: pageX, y: pageY, width, height });
      setOpenDropdown(type);
    });
  };

  const selectMonth = (index: number) => {
    const next = moment({ year: currentYear, month: index, day: 1 });
    if (next.isAfter(maxAllowedDate, "month")) return;
    setCurrentMonth(index);
    setOpenDropdown(null);
  };
  const selectYear = (year: string) => {
    const nextYear = Number(year);
    if (nextYear > maxAllowedDate.year()) return;
    setCurrentYear(nextYear);
    if (
      nextYear === maxAllowedDate.year() &&
      currentMonth > maxAllowedDate.month()
    ) {
      setCurrentMonth(maxAllowedDate.month());
    }
    setOpenDropdown(null);
  };
  const dropdownData = openDropdown === "month" ? MONTHS : yearOptions;

  // ── Month navigation ────────────────────────────────────────────────────────

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    const next =
      currentMonth === 11
        ? moment({ year: currentYear + 1, month: 0, day: 1 })
        : moment({ year: currentYear, month: currentMonth + 1, day: 1 });
    if (next.isAfter(maxAllowedDate, "month")) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  // Sync range labels with the month/year dropdown selection.
  const rangeStart = moment(firstDay);
  const rangeEnd = moment(lastDay);
  const formatRangePart = (d: moment.Moment) =>
    `${d.format("MMM").toUpperCase()} ${d.format("D")}`;
  const rangeLabel = `${formatRangePart(rangeStart)} - ${formatRangePart(rangeEnd)}, ${rangeEnd.year()}`;

  // Islamic range for the same selected Gregorian month
  // Figma-style Hijri month abbreviations (e.g. "Shw 24 – DhQ 21, 1420")
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

  // ── OK / Cancel ─────────────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.wrapper}>
      {/* ── Dropdown header ── */}
      <View style={styles.topBar}>
        <View style={styles.header}>
          <View ref={monthBtnRef} collapsable={false}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                styles.monthDropdownButton,
                openDropdown === "month" && styles.dropdownButtonOpen,
              ]}
              onPress={() => openPicker("month", monthBtnRef)}
              activeOpacity={0.7}
            >
              <Text
                style={styles.dropdownButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {MONTHS[currentMonth]}
              </Text>
              <DownArrowIcon />
            </TouchableOpacity>
          </View>
          <View ref={yearBtnRef} collapsable={false}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                styles.yearDropdownButton,
                openDropdown === "year" && styles.dropdownButtonOpen,
              ]}
              onPress={() => openPicker("year", yearBtnRef)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>{currentYear}</Text>
              <DownArrowIcon />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Nav row ── */}
      <View
        style={{
          backgroundColor: Colors.light.calendarBg,
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
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
            style={styles.navArrow}
            activeOpacity={0.7}
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

      {/* ── Dropdown modal ── */}
      <Modal
        visible={openDropdown !== null && dropdownAnchor !== null}
        transparent
        animationType="none"
        onRequestClose={() => setOpenDropdown(null)}
      >
        <TouchableWithoutFeedback onPress={() => setOpenDropdown(null)}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        {dropdownAnchor !== null && (
          <View
            style={[
              styles.dropdownList,
              openDropdown === "month"
                ? styles.monthDropdownList
                : styles.yearDropdownList,
              {
                top: dropdownAnchor.y + dropdownAnchor.height - 30,
                left: dropdownAnchor.x,
                width: dropdownAnchor.width,
              },
            ]}
          >
            <ScrollView
              scrollEnabled={openDropdown === "year"}
              showsVerticalScrollIndicator={openDropdown === "year"}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={openDropdown === "year"}
              bounces={openDropdown === "year"}
            >
              {dropdownData.map((item, index) => {
                const isSelected =
                  openDropdown === "month"
                    ? index === currentMonth
                    : item === String(currentYear);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.listItem,
                      isSelected && styles.listItemSelected,
                    ]}
                    onPress={() =>
                      openDropdown === "month"
                        ? selectMonth(index)
                        : selectYear(item)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        isSelected && styles.listItemTextSelected,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default DOBCalendar;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },

  topBar: {
    backgroundColor: Colors.light.calendarBg,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 16,
    zIndex: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.greybuttonBackground,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dropdownButtonOpen: {
    borderColor: Colors.light.green,
  },
  monthDropdownButton: {
    gap: 16,
    paddingHorizontal: 12,
    minWidth: 100,
    justifyContent: "center",
  },
  yearDropdownButton: {
    gap: 8,
    paddingHorizontal: 10,
    minWidth: 72,
  },
  dropdownButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    lineHeight: 16,
  },
  caret: { fontSize: 10, color: Colors.light.white },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.calendarBg,
  },
  navArrow: { paddingHorizontal: 12 },
  navArrowText: { fontSize: 24, color: Colors.light.white },
  navLabelContainer: {
    alignItems: "center",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    // lineHeight: 18,
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
  cancelBtnDisabled: { opacity: 0.70 },

  okBtnDisabled: { opacity: 0.70 },
  okText: {
    color: Colors.light.white,
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.primary.semiBold,
  },

  dropdownList: {
    position: "absolute",
    zIndex: 999,
    elevation: 16,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  monthDropdownList: {
    height: undefined,
  },
  yearDropdownList: {
    height: 330,
  },
  listItem: { paddingHorizontal: 16, paddingVertical: 4 },
  listItemSelected: {},
  listItemText: { fontSize: 14, color: Colors.light.white },
  listItemTextSelected: {
    color: Colors.light.green,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
});
