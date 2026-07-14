import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { teamProfileStyles as styles } from "../styles";

type TeamTab = "info" | "rank" | "chat";

type TeamProfileTabsProps = {
  activeTab: TeamTab;
  middleTabLabel: string;
  /** Highlight VIEW RANK while the metric dropdown is open over INFO. */
  rankHighlighted?: boolean;
  onInfoPress: () => void;
  onRankPress: () => void;
  onChatPress: () => void;
};

export function TeamProfileTabs({
  activeTab,
  middleTabLabel,
  rankHighlighted = false,
  onInfoPress,
  onRankPress,
  onChatPress,
}: TeamProfileTabsProps) {
  const rankActive = activeTab === "rank" || rankHighlighted;

  return (
    <View style={styles.tabsRow}>
      <Pressable
        style={[
          styles.tab,
          activeTab === "info" && !rankHighlighted && styles.tabActive,
        ]}
        onPress={onInfoPress}
      >
        <Text
          style={[
            styles.tabText,
            (activeTab !== "info" || rankHighlighted) && styles.tabTextInactive,
          ]}
        >
          INFO
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tab,
          styles.tabWithChevron,
          rankActive && styles.tabActive,
          rankActive && activeTab === "rank" && styles.tabRankActive,
        ]}
        onPress={onRankPress}
      >
        <Text
          style={[
            styles.tabText,
            !rankActive && styles.tabTextInactive,
            activeTab === "rank" && !rankHighlighted && styles.tabTextRank,
          ]}
          numberOfLines={1}
        >
          {middleTabLabel}
        </Text>
        <Feather
          name={rankHighlighted ? "chevron-up" : "chevron-down"}
          size={14}
          color={Colors.light.white}
        />
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === "chat" && styles.tabActive]}
        onPress={onChatPress}
      >
        <Text
          style={[
            styles.tabText,
            activeTab !== "chat" && styles.tabTextInactive,
          ]}
        >
          CHAT
        </Text>
      </Pressable>
    </View>
  );
}
