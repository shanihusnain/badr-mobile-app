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
import { DownArrowIcon } from "@/assets/icons";

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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - i));

type DropdownType = "month" | "year" | null;

// ── Props ──────────────────────────────────────────────────────────────────────

interface DOBCalendarProps {
  /** Called with the selected date string (YYYY-MM-DD) when OK is pressed. */
  onSave?: (date: string) => void;
  /** Called when Cancel is pressed. */
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const DOBCalendar = ({ onSave, onCancel }: DOBCalendarProps) => {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
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
  const todayString = moment().format("YYYY-MM-DD");

  const handleDayPress = (dateString: string) => {
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
    setCurrentMonth(index);
    setOpenDropdown(null);
  };
  const selectYear = (year: string) => {
    setCurrentYear(Number(year));
    setOpenDropdown(null);
  };
  const dropdownData = openDropdown === "month" ? MONTHS : YEARS;

  // ── Month navigation ────────────────────────────────────────────────────────

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const rangeLabel = `${fmt(firstDay)} - ${fmt(lastDay)}, ${currentYear}`;

  // Calculate Islamic date for the current month
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
  const monthMoment = moment(
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`,
    "YYYY-MM-DD",
  );
  const hijriMonth = HIJRI_MONTHS_SHORT[monthMoment.iMonth()];
  const hijriYear = monthMoment.iYear();
  const islamicDateLabel = `${hijriMonth} ${hijriYear}`;

  // ── OK / Cancel ─────────────────────────────────────────────────────────────

  const handleOk = () => {
    if (selectedDate) onSave?.(selectedDate);
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
              style={styles.dropdownButton}
              onPress={() => openPicker("month", monthBtnRef)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText}>
                {MONTHS[currentMonth]}
              </Text>
              <DownArrowIcon />
            </TouchableOpacity>
          </View>
          <View ref={yearBtnRef} collapsable={false}>
            <TouchableOpacity
              style={styles.dropdownButton}
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
            <Text style={styles.navArrowText}>{"‹"}</Text>
          </TouchableOpacity>
          <View style={styles.navLabelContainer}>
            <Text style={styles.navLabel}>{rangeLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navArrow}
            activeOpacity={0.7}
          >
            <Text style={styles.navArrowText}>{"›"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.islamicDateText}>{islamicDateLabel}</Text>
      </View>

      {/* ── Calendar grid ── */}
      <CalendarGrid
        mode="dob"
        currentDate={currentDate}
        selectedDate={selectedDate}
        maxDate={todayString}
        onDayPress={handleDayPress}
      />

      {/* ── Footer: OK / Cancel ── */}
      <View style={styles.footer}>
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
                  color: !selectedDate ? Colors.light.grey : Colors.light.green,
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
      </View>

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
              {
                top: dropdownAnchor.y + dropdownAnchor.height + 4,
                left: dropdownAnchor.x,
                width: dropdownAnchor.width,
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
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

    gap: 16,
    backgroundColor: Colors.light.greybuttonBackground,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.white,
  },
  caret: { fontSize: 10, color: Colors.light.white },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 12,
  },
  navArrow: { paddingHorizontal: 12 },
  navArrowText: { fontSize: 24, color: Colors.light.white },
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
    paddingBottom: 10,
  },

  footer: {
    backgroundColor: Colors.light.calendarBg,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  cancelBtnDisabled: { opacity: 0.4 },

  okBtnDisabled: { opacity: 0.4 },
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
    height: 500,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  listItem: { paddingHorizontal: 16, paddingVertical: 11 },
  listItemSelected: {},
  listItemText: { fontSize: 14, color: Colors.light.white },
  listItemTextSelected: {
    color: Colors.light.green,
    fontWeight: "700",
    fontFamily: fonts.primary.bold,
  },
});
