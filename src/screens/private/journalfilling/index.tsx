import React, { useCallback, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
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
import {
  addDays,
  parseDateKey,
  toDateKey,
} from "./journalFillingDateUtils";

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
    isLoadingEntry,
    isSaving,
    showEdit,
    showDiscardDialog,
    dontShowDiscardAgain,
    showSuccessToast,
    handleSelectDate,
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
    calendarMonthDateKey,
    calendarCompletionMap,
    isLoadingCalendar,
    openCalendar,
    closeCalendar,
    shiftCalendarMonth,
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
      />
    ),
    [draft.answers, handleAnswerChange],
  );

  return (
    <View style={styles.screen}>
      <JournalFillingTopGradient style={styles.topGradient}>
        <View style={[styles.topGradientContent, { paddingTop: headerHeight }]}>
          <JournalDateTextRow
            selectedDateKey={selectedDateKey}
            onPressDate={openCalendar}
            onPressPrevDay={() => {
              const d = parseDateKey(selectedDateKey);
              handleSelectDate(toDateKey(addDays(d, -1)));
            }}
            onPressNextDay={() => {
              const d = parseDateKey(selectedDateKey);
              handleSelectDate(toDateKey(addDays(d, 1)));
            }}
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
        calendarMonthDateKey={calendarMonthDateKey}
        completionMap={calendarCompletionMap}
        isLoading={isLoadingCalendar}
        onClose={closeCalendar}
        onPrevMonth={() => shiftCalendarMonth(-1)}
        onNextMonth={() => shiftCalendarMonth(1)}
        onSelectDate={handleCalendarDayPress}
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 72}
      >
        {isLoadingEntry ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.light.green} size="large" />
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {sections.map(renderSection)}

              <JournalNotesInput
                value={draft.notes}
                onChangeText={handleNotesChange}
                placeholder={notesPlaceholder}
              />
            </ScrollView>

            <JournalSaveButton
              label={saveLabel}
              disabled={!hasChanges}
              loading={isSaving}
              bottomInset={insets.bottom}
              onPress={handleSave}
            />
          </>
        )}
      </KeyboardAvoidingView>

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
