import React from "react";
import { StyleSheet, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Colors } from "@/constants/theme";

export type BookedOtherGoalType =
  | "MONDAY_THURSDAY"
  | "WHITE_DAYS"
  | "PROPHET_DAWOOD"
  | "MISSED_RAMADAN"
  | string;

type RingVisual =
  | { variant: "outline"; color: string }
  | { variant: "completed"; color: string }
  | { variant: "missed"; color: string }
  | { variant: "todayDisabled" };

function normalizeBookedFor(bookedFor: string | null | undefined): string {
  return String(bookedFor ?? "")
    .trim()
    .toUpperCase();
}

/** Accent color for the other fasting goal that holds this day. */
export function getBookedOtherGoalRingColor(
  bookedFor: string | null | undefined,
): string {
  switch (normalizeBookedFor(bookedFor)) {
    case "MONDAY_THURSDAY":
      return Colors.light.ringMonThu;
    case "WHITE_DAYS":
      return Colors.light.ringWhiteDaysBright;
    case "PROPHET_DAWOOD":
      return Colors.light.ringDawood;
    case "MISSED_RAMADAN":
      return Colors.light.ringRamadan;
    default:
      return Colors.light.ringRamadan;
  }
}

function normalizeStatus(status: string | null | undefined): string {
  return String(status ?? "")
    .trim()
    .toUpperCase();
}

function getRingVisual(
  bookedFor: string | null | undefined,
  status: string | null | undefined,
): RingVisual {
  const color = getBookedOtherGoalRingColor(bookedFor);
  const normalized = normalizeStatus(status);

  if (
    normalized === "COMPLETED" ||
    normalized === "LOGGED" ||
    normalized === "ACHIEVED" ||
    normalized === "DONE" ||
    normalized === "COVERED_EARLY" ||
    normalized === "MADE_UP"
  ) {
    return { variant: "completed", color };
  }

  if (normalized === "MISSED" || normalized === "SKIPPED") {
    return { variant: "missed", color };
  }

  if (
    normalized === "PLANNED" ||
    normalized === "UPCOMING" ||
    normalized === "DUE" ||
    normalized === "PENDING" ||
    normalized === "NOT_LOGGED" ||
    normalized === "EXCUSED" ||
    normalized === "MENSTRUATING"
  ) {
    return { variant: "outline", color };
  }

  // Unknown / null status — still show the other goal’s outline so the clash is visible.
  if (normalizeBookedFor(bookedFor)) {
    return { variant: "outline", color };
  }

  return { variant: "todayDisabled" };
}

type Props = {
  size: number;
  bookedFor?: string | null;
  status?: string | null;
};

/**
 * Weekly dashboard ring for a day held by another fasting goal.
 * Uses that goal’s accent + the booking `status` (planned / missed / completed).
 */
export function BookedOtherGoalDayRing({ size, bookedFor, status }: Props) {
  const visual = getRingVisual(bookedFor, status);
  const borderWidth = 1;
  const wrapperStyle = [styles.wrapper, { width: size + 4, height: size + 4 }];

  if (visual.variant === "todayDisabled") {
    return (
      <View style={wrapperStyle}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Colors.light.greybuttonBackground,
            borderWidth,
            borderColor: "rgba(183, 151, 126, 0.3)",
          }}
        />
      </View>
    );
  }

  if (visual.variant === "completed") {
    const innerSize = size - borderWidth * 2;
    const fillSize = Math.max(innerSize * 0.85, 1);
    return (
      <View style={wrapperStyle}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor: visual.color,
            },
          ]}
        >
          <View
            style={{
              width: fillSize,
              height: fillSize,
              borderRadius: fillSize / 2,
              backgroundColor: visual.color,
            }}
          />
        </View>
      </View>
    );
  }

  if (visual.variant === "missed") {
    return (
      <View style={wrapperStyle}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth,
              borderColor: visual.color,
            },
          ]}
        >
          <FontAwesome
            name="warning"
            size={Math.max(size * 0.5, 9)}
            color={Colors.light.yellow}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={wrapperStyle}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: visual.color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
