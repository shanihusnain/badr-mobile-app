import PrimaryButton from "@/components/atoms/Primary-button";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useState } from "react";
import { Alert, Pressable, Share, Text, View } from "react-native";
import { teamProfileStyles as styles } from "../styles";

type InviteMemberSheetProps = {
  inviteCode: string;
  referralCode: string;
  onClose: () => void;
};

export const InviteMemberSheet = forwardRef<BottomSheet, InviteMemberSheetProps>(
  function InviteMemberSheet({ inviteCode, referralCode, onClose }, ref) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      try {
        await Share.share({ message: inviteCode });
        setCopied(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unable to share code";
        Alert.alert(message);
      }
    }, [inviteCode]);

    const handleShareReferral = useCallback(async () => {
      try {
        await Share.share({
          message: `Join me on Badr with my referral code ${referralCode} and get 1 month free.`,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unable to share referral";
        Alert.alert(message);
      }
    }, [referralCode]);

    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["58%"]}
        bgColor={Colors.light.blackBackground}
        onClose={onClose}
      >
        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>INVITE AN EXISTING MEMBER</Text>
          <Text style={styles.inviteDescription}>
            Share your code with family and friends who share your goals and
            invite them to join your team.
          </Text>
          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>
            <Pressable style={styles.copyButton} onPress={handleCopy}>
              <Text style={styles.copyButtonText}>
                {copied ? "COPIED" : "COPY"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inviteDivider} />

        <View style={styles.inviteSection}>
          <Text style={styles.inviteTitle}>REFER A NEW MEMBER</Text>
          <Text style={styles.inviteDescription}>
            Refer a family member or a friend to Badr and get 1-month free when
            they sign up. They&apos;ll also get 1-month of membership free.
          </Text>
          <PrimaryButton
            text="SHARE REFERAL CODE"
            onPress={handleShareReferral}
          />
        </View>
      </BottomSheetWrapper>
    );
  },
);
