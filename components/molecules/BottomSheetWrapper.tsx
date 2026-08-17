import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { Colors } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  onChange?: (index: number) => void;
  /** When false, children render directly (e.g. BottomSheetFlatList). Default: true */
  scrollable?: boolean;
  footerComponent?: React.FC<BottomSheetFooterProps>;
  bgColor?: string;
};

export const BottomSheetWrapper = forwardRef<BottomSheet, Props>(
  function BottomSheetWrapper(
    {
      children,
      snapPoints,
      onClose,
      onChange,
      scrollable = true,
      footerComponent,
      bgColor,
    },
    ref,
  ) {
    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? ["50%", "92%"],
      [snapPoints],
    );

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
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        onClose={onClose}
        onChange={onChange}
        footerComponent={footerComponent}
        backdropComponent={renderBackdrop}
        backgroundStyle={
          bgColor ? { backgroundColor: bgColor } : styles.sheetBackground
        }
        handleIndicatorStyle={styles.handle}
      >
        {scrollable ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          children
        )}
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
    width: 102,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
