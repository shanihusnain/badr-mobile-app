import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import GoalDescriptionContent from "@/components/molecules/GoalDescriptionContent";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { HeaderWithImageAndDescription } from "@/components/atoms/HeaderWithImageAndDescription";
import {
  Icon,
  qiyamallayldetailimage,
  fivedailyprayerbottomsheetimage,
  duhaprayerdetailimage,
  istikharaprayerdetailimage,
  tawbahprayerdetailimage,
  tahiyyatwudhudetailimage,
  tahiyyatmasjiddetailimage,
  sunnahrawatibdetailimage,
  missedprayerdetailimage,
  shukarprayerdetailimage
} from "@/assets/images";
import {
  TahiyyatWudhuEyeIcon,
  TahiyyatWudhuDropIcon,
  TahiyyatWudhuShootIcon,
  TahiyyatWudhuHeartIcon,
  HadeethBookIcon,
  StarSparkleIcon
} from "@/assets/icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  GoalInfo,
  GoalReadMoreContainer,
  GoalReadMoreItem,
  GoalReadMoreTextStyle,
} from "@/src/translations/types";

type ReadMoreStyles = ReturnType<typeof createReadMoreStyles>;

const getReadMoreTextStyle = (
  style: GoalReadMoreTextStyle,
  readMoreStyles: ReadMoreStyles,
): TextStyle => {
  switch (style) {
    case "body":
      return readMoreStyles.body;
    case "bodyTight":
      return readMoreStyles.bodyTight;
    case "bodyMediumTight":
      return readMoreStyles.bodyMediumTight;
    case "bodyZero":
      return readMoreStyles.bodyZero;
    case "tableGuide":
      return readMoreStyles.tableGuide;
    case "sectionHeading":
      return readMoreStyles.sectionHeading;
    case "prayerHeading":
      return readMoreStyles.prayerHeading;
    case "quoteItalic":
      return readMoreStyles.quoteItalic;
    case "quoteSemibold":
      return readMoreStyles.quoteSemibold;
    case "quoteMediumItalic":
      return readMoreStyles.quoteMediumItalic;
    case "hadithQuoteLead":
      return readMoreStyles.hadithQuoteLead;
    case "hadithQuoteLight":
      return readMoreStyles.hadithQuoteLight;
    case "wuduBody":
      return readMoreStyles.wuduBody;
    case "wuduBodySpaced":
      return readMoreStyles.wuduBodySpaced;
    case "bilalQuote":
      return readMoreStyles.bilalQuote;
    case "bilalQuoteLight":
      return readMoreStyles.bilalQuoteLight;
    default:
      return readMoreStyles.body;
  }
};

const renderParsedContent = (content: string) => {
  if (!content) return "";
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      return (
        <Text
          key={index}
          style={{
            fontWeight: "600",
            fontFamily: fonts.primary.semiBold,
          }}
        >
          {text}
        </Text>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      const text = part.slice(1, -1);
      return (
        <Text
          key={index}
          style={{
            fontStyle: "italic",
            fontFamily: fonts.primary.regularItalic,
          }}
        >
          {text}
        </Text>
      );
    }
    return part;
  });
};

