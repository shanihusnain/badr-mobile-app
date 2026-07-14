import PrimaryButton from "@/components/atoms/Primary-button";
import { createTeamImage } from "@/assets/images";
import { Colors } from "@/constants/theme";
import { ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createTeamStyles as styles } from "../styles";

const HEADER_HEIGHT = 100;

type ChooseTeamNameStepProps = {
  teamName: string;
  onChangeTeamName: (value: string) => void;
  onNext: () => void;
};

export function ChooseTeamNameStep({
  teamName,
  onChangeTeamName,
  onNext,
}: ChooseTeamNameStepProps) {
  const insets = useSafeAreaInsets();
  const teamNameInputRef = useRef<TextInput>(null);

  const focusTeamNameInput = () => {
    teamNameInputRef.current?.focus();
  };

  return (
    <View style={styles.screen}>
      <Pressable style={styles.heroPressArea} onPress={focusTeamNameInput}>
        <ImageBackground
          source={createTeamImage}
          style={styles.heroImage}
          contentFit="cover"
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(8, 26, 47, 0.55)",
              "rgba(8, 26, 47, 0.92)",
              Colors.light.blackBackground,
            ]}
            locations={[0, 0.45, 0.75, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </ImageBackground>
      </Pressable>

      <LinearGradient
        colors={["transparent", Colors.light.blackBackground]}
        locations={[0, 0.35]}
        style={styles.bottomShade}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        pointerEvents="box-none"
      >
        <View
          pointerEvents="box-none"
          style={[
            styles.nameContent,
            {
              paddingTop: HEADER_HEIGHT + 24,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          <Pressable style={styles.inputWrap} onPress={focusTeamNameInput}>
            <TextInput
              ref={teamNameInputRef}
              value={teamName}
              onChangeText={(text) => onChangeTeamName(text.toUpperCase())}
              placeholder="TEAM NAME"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onNext}
              textAlign="center"
              selectionColor={Colors.light.green}
              style={[
                styles.teamNameInput,
                Platform.OS === "android"
                  ? { textAlignVertical: "center" as const }
                  : null,
                {
                  width: Math.min(
                    340,
                    Math.max(180, (teamName.length || 9) * 18),
                  ),
                },
              ]}
            />
          </Pressable>

          <PrimaryButton
            text="NEXT"
            onPress={onNext}
            disabled={!teamName.trim()}
            style={!teamName.trim() ? styles.nextButtonDisabled : undefined}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
