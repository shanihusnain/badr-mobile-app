import { ProfileInformationIcon } from "@/assets/icons";
import MoreActionButton from "@/components/atoms/MoreActionButton";
import { BottomSheetWrapper } from "@/components/molecules/BottomSheetWrapper";
import { Colors } from "@/constants/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { View } from "react-native";
import { teamProfileStyles as styles } from "../styles";

type TeamOptionsSheetProps = {
  onClose: () => void;
  onAddMember: () => void;
  onNotificationSettings: () => void;
  onManageTeam: () => void;
};

export const TeamOptionsSheet = forwardRef<BottomSheet, TeamOptionsSheetProps>(
  function TeamOptionsSheet(
    { onClose, onAddMember, onNotificationSettings, onManageTeam },
    ref,
  ) {
    return (
      <BottomSheetWrapper
        ref={ref}
        snapPoints={["38%"]}
        bgColor={Colors.light.blackBackground}
        onClose={onClose}
      >
        <View style={styles.sheetContent}>
          <MoreActionButton
            title="ADD TEAM MEMBER"
            icon={
              <ProfileInformationIcon size={24} Color={Colors.light.white} />
            }
            variant="outline"
            onPress={onAddMember}
          />
          <MoreActionButton
            title="NOTIFICATION SETTINGS"
            icon="bell"
            variant="sheet"
            onPress={onNotificationSettings}
          />
          <MoreActionButton
            title="MANAGE TEAM"
            icon="edit-2"
            variant="sheet"
            onPress={onManageTeam}
          />
        </View>
      </BottomSheetWrapper>
    );
  },
);
