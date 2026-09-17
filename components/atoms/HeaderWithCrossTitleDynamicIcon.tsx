import React, { useState, type ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";

/** Some goal titles embed `\n` for multi-line cards; headers always stay one line. */
const toSingleLine = (value: string) => value.replace(/\s*\n\s*/g, " ").trim();

export type HeaderTitleDropdownOption = {
  value: string;
  label: string;
};

export const HeaderWithCrossTitleDynamicIcon = ({
  title,
  navigation,
  letterSpacing = 0,
  iconName = "x",
  bgcolor = Colors.light.blackBackground,
  secondTitle = "",
  titleHighlight,
  onBackPress,
  rightIconName,
  rightIcon,
  onRightPress,
  leftButtonBackground,
  forloggingFlow = false,
  titleDropdownOptions,
  selectedTitleValue,
  onTitleOptionSelect,
}: {
  title: string;
  navigation: any;
  letterSpacing?: number;
  iconName?: keyof typeof Feather.glyphMap;
  bgcolor?: string;
  secondTitle?: string;
  /** Optional prefix rendered in green (e.g. "01") */
  titleHighlight?: string;
  onBackPress?: () => void;
  rightIconName?: keyof typeof Feather.glyphMap;
  /** Custom right icon node (takes precedence over rightIconName). */
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  leftButtonBackground?: string;
  forloggingFlow?: boolean;
  /** When set, title becomes a dropdown trigger with radio options. */
  titleDropdownOptions?: HeaderTitleDropdownOption[];
  selectedTitleValue?: string;
  onTitleOptionSelect?: (value: string) => void;
}) => {
  const singleLineTitle = toSingleLine(title);
  const singleLineSecondTitle = secondTitle ? toSingleLine(secondTitle) : "";
  const hasTitleDropdown =
    Array.isArray(titleDropdownOptions) && titleDropdownOptions.length > 0;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const titleBlock = (
    <>
      {!!singleLineTitle || !!titleHighlight ? (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={[
            styles.titleText,
            { letterSpacing },
            hasTitleDropdown && !singleLineSecondTitle && styles.titleWithChevron,
          ]}
        >
          {!!titleHighlight && (
            <Text style={{ color: Colors.light.green }}>
              {titleHighlight}{" "}
            </Text>
          )}
          {singleLineTitle}
          {hasTitleDropdown && !singleLineSecondTitle ? (
            <Text style={styles.inlineChevron}>{"  "}▼</Text>
          ) : null}
        </Text>
      ) : null}
      {!!singleLineSecondTitle && (
        <View style={styles.secondTitleRow}>
          <Text
            numberOfLines={1}
            style={[styles.secondTitleText, { letterSpacing }]}
          >
            {singleLineSecondTitle}
          </Text>
          {hasTitleDropdown ? (
            <Feather
              name="chevron-down"
              size={14}
              color={Colors.light.white}
              style={styles.secondTitleChevron}
            />
          ) : null}
        </View>
      )}
    </>
  );

  return (
    <View
      style={{
        height: 100,
        position: "relative",
        paddingTop: 40,
        backgroundColor: bgcolor ?? Colors.light.blackBackground,
        zIndex: dropdownOpen ? 40 : 11,
        elevation: dropdownOpen ? 40 : 0,
      }}
    >
      {/* Centered title — inset so it clears the side buttons */}
      <View
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          top: 40,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 11,
        }}
        pointerEvents={hasTitleDropdown ? "box-none" : "none"}
      >
        {hasTitleDropdown ? (
          <Pressable
            onPress={() => setDropdownOpen((open) => !open)}
            hitSlop={8}
            style={styles.titlePressable}
          >
            {titleBlock}
          </Pressable>
        ) : (
          titleBlock
        )}
      </View>

      {/* Close button — fixed top-left position */}
      <Pressable
        style={{
          position: "absolute",
          left: 18,
          top: 52,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor:
            leftButtonBackground ?? Colors.light.greybuttonBackground,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
        onPress={() => (onBackPress ? onBackPress() : navigation.goBack())}
      >
        <Feather name={iconName} size={24} color={Colors.light.white} />
      </Pressable>

      {rightIcon || rightIconName ? (
        <Pressable
          style={{
            position: "absolute",
            right: 18,
            top: 52,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: rightIcon
              ? Colors.light.dullestWhite
              : Colors.light.greybuttonBackground,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          onPress={onRightPress}
          hitSlop={8}
        >
          {rightIcon ?? (
            <Feather
              name={rightIconName!}
              size={18}
              color={Colors.light.white}
            />
          )}
        </Pressable>
      ) : null}

      {hasTitleDropdown ? (
        <Modal
          visible={dropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setDropdownOpen(false)}
            />
            <View style={styles.dropdownAnchor} pointerEvents="box-none">
              <View style={styles.dropdownMenu}>
                {titleDropdownOptions!.map((option) => {
                  const isSelected = option.value === selectedTitleValue;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownOption}
                      activeOpacity={0.8}
                      onPress={() => {
                        setDropdownOpen(false);
                        if (option.value !== selectedTitleValue) {
                          onTitleOptionSelect?.(option.value);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          isSelected && styles.radioOuterSelected,
                        ]}
                      >
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Text style={styles.dropdownOptionText} numberOfLines={2}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  titlePressable: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "100%",
  },
  titleText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    textAlign: "center",
    width: "100%",
  },
  titleWithChevron: {
    paddingHorizontal: 4,
  },
  inlineChevron: {
    color: Colors.light.white,
    fontSize: 10,
    fontFamily: fonts.primary.semiBold,
  },
  secondTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    gap: 4,
  },
  secondTitleText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 14,
    textTransform: "uppercase",
  },
  secondTitleChevron: {
    marginTop: 1,
  },
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownAnchor: {
    marginTop: 96,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  dropdownMenu: {
    width: "100%",
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.light.grey,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.green,
  },
  dropdownOptionText: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});

export default HeaderWithCrossTitleDynamicIcon;
