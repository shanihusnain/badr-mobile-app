import React, { forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { FastingCycleDates } from "./FastingCycleDates";
import { Colors } from "@/constants/theme";
import { PLANNED_FASTS } from "../plannedFasts";
import moment from "moment-hijri";
import { Entypo } from "@expo/vector-icons";
import { useTypedTranslation } from "@/i18next/useTypedTranslation";

type Props = {
  onClose?: () => void;
};

export const TodayCalendarBottomSheet = forwardRef<BottomSheet, Props>(
  function TodayCalendarBottomSheet({ onClose }, ref) {
    const { cycleStartDate, cycleEndDate } = PLANNED_FASTS;
    const { i18n } = useTypedTranslation();
    const currentDate = moment(cycleStartDate, "YYYY-MM-DD")
      .startOf("month")
      .format("YYYY-MM-DD");

    return (
      <BottomSheetWrapper
        ref={ref}
        onClose={onClose}
        snapPoints={["65%", "92%"]}
      >
        <View style={styles.headerContainer}>
          <Entypo name={i18n.language === "ar" ? "chevron-right" : "chevron-left"} size={24} color={Colors.light.white} />
          <View style={styles.centerDateContainer}>
            <FastingCycleDates startDate={cycleStartDate} endDate={cycleEndDate} />
          </View>
          <Entypo name={i18n.language === "ar" ? "chevron-left" : "chevron-right"} size={24} color={Colors.light.white} />
        </View>
        <CalendarGrid
          mode="planned_all"
          currentDate={currentDate}
          windowStartDate={cycleStartDate}
          windowEndDate={cycleEndDate}
          bgColor={Colors.light.greybuttonBackground}
        />
      </BottomSheetWrapper>
    );
  }
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  centerDateContainer: {
    flex: 1,
    alignItems: "center",
  },
});
borderRadius: 8,
  paddingVertical: 8,
    paddingHorizontal: 12,
      backgroundColor: "rgba(255,255,255,0.04)",
  },
gregorianLabel: {
  fontSize: 14,
    fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
        color: Colors.light.white,
          textAlign: "center",
            letterSpacing: 0.4,
              textTransform: "uppercase",
  },
islamicLabel: {
  fontSize: 12,
    fontFamily: fonts.primary.regular,
      fontWeight: "400",
        color: Colors.light.seagreen,
          textAlign: "center",
            marginTop: 3,
  },
});
