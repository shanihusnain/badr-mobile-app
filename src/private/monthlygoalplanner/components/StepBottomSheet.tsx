import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

export type StepSheetData = {
  id: number;
  title: string;
  category?: string;
  description: string;
  instructions: string[];
};

type Props = {
  data: StepSheetData | null;
  onClose: () => void;
};

export const StepBottomSheet = forwardRef<BottomSheet, Props>(
  ({ data, onClose }, ref) => {
    const snapPoints = useMemo(() => ["45%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {data && (
            <>
              {data.category && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data.category}</Text>
                </View>
              )}
              <Text style={styles.title}>{data.title}</Text>
              <Text style={styles.description}>{data.description}</Text>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Steps</Text>
              {data.instructions.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.light.greybuttonBackground,
  },
  handle: {
    backgroundColor: Colors.light.grey,
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.calendarBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  badgeText: {
    color: Colors.light.white,
    fontSize: 12,
    fontFamily: fonts.primary.regular,
  },
  title: {
    color: Colors.light.white,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: fonts.primary.semiBold,
    marginBottom: 10,
  },
  description: {
    color: Colors.light.subtext,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.grey + "44",
    marginVertical: 16,
  },
  sectionLabel: {
    color: Colors.light.green,
    fontSize: 12,
    fontFamily: fonts.primary.semiBold,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    color: Colors.light.blackBackground,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: fonts.primary.semiBold,
  },
  stepText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: fonts.primary.regular,
    lineHeight: 22,
    flex: 1,
  },
});
