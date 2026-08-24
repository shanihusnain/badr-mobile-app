import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import type { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types";
import { Colors } from "@/constants/theme";

type Props = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  onChange?: (index: number) => void;
  /** When false, children render directly (e.g. BottomSheetFlatList). Default: true */
  scrollable?: boolean;
  footerComponent?: React.FC<BottomSheetFooterProps>;
  bgColor?: string;
};

function parseSnapRatio(snap: string | number, screenHeight: number): number {
  if (typeof snap === "number") {
    return snap / screenHeight;
  }
  const percentMatch = /^(\d+(?:\.\d+)?)%$/.exec(snap);
  if (percentMatch) return Number(percentMatch[1]) / 100;
  const asNumber = Number(snap);
  return Number.isFinite(asNumber) ? asNumber / screenHeight : 0.8;
}

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
    const sheetRef = useRef<BottomSheet>(null);
    const { height: screenHeight } = useWindowDimensions();

    const resolvedSnapPoints = useMemo(
      () => snapPoints ?? ["80%"],
      [snapPoints],
    );

    /** Prefer the snap closest to 80% so `.expand()` opens at that height. */
    const openSnapIndex = useMemo(() => {
      let bestIndex = 0;
      let bestDelta = Number.POSITIVE_INFINITY;
      resolvedSnapPoints.forEach((snap, index) => {
        const delta = Math.abs(parseSnapRatio(snap, screenHeight) - 0.8);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestIndex = index;
        }
      });
      return bestIndex;
    }, [resolvedSnapPoints, screenHeight]);

    const contentMinHeight = useMemo(() => {
      const openSnap = resolvedSnapPoints[openSnapIndex] ?? "80%";
      const ratio = parseSnapRatio(openSnap, screenHeight);
      return screenHeight * ratio - 24;
    }, [openSnapIndex, resolvedSnapPoints, screenHeight]);

    const scrollContentStyle = useMemo(
      () => [styles.content, { minHeight: contentMinHeight }],
      [contentMinHeight],
    );

    useImperativeHandle(
      ref,
      () =>
        new Proxy({} as BottomSheet, {
          get(_, prop) {
            if (prop === "expand") {
              return () => {
                sheetRef.current?.snapToIndex(openSnapIndex);
              };
            }
            const sheet = sheetRef.current as BottomSheet | null;
            if (!sheet) return undefined;
            const value = (sheet as any)[prop];
            return typeof value === "function" ? value.bind(sheet) : value;
          },
        }),
      [openSnapIndex],
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
        ref={sheetRef}
        index={-1}
        snapPoints={resolvedSnapPoints}
        enableDynamicSizing={false}
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
            contentContainerStyle={scrollContentStyle}
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
    flexGrow: 1,
  },
});
