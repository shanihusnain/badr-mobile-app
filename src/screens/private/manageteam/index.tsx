import { PencilIcon } from "@/assets/icons";
import { HeaderWithCrossTitleDynamicIcon } from "@/components/atoms/HeaderWithCrossTitleDynamicIcon";
import SecondaryButton from "@/components/atoms/Secondary-button";
import WarningModal from "@/components/atoms/WarningModal";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeaderboardToggleRow } from "../createteam/components/LeaderboardToggleRow";
import {
  CURRENT_USER,
  EXTRA_TEAM_MEMBERS,
  type TeamMember,
} from "../teamprofile/mockData";
import { MemberPickerSheet } from "./components/MemberPickerSheet";
import { manageTeamStyles as styles } from "./styles";

const ABOUT_MAX = 150;

export const ManageTeam = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    teamName?: string;
    bannerUri?: string;
    logoUri?: string;
    description?: string;
    teamChatEnabled?: string;
  }>();

  const initialDescription = params.description ?? "";
  const initialDescriptionRef = useRef(initialDescription);

  const [bannerUri, setBannerUri] = useState(
    params.bannerUri ??
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
  );
  const [logoUri, setLogoUri] = useState(
    params.logoUri ??
      "https://images.unsplash.com/photo-1585036156171-3841649478f8?w=200",
  );
  const [teamName, setTeamName] = useState(params.teamName ?? "Badr's Team");
  const [description, setDescription] = useState(initialDescription);
  const [teamChatEnabled, setTeamChatEnabled] = useState(
    params.teamChatEnabled !== "0",
  );
  const [members, setMembers] = useState<TeamMember[]>([
    CURRENT_USER,
    ...EXTRA_TEAM_MEMBERS,
  ]);

  const [pickerMode, setPickerMode] = useState<"transfer" | "remove">(
    "transfer",
  );
  const [pendingTransferMember, setPendingTransferMember] =
    useState<TeamMember | null>(null);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [saveChangesVisible, setSaveChangesVisible] = useState(false);
  const allowLeaveRef = useRef(false);

  const memberSheetRef = useRef<BottomSheet>(null);

  const isAboutOverLimit = description.length > ABOUT_MAX;
  const isDescriptionDirty =
    description.trim() !== initialDescriptionRef.current.trim();

  const otherMembers = useMemo(
    () => members.filter((member) => !member.isAdmin),
    [members],
  );

  const leaveScreen = useCallback(() => {
    allowLeaveRef.current = true;
    setSaveChangesVisible(false);
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    router.back();
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    if (isDescriptionDirty) {
      setSaveChangesVisible(true);
      return;
    }
    leaveScreen();
  }, [isDescriptionDirty, leaveScreen]);

  const handleSaveChanges = useCallback(() => {
    console.log("Save team description to backend:", {
      teamName,
      description: description.trim(),
    });
    initialDescriptionRef.current = description.trim();
    leaveScreen();
  }, [description, leaveScreen, teamName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: ({ navigation: nav }: { navigation: typeof navigation }) => (
        <HeaderWithCrossTitleDynamicIcon
          title="MANAGE TEAM"
          navigation={nav}
          bgcolor="transparent"
          iconName="chevron-left"
          onBackPress={handleBackPress}
        />
      ),
    });
  }, [handleBackPress, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (allowLeaveRef.current || !isDescriptionDirty) {
        return;
      }
      event.preventDefault();
      setSaveChangesVisible(true);
    });
    return unsubscribe;
  }, [isDescriptionDirty, navigation]);

  const pickImage = useCallback(async (target: "banner" | "logo") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    if (target === "banner") setBannerUri(result.assets[0].uri);
    else setLogoUri(result.assets[0].uri);
  }, []);

  const openMemberSheet = useCallback((mode: "transfer" | "remove") => {
    setPickerMode(mode);
    setPendingTransferMember(null);
    requestAnimationFrame(() => {
      memberSheetRef.current?.expand();
    });
  }, []);

  const handleLeavePress = useCallback(() => {
    if (otherMembers.length > 0) {
      setTransferModalVisible(true);
      return;
    }
    setLeaveModalVisible(true);
  }, [otherMembers.length]);

  const handleSelectMember = useCallback(
    (member: TeamMember) => {
      if (pickerMode === "remove") {
        setMembers((current) =>
          current.filter((item) => item.id !== member.id),
        );
        memberSheetRef.current?.close();
        return;
      }
      setPendingTransferMember(member);
    },
    [pickerMode],
  );

  const handleConfirmTransfer = useCallback(() => {
    if (!pendingTransferMember) return;
    setMembers((current) =>
      current.map((member) => ({
        ...member,
        isAdmin: member.id === pendingTransferMember.id,
      })),
    );
    setPendingTransferMember(null);
    memberSheetRef.current?.close();
    setLeaveModalVisible(true);
  }, [pendingTransferMember]);

  const handleLeaveTeam = useCallback(() => {
    setLeaveModalVisible(false);
    allowLeaveRef.current = true;
    router.replace("/(tabs)/(connect)");
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Image
            source={{ uri: bannerUri }}
            style={styles.banner}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              "transparent",
              "rgba(8, 26, 47, 0.15)",
              "rgba(8, 26, 47, 0.55)",
              "rgba(8, 26, 47, 0.9)",
              Colors.light.blackBackground,
            ]}
            locations={[0, 0.35, 0.58, 0.8, 1]}
            style={styles.bannerGradient}
            pointerEvents="none"
          />

          <Pressable
            style={styles.editBannerRow}
            onPress={() => pickImage("banner")}
          >
            <View style={styles.editIconCircle}>
              <Feather name="edit-2" size={14} color={Colors.light.white} />
            </View>
            <Text style={styles.editBannerText}>EDIT YOUR BANNER</Text>
          </Pressable>
        </View>

        <View style={styles.identityRow}>
          <Pressable style={styles.logoWrap} onPress={() => pickImage("logo")}>
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              contentFit="cover"
            />
            <View style={styles.logoEditBadge} pointerEvents="none">
              <View style={styles.logoEditCircle}>
                <PencilIcon color={Colors.light.white} size={12} />
              </View>
            </View>
          </Pressable>

          <View style={styles.nameCard}>
            <Text style={styles.nameLabel}>TEAM NAME</Text>
            <TextInput
              style={styles.nameInput}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Team name"
              placeholderTextColor={Colors.light.subtext}
            />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <TextInput
            style={[
              styles.aboutInput,
              isAboutOverLimit && styles.aboutInputError,
            ]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Add a short description for your team"
            placeholderTextColor={Colors.light.subtext}
          />
          <Text
            style={[
              styles.charCount,
              isAboutOverLimit && styles.charCountError,
            ]}
          >
            {description.length}/{ABOUT_MAX}
          </Text>

          <View style={styles.chatRow}>
            <LeaderboardToggleRow
              label="TEAM CHAT"
              enabled={teamChatEnabled}
              onToggle={() => setTeamChatEnabled((value) => !value)}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footerActions,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <SecondaryButton
          text="REMOVE MEMBER"
          variant="white"
          style={styles.removeMemberButton}
          textStyle={styles.removeMemberButtonText}
          onPress={() => openMemberSheet("remove")}
        />
        <SecondaryButton
          text="LEAVE AND DELETE TEAM"
          variant="green"
          onPress={handleLeavePress}
        />
      </View>

      <MemberPickerSheet
        ref={memberSheetRef}
        members={members}
        mode={pickerMode}
        onClose={() => {
          setPendingTransferMember(null);
          memberSheetRef.current?.close();
        }}
        onSelectMember={handleSelectMember}
        pendingTransferMember={pendingTransferMember}
        onConfirmTransfer={handleConfirmTransfer}
        onCancelTransfer={() => setPendingTransferMember(null)}
      />

      <WarningModal
        visible={saveChangesVisible}
        title="SAVE YOUR CHANGES?"
        primaryButtonText="Yes"
        secondaryButtonText="Cancel"
        primaryButtonVariant="green"
        primaryButtonStyle={styles.saveYesButton}
        primaryButtonTextStyle={styles.saveYesButtonText}
        secondaryButtonTextStyle={styles.saveCancelText}
        onPrimaryPress={handleSaveChanges}
        onSecondaryPress={() => setSaveChangesVisible(false)}
        onBackdropPress={() => setSaveChangesVisible(false)}
      />

      <WarningModal
        visible={transferModalVisible}
        title="TRANSFER OWNERSHIP"
        message="Since you're the team admin, transfer ownership to another member before leaving the team."
        primaryButtonText="Continue"
        secondaryButtonText="Cancel"
        onPrimaryPress={() => {
          setTransferModalVisible(false);
          openMemberSheet("transfer");
        }}
        onSecondaryPress={() => setTransferModalVisible(false)}
        onBackdropPress={() => setTransferModalVisible(false)}
      />

      <WarningModal
        visible={leaveModalVisible}
        title="LEAVE TEAM?"
        message="This will delete the team permanently."
        primaryButtonText="Yes"
        secondaryButtonText="Cancel"
        onPrimaryPress={handleLeaveTeam}
        onSecondaryPress={() => setLeaveModalVisible(false)}
        onBackdropPress={() => setLeaveModalVisible(false)}
      />
    </View>
  );
};