const renderReadMoreItem = (
  item: GoalReadMoreItem,
  index: number,
  textAlign: "left" | "right" | "center",
  readMoreStyles: ReadMoreStyles,
  isFirstInContainer: boolean,
) => {
  if (item.type === "prayerSection") {
    return (
      <View
        key={`prayer-${item.heading}-${index}`}
        style={[
          readMoreStyles.prayerSection,
          isFirstInContainer && index === 0 ? readMoreStyles.prayerSectionFirst : null,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", width: "100%" }}>
          <View style={{ marginRight: 8, marginTop: 1 }}>
            <StarSparkleIcon color={Colors.light.white} size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[readMoreStyles.prayerHeading, { textAlign }]}>{item.heading}</Text>
            <Text style={[readMoreStyles.body, readMoreStyles.prayerDescription, { textAlign }]}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (item.type === "benefit") {
    let BenefitIcon = null;
    if (item.heading === "Spiritual Readiness") BenefitIcon = TahiyyatWudhuEyeIcon;
    if (item.heading === "Purification") BenefitIcon = TahiyyatWudhuDropIcon;
    if (item.heading === "Intention Setting") BenefitIcon = TahiyyatWudhuShootIcon;
    if (item.heading === "Connection with Allah") BenefitIcon = TahiyyatWudhuHeartIcon;

    return (
      <View
        key={`benefit-${item.heading}-${index}`}
        style={[readMoreStyles.benefitSection, index > 0 ? readMoreStyles.blockSpacing : null]}
      >
        {BenefitIcon && (
          <View style={{ marginTop: 2, marginRight: 12 }}>
            <BenefitIcon />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[readMoreStyles.benefitHeading, { textAlign }]}>{item.heading}: <Text style={[readMoreStyles.benefitDescription, { textAlign }]}>{item.description}</Text></Text>
        </View>
      </View>
    );
  }

  if (item.type === "replyWithQuote") {
    return (
      <Text
        key={`reply-${index}`}
        style={[readMoreStyles.bilalReply, index > 0 ? readMoreStyles.blockSpacing : null, { textAlign }]}
      >
        {item.prefix}{" "}
        <Text style={readMoreStyles.bilalReplyQuote}>{item.quote}</Text>
      </Text>
    );
  }

  if (item.type === "boldPrefixText") {
    const usesQuoteSpacing =
      item.style === "quoteItalic" ||
      item.style === "quoteSemibold" ||
      item.style === "quoteMediumItalic" ||
      item.style === "hadithQuoteLead" ||
      item.style === "hadithQuoteLight";
    const spacingStyle =
      index > 0
        ? usesQuoteSpacing
          ? readMoreStyles.quoteSpacing
          : readMoreStyles.blockSpacing
        : undefined;

    const itemTextAlign = item.align || textAlign;

    return (
      <Text
        key={`bold-prefix-${index}`}
        style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
      >
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>{item.prefix} </Text>
        {renderParsedContent(item.content)}
      </Text>
    );
  }

  if (item.type === "boldSuffixText") {
    const usesQuoteSpacing =
      item.style === "quoteItalic" ||
      item.style === "quoteSemibold" ||
      item.style === "quoteMediumItalic" ||
      item.style === "hadithQuoteLead" ||
      item.style === "hadithQuoteLight";
    const spacingStyle =
      index > 0
        ? usesQuoteSpacing
          ? readMoreStyles.quoteSpacing
          : readMoreStyles.blockSpacing
        : undefined;

    const itemTextAlign = item.align || textAlign;

    return (
      <Text
        key={`bold-suffix-${index}`}
        style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
      >
        {renderParsedContent(item.content)}{" "}
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>{item.suffix}</Text>
      </Text>
    );
  }

  if (item.type === "table") {
    const headers = item.headers || [];
    const rows = item.rows || [];
    return (
      <View
        key={`table-${index}`}
        style={[
          readMoreStyles.tableContainer,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        {/* Header Row */}
        <View style={readMoreStyles.tableHeaderRow}>
          {headers.map((header: string, hIdx: number) => {
            const parts = header.split("\n");
            return (
              <View
                key={`th-${hIdx}`}
                style={[
                  readMoreStyles.tableHeaderCell,
                  hIdx < headers.length - 1 ? readMoreStyles.borderRightWhite : null,
                ]}
              >
                <Text style={readMoreStyles.tableHeaderText}>{parts[0]}</Text>
                {parts.length > 1 && (
                  <Text style={readMoreStyles.tableHeaderSubText}>{parts[1]}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Data Rows */}
        {rows.map((row: string[], rIdx: number) => (
          <View
            key={`tr-${rIdx}`}
            style={[
              readMoreStyles.tableRow,
              rIdx < rows.length - 1 ? readMoreStyles.borderBottomWhite : null,
            ]}
          >
            {row.map((cell: string, cIdx: number) => (
              <View
                key={`td-${cIdx}`}
                style={[
                  readMoreStyles.tableCell,
                  cIdx < row.length - 1 ? readMoreStyles.borderRightWhite : null,
                ]}
              >
                <Text
                  style={
                    cIdx === 0
                      ? readMoreStyles.tableCellTextWord
                      : readMoreStyles.tableCellTextCount
                  }
                >
                  {cell}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  const usesQuoteSpacing =
    item.style === "quoteItalic" ||
    item.style === "quoteSemibold" ||
    item.style === "quoteMediumItalic" ||
    item.style === "hadithQuoteLead" ||
    item.style === "hadithQuoteLight" ||
    item.style === "bilalQuoteLight";

  let spacingStyle: any =
    index > 0
      ? usesQuoteSpacing
        ? readMoreStyles.quoteSpacing
        : readMoreStyles.blockSpacing
      : undefined;

  if (item.style === "bilalQuoteLight") {
    spacingStyle = { marginTop: -2 };
  }

  const itemTextAlign = item.align || textAlign;

  if (item.style === "hadithQuoteLead" || item.style === "bilalQuote") {
    return (
      <View key={`text-${index}`} style={[{ flexDirection: "row", alignItems: "flex-start", width: "100%" }, spacingStyle]}>
        <View style={{ marginRight: 12, marginTop: item.style === "bilalQuote" ? 14 : 4 }}>
          <HadeethBookIcon />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[getReadMoreTextStyle(item.style, readMoreStyles), { textAlign: itemTextAlign, width: undefined }]}>
            {renderParsedContent(item.content)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Text
      key={`text-${index}`}
      style={[getReadMoreTextStyle(item.style, readMoreStyles), spacingStyle, { textAlign: itemTextAlign }]}
    >
      {renderParsedContent(item.content)}
    </Text>
  );
};

const renderReadMoreContainers = (
  containers: GoalReadMoreContainer[],
  textAlign: "left" | "right" | "center",
  readMoreStyles: ReadMoreStyles,
) =>
  containers.map((container, containerIndex) => (
    <GoalDescriptionContent key={`read-more-container-${containerIndex}`} textAlign={textAlign}>
      {container.items.map((item, itemIndex) =>
        renderReadMoreItem(item, itemIndex, textAlign, readMoreStyles, itemIndex === 0),
      )}
    </GoalDescriptionContent>
  ));

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();
  const readMoreStyles = createReadMoreStyles();

  const goalInfo = (t(`goalsData.${goal}`, { returnObjects: true }) || {}) as GoalInfo;

  const steps = goalInfo.steps || [];
  const readMore = goalInfo.readMore || [];
  const heroTitle = goalInfo.heroTitle || "";
  const navTitle = goalInfo.navTitle || "";
  const description = goalInfo.description || "";
  const textAlign = isRtl ? "right" : "left";

  const hasReadMoreContent = readMore.length > 0;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getImageSource = () => {
    if (goal === "qiyamalLail") return qiyamallayldetailimage;
    if (goal === "fiveDailyPrayers") return fivedailyprayerbottomsheetimage;
    if (goal === "duhaPrayer") return duhaprayerdetailimage;
    if (goal === "istikharah") return istikharaprayerdetailimage;
    if (goal === "tawbaPrayer") return tawbahprayerdetailimage;
    if (goal === "tahayyat-ul-wudhu") return tahiyyatwudhudetailimage;
    if (goal === "thayyat-ul-masjid") return tahiyyatmasjiddetailimage;
    if (goal === "sunnahRawatib") return sunnahrawatibdetailimage;
    if (goal === "missedPastPrayers") return missedprayerdetailimage;
    if (goal === "shukrPrayer") return shukarprayerdetailimage;
    return Icon;
  };

  const getImageHeight = () => {
    if (goal === "qiyamalLail") return 380;
    if (goal === "fiveDailyPrayers") return 380;
    if (goal === "duhaPrayer") return 380;
    if (goal === "istikharah") return 380;
    if (goal === "tawbaPrayer") return 380;
    if (goal === "tahayyat-ul-wudhu") return 380;
    if (goal === "thayyat-ul-masjid") return 380;
    if (goal === "sunnahRawatib") return 380;
    if (goal === "missedPastPrayers") return 380;
    if (goal === "shukrPrayer") return 380;
    return undefined;
  };

  const renderHeader = () => (
    <HeaderWithImageAndDescription
      heroTitle={heroTitle}
      navTitle={navTitle}
      description={description}
      imageSource={getImageSource()}
      imageHeight={getImageHeight()}
      onBackPress={() => navigation.goBack()}
    />
  );

  const renderReadMoreContent = () => (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 50 }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {renderHeader()}
      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
        {renderReadMoreContainers(readMore, textAlign, readMoreStyles)}
      </View>
    </ScrollView>
  );

  if (hasReadMoreContent) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.light.blackBackground }}>
        {renderReadMoreContent()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.blackBackground }}>
      <FlatList
        data={steps}
        keyExtractor={(item, index) => String(index)}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <GoalDescriptionContent lines={item.split("\n")} textAlign={textAlign} />
          </View>
        )}
      />
    </View>
  );
};

const createReadMoreStyles = () =>
  StyleSheet.create({
    body: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyTight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.3,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyMediumTight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.2,
      alignSelf: "flex-start",
      width: "100%",
    },
    bodyZero: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
    },
    tableGuide: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    sectionHeading: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 4,
    },
    prayerHeading: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 6,
    },
    quoteItalic: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regularItalic,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    quoteSemibold: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    quoteMediumItalic: {
      color: Colors.light.white,
      fontFamily: fonts.primary.mediumItalic,
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    hadithQuoteLead: {
      color: Colors.light.white,
      fontSize: 14,
      fontWeight: "500",
      fontStyle: "italic",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    hadithQuoteLight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.lightItalic,
      fontSize: 14,
      fontWeight: "400",
      fontStyle: "italic",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
      marginBottom: 12,
    },
    wuduBody: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    wuduBodySpaced: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 16,
    },
    bilalQuote: {
      color: Colors.light.white,
      fontFamily: fonts.primary.medium,
      fontWeight: "500",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 12,
    },
    bilalQuoteLight: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.1,
      alignSelf: "flex-start",
      width: "100%",
    },
    bilalReply: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      alignSelf: "flex-start",
      width: "100%",
      marginTop: 12,
    },
    bilalReplyQuote: {
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: Colors.light.white,
    },
    benefitSection: {
      width: "100%",
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "flex-start",
    },
    benefitHeading: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      lineHeight: 22,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    benefitDescription: {
      color: Colors.light.white,
      fontSize: 14,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      lineHeight: 22,
      alignSelf: "flex-start",
      width: "100%",
    },
    blockSpacing: {
      marginTop: 12,
    },
    quoteSpacing: {
      marginTop: 8,
    },
    prayerSection: {
      width: "100%",
      marginTop: 16,
      alignSelf: "flex-start",
    },
    prayerSectionFirst: {
      marginTop: 0,
    },
    prayerDescription: {
      marginTop: 0,
    },
    tableContainer: {
      width: "100%",
      borderWidth: 1,
      borderColor: Colors.light.white,
      borderRadius: 1,
      overflow: "hidden",
      marginTop: 12,
    },
    tableHeaderRow: {
      flexDirection: "row",
      //backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderBottomWidth: 1,
      borderColor: Colors.light.white,
    },
    tableHeaderCell: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    tableHeaderText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 10,
      textAlign: "center",
      lineHeight: 12,
    },
    tableHeaderSubText: {
      color: Colors.light.white,
      fontFamily: fonts.primary.regular,
      fontWeight: "400",
      fontSize: 8,
      textAlign: "center",
      lineHeight: 10,
      marginTop: 2,
    },
    tableRow: {
      flexDirection: "row",
    },
    tableCell: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    tableCellTextWord: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 10,
      textAlign: "center",
      lineHeight: 12,
    },
    tableCellTextCount: {
      color: Colors.light.white,
      fontFamily: fonts.primary.semiBold,
      fontWeight: "600",
      fontSize: 12,
      textAlign: "center",
      lineHeight: 14,
    },
    borderRightWhite: {
      borderRightWidth: 1,
      borderColor: Colors.light.white,
    },
    borderBottomWhite: {
      borderBottomWidth: 1,
      borderColor: Colors.light.white,
    },
  });

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
});
