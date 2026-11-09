import React, { useCallback, useLayoutEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { JournalFillingHeader } from "@/components/atoms/JournalFillingHeader";
import { DiscardJournalDialog } from "./components/DiscardJournalDialog";
import { JournalDateSelector } from "./components/JournalDateSelector";
import { JournalDateTextRow } from "./components/JournalDateTextRow";
import { JournalNotesInput } from "./components/JournalNotesInput";
import { JournalSaveButton } from "./components/JournalSaveButton";
import { JournalSection } from "./components/JournalSection";
import { JournalSuccessToast } from "./components/JournalSuccessToast";
import { JournalTitleRow } from "./components/JournalInsightsButton";
import { JournalFillingTopGradient } from "./components/JournalFillingTopGradient";
import { JournalCalendarModal } from "./components/JournalCalendarModal";
import { journalFillingStyles as styles } from "./styles";
import { useJournalFillingProps } from "./useJournalFillingProps";

export function JournalFillingScreen() {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date?: string | string[] }>();
  const initialDateKey = Array.isArray(date) ? date[0] : date;

  const {
    sections,
    dateCapsules,
    selectedDateKey,
    screenTitle,
    draft,
    hasChanges,
    canLog,
    isLoadingEntry,
    isSaving,
    showEdit,
    showDiscardDialog,
    dontShowDiscardAgain,
    showSuccessToast,
    handleSelectDate,
    handlePreviousDay,
    handleNextDay,
    handleAnswerChange,
    handleNotesChange,
    handleSave,
    handleBack,
    handleInsightsPress,
    handleToggleDontShowAgain,
    handleCompleteJournal,
    handleDismissJournal,
    notesPlaceholder,
    saveLabel,
    discardDialogTitle,
    discardDialogBody,
    discardDialogCheckbox,
    discardDialogComplete,
    discardDialogDismiss,
    successMessage,
    calendarVisible,
    calendarWindowStartKey,
    calendarWindowEndKey,
    calendarCompletionMap,
    availableDateKeys,
    isLoadingCalendar,
    openCalendar,
    closeCalendar,
    shiftCalendarWindow,
    handleCalendarDayPress,
  } = useJournalFillingProps({ initialDateKey });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <JournalFillingHeader showEdit={showEdit} onBackPress={handleBack} />
      ),
    });
  }, [navigation, showEdit, handleBack]);

  const renderSection = useCallback(
    (section: (typeof sections)[number]) => (
      <JournalSection
        key={section.id}
        title={section.title}
        questions={section.questions}
        answers={draft.answers}
        onAnswerChange={handleAnswerChange}
        disabled={!canLog}
      />
    ),
    [canLog, draft.answers, handleAnswerChange],
  );

  return (
    <View style={styles.screen}>
      <JournalFillingTopGradient style={styles.topGradient}>
        <View style={[styles.topGradientContent, { paddingTop: headerHeight }]}>
          <JournalDateTextRow
            selectedDateKey={selectedDateKey}
            onPressDate={openCalendar}
            onPressPrevDay={handlePreviousDay}
            onPressNextDay={handleNextDay}
          />
          <JournalDateSelector
            dates={dateCapsules}
            onSelectDate={handleSelectDate}
          />
          <View style={styles.titleRowContainer}>
            <JournalTitleRow
              title={screenTitle}
              onInsightsPress={handleInsightsPress}
            />
          </View>
        </View>
      </JournalFillingTopGradient>

      <JournalCalendarModal
        visible={calendarVisible}
        selectedDateKey={selectedDateKey}
        windowStartDateKey={calendarWindowStartKey}
        windowEndDateKey={calendarWindowEndKey}
        completionMap={calendarCompletionMap}
        availableDateKeys={availableDateKeys}
        isLoading={isLoadingCalendar}
        onClose={closeCalendar}
        onPrevWindow={() => shiftCalendarWindow(-1)}
        onNextWindow={() => shiftCalendarWindow(1)}
        onSelectDate={handleCalendarDayPress}
      />

      {isLoadingEntry ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.light.green} size="large" />
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView
            style={styles.body}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableAutomaticScroll
            extraScrollHeight={140}
          >
            {sections.map(renderSection)}

            <JournalNotesInput
              value={draft.notes}
              onChangeText={handleNotesChange}
              placeholder={notesPlaceholder}
              editable={canLog}
            />
          </KeyboardAwareScrollView>

          <JournalSaveButton
            label={saveLabel}
            disabled={!canLog || !hasChanges}
            loading={isSaving}
            bottomInset={insets.bottom}
            onPress={handleSave}
          />
        </>
      )}

      <DiscardJournalDialog
        visible={showDiscardDialog}
        title={discardDialogTitle}
        body={discardDialogBody}
        checkboxLabel={discardDialogCheckbox}
        dontShowAgain={dontShowDiscardAgain}
        primaryButtonText={discardDialogComplete}
        secondaryButtonText={discardDialogDismiss}
        onToggleDontShowAgain={handleToggleDontShowAgain}
        onCompleteJournal={handleCompleteJournal}
        onDismissJournal={handleDismissJournal}
      />

      <JournalSuccessToast
        visible={showSuccessToast}
        message={successMessage}
      />
    </View>
  );
}
