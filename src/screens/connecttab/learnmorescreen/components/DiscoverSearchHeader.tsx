import { fonts } from "@/assets/fonts";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DiscoverSearchHeaderProps = {
  onChangeText: (text: string) => void;
  onCancel: () => void;
};

export function DiscoverSearchHeader({
  onChangeText,
  onCancel,
}: DiscoverSearchHeaderProps) {
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  const handleChangeText = (text: string) => {
    setValue(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <Feather name="search" size={16} color={Colors.light.white} />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChangeText}
            placeholder="Search"
            placeholderTextColor={Colors.light.subtext}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.blackBackground,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.greybuttonBackground,
    borderRadius: 22,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  input: {
    flex: 1,
    color: Colors.light.white,
    fontFamily: fonts.primary.regular,
    fontSize: 14,
    paddingVertical: 8,
  },
  cancelText: {
    color: Colors.light.white,
    fontFamily: fonts.primary.medium,
    fontSize: 14,
    fontWeight: "500",
  },
});
