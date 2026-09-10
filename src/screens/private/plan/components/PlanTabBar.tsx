import { Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { planStyles as styles } from "../styles";

type PlanTab = {
  id: number;
  title: string;
};

type PlanTabBarProps = {
  tabs: PlanTab[];
  selectedTab: number;
  onSelectTab: (tabId: number) => void;
  scrollable?: boolean;
};

function renderTabItems(
  tabs: PlanTab[],
  selectedTab: number,
  onSelectTab: (tabId: number) => void,
  scrollable: boolean,
) {
  return tabs.map((item) => {
    const isActive = selectedTab === item.id;

    return (
      <Pressable
        key={item.id}
        onPress={() => onSelectTab(item.id)}
        style={[
          styles.tabButton,
          scrollable && styles.tabButtonScrollable,
          isActive && styles.tabButtonActive,
        ]}
      >
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {item.title.toLocaleUpperCase()}
        </Text>
      </Pressable>
    );
  });
}

export function PlanTabBar({
  tabs,
  selectedTab,
  onSelectTab,
  scrollable = false,
}: PlanTabBarProps) {
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        directionalLockEnabled
        style={styles.journalTabScroll}
        contentContainerStyle={styles.tabBarScrollContent}
      >
        {renderTabItems(tabs, selectedTab, onSelectTab, true)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.tabBarRow}>
      {renderTabItems(tabs, selectedTab, onSelectTab, false)}
    </View>
  );
}
