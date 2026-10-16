import { fonts } from "@/assets/fonts";
import { DownArrowIcon, MagnifyingGlassIcon } from "@/assets/icons";
import { Colors } from "@/constants/theme";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
// Use gesture-handler ScrollView for better nested scrolling inside FlatList / BottomSheet
import { ScrollView } from "react-native-gesture-handler";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

interface Option {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  label?: string;
  placeholder: string;
  options: (string | Option)[];
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  menuStyle?: ViewStyle;
  optionStyle?: ViewStyle;
  optionTextStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  errors?: string[];
  control?: any;
  name?: string;
  value?: string | number;
  onSelect?: (value: any) => void;
  borderColor?: string;
  /** Shows a search field inside the open menu. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchText?: string;
  /** True while the menu is open (lock parent KeyboardAwareScrollView). */
  onDropdownOpenChange?: (open: boolean) => void;
  /** Scroll parent so the search field stays above the keyboard. */
  onInputFocus?: (layout?: { windowY: number; inputHeight: number }) => void;
  /** Transform the closed-trigger label (e.g. hide currency symbol). */
  formatSelectedLabel?: (label: string) => string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder,
  options,
  labelStyle,
  containerStyle,
  menuStyle,
  optionStyle,
  optionTextStyle,
  selectedTextStyle,
  errors = [],
  control,
  name,
  value: controlledValue,
  onSelect,
  borderColor,
  searchable = false,
  searchPlaceholder = "Search...",
  emptySearchText = "No results found",
  onDropdownOpenChange,
  onInputFocus,
  formatSelectedLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState<
    string | number | undefined
  >(controlledValue);
  const searchInputRef = useRef<TextInput>(null);
  const searchBarRef = useRef<View>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const onInputFocusRef = useRef(onInputFocus);
  onInputFocusRef.current = onInputFocus;

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValue(controlledValue);
    }
  }, [controlledValue]);

  const reportSearchFocusLayout = useCallback(() => {
    onInputFocusRef.current?.();
    const node = searchBarRef.current;
    if (!node?.measureInWindow) return;
    requestAnimationFrame(() => {
      node.measureInWindow((_x, y, _w, h) => {
        onInputFocusRef.current?.({
          windowY: y,
          inputHeight: Math.max(h, 1),
        });
      });
    });
  }, []);

  useEffect(() => {
    onDropdownOpenChange?.(isOpen);

    if (!isOpen) {
      setSearchQuery("");
      searchInputRef.current?.blur();
      return;
    }

    if (!searchable) return;

    // Focus search and notify parent so the sheet can keep it above the keyboard.
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
      reportSearchFocusLayout();
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen, onDropdownOpenChange, searchable, reportSearchFocusLayout]);

  useEffect(() => {
    if (!searchable) return;
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      if (isOpen) {
        reportSearchFocusLayout();
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [searchable, isOpen, reportSearchFocusLayout]);

  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setIsOpen((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      return resolved;
    });
  };

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter((item) => {
      const label = typeof item === "string" ? item : item.label;
      const value = typeof item === "string" ? item : String(item.value);
      return (
        label.toLowerCase().includes(query) ||
        value.toLowerCase().includes(query)
      );
    });
  }, [options, searchQuery, searchable]);

  const renderDropdown = (
    currentValue: string | number | undefined,
    onChange?: (value: any) => void,
  ) => {
    const handleSelect = (itemValue: any) => {
      searchInputRef.current?.blur();
      if (onChange) onChange(itemValue);
      else setSelectedValue(itemValue);
      setOpen(false);
      setSearchQuery("");
      if (onSelect) onSelect(itemValue);
    };

    const getSelectedOption = () => {
      return options.find((opt) =>
        typeof opt === "string"
          ? opt === currentValue
          : opt.value === currentValue,
      );
    };

    const selectedOption = getSelectedOption();
    const hasValue =
      currentValue !== undefined &&
      currentValue !== null &&
      String(currentValue).trim() !== "";

    const getDisplayLabel = (): string => {
      if (!hasValue) return placeholder;
      const raw = !selectedOption
        ? String(currentValue)
        : typeof selectedOption === "string"
          ? selectedOption
          : selectedOption.label;
      return formatSelectedLabel ? formatSelectedLabel(raw) : raw;
    };

    return (
      <View style={styles.wrapper}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <TouchableOpacity
          style={[
            styles.trigger,
            containerStyle,
            borderColor
              ? {
                  borderColor: isOpen ? Colors.light.green : borderColor,
                  borderWidth: 1,
                }
              : {
                  borderColor: isOpen ? Colors.light.green : "transparent",
                  borderWidth: isOpen ? 1 : 0,
                },
          ]}
          onPress={() => setOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <View style={styles.triggerContent}>
            {selectedOption &&
            typeof selectedOption !== "string" &&
            selectedOption.icon ? (
              <View style={styles.triggerIconWrapper}>
                {selectedOption.icon}
              </View>
            ) : null}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.triggerText,
                hasValue ? selectedTextStyle : styles.placeholderText,
              ]}
            >
              {getDisplayLabel()}
            </Text>
          </View>
          <DownArrowIcon />
        </TouchableOpacity>

        {isOpen && (
          <View
            style={[
              styles.menu,
              searchable && styles.searchableMenu,
              searchable &&
                keyboardHeight > 0 && {
                  maxHeight: Math.max(
                    140,
                    260 - Math.min(keyboardHeight * 0.45, 140),
                  ),
                },
              menuStyle,
            ]}
          >
            {searchable ? (
              <View ref={searchBarRef} style={styles.searchBar} collapsable={false}>
                <MagnifyingGlassIcon />
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={Colors.light.white}
                  style={styles.searchInput}
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                  blurOnSubmit
                  onFocus={reportSearchFocusLayout}
                />
              </View>
            ) : null}
            <ScrollView
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={true}
              style={[
                styles.menuScroll,
                searchable &&
                  keyboardHeight > 0 && {
                    // Leave room for search bar + keyboard on short iPhones.
                    maxHeight: Math.max(
                      88,
                      200 - Math.min(keyboardHeight * 0.45, 140),
                    ),
                  },
              ]}
            >
              {filteredOptions.length === 0 ? (
                <Text style={styles.emptySearchText}>{emptySearchText}</Text>
              ) : (
                filteredOptions.map((item, index) => {
                  const itemLabel =
                    typeof item === "string" ? item : item.label;
                  const itemValue =
                    typeof item === "string" ? item : item.value;
                  const itemIcon =
                    typeof item === "string" ? undefined : item.icon;
                  const isSelected = currentValue === itemValue;

                  return (
                    <TouchableOpacity
                      key={`${String(itemValue)}-${index}`}
                      style={[styles.option, optionStyle]}
                      onPress={() => handleSelect(itemValue)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.radioOuter}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      {itemIcon ? (
                        <View style={styles.iconWrapper}>{itemIcon}</View>
                      ) : null}
                      <Text style={[styles.optionText, optionTextStyle]}>
                        {itemLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {errors.length > 0 && (
          <View style={{ marginTop: 5 }}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) =>
          renderDropdown(value, (itemValue) => onChange(itemValue))
        }
      />
    );
  }

  return renderDropdown(selectedValue);
};

const styles = StyleSheet.create({
  wrapper: {
    width: "98%",
  },
  label: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    marginTop: 0,
    alignSelf: "flex-start",
  },
  trigger: {
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 48,
    width: "100%",
    marginTop: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerOpen: {
    borderWidth: 1.5,
    borderColor: Colors.light.green,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
    height: "100%",
  },
  triggerIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    flex: 1,
    // iOS + emoji flags sit high/low without an explicit line box.
    ...Platform.select({
      ios: {
        lineHeight: 18,
        paddingTop: 1,
      },
      android: {
        textAlignVertical: "center" as const,
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  placeholderText: {
    color: Colors.light.icon,
    fontFamily: fonts.primary.semiBold,
    fontSize: 12,
    ...Platform.select({
      ios: {
        lineHeight: 18,
        paddingTop: 1,
      },
      android: {
        textAlignVertical: "center" as const,
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  optionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  iconWrapper: {
    marginLeft: 10,
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: Colors.light.white,
    fontSize: 14,
  },
  menu: {
    backgroundColor: Colors.light.calendarBg,
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 5,
    maxHeight: 300,
  },
  searchableMenu: {
    borderRadius: 2,
    marginTop: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  menuScroll: {
    maxHeight: 250,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.greybuttonBackground,
    marginHorizontal: 12,
    marginBottom: 6,
    height: 48,
    borderRadius: 6,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 13,
    paddingVertical: 0,
    margin: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      ios: {
        lineHeight: 18,
      },
      android: {
        textAlignVertical: "center" as const,
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  emptySearchText: {
    color: Colors.light.grey,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 13,
    marginLeft: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.grey,
    backgroundColor: Colors.light.buttonBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});

export default CustomDropdown;
