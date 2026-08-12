import { BlackScreenWrapper } from "@/components/atoms/BlackScreenWrapper";
import GoalDescriptionContent from "@/components/molecules/GoalDescriptionContent";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, type ComponentType } from "react";
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
  shukarprayerdetailimage,
  missedramadanfastsbottomsheetimage,
  thefastsofprophetdawoodbottomsheetimage,
  mondayandthursdayfastsbottomsheetimage,
  whitedaysfastsbottomsheetimage,
  quranlisteningbottomsheetimage,
  quranrecitationbottomsheetimage,
  quranmemorizationbottomsheetimage,
  qurantajweedbottomsheetimage,
  missedzakatbottomsheetimage,
  kaffarahbottomsheetimage,
  fidyabottomsheetimage,
  lillahdonationbottomsheetimage,
  volunteeringservicesbottomsheetimage,
  sadaqahjariyahbottomsheetimage,
} from "@/assets/images";
import {
  TahiyyatWudhuEyeIcon,
  TahiyyatWudhuDropIcon,
  TahiyyatWudhuShootIcon,
  TahiyyatWudhuHeartIcon,
  HadeethBookIcon,
  StarSparkleIcon,
  FajarSunIcon,
  DuhrSunIcon,
  MaghribSunIcon,
  IshaMoonIcon,
  DuhaPrayerStar,
  ManPrayerIcon,
  FajrFardPrayerIcon,
  DhuharFardPrayerIcon,
  AsrFardPrayerIcon,
  MaghrebFardPrayerIcon,
  IshaFardPrayerIcon,
  QuranImageIcon,
  IstikharaClockIcon,
  ManDuaIcon,
  QuranListeningMoon,
  QuranMemorizationIcon,
  QuranTajweedIcon,
  MissedRamadanFastsHandsIcon,
  MissedRamadanFastsPlatesIcon,
  ProphetDawoodFastsConnectionWithAllah,
  ProphetDawoodFastsMoonAndHandIcon,
  ProphetDawoodFastsHeartIcon,
  ProphetDawoodMindfullnessIcon,
  ProphetDawoodGratitudeIcon,
  ProphetDawoodMentalHealthIcon,
  ProphetDawoodHeartBreakIcon,
  ProphetDawoodPersonalDevelopmentIcon,
  ProphetDawoodBalanceIcon,
  MondayAndThursdayFastsHabitualIcon,
  MondayAndThursdayAllahRememberenceIcon,
  DashBoardHandHeartIcon,
  HeartBreakIcon,
  MissedZakatAccountabilityIcon,
  MissedZakatSocialIcon,
  MissedZakatCalculateIcon,
  LillahDonationGiverIcon,
  LillahDonationRecipientIcon,
  VolunteeringServicesCharityEventIcon,
  SadaqahJariyahEducationalIcon,
  SadaqahJariyahMedicalAidIcon,
  SadaqahJariyahSpirtualIcon,
  SadaqahJariyahWaterWellIcon,
  SadaqahJariyahSponsoringOrphanIcon,
  SadaqahJariyahMosqueIcon,
  SadaqahJariyahReligiousIcon,
  SadaqahJariyahTreePlantIcon,
  SadaqahJariyahCloathIcon,
} from "@/assets/icons";
import { Colors } from "@/constants/theme";
import { fonts } from "@/assets/fonts";
import {
  GoalInfo,
  GoalReadMoreContainer,
  GoalReadMoreItem,
  GoalReadMoreTextStyle,
} from "@/src/translations/types";

import { isPrayerGoalKey, resolvePrayerUiId } from "@/src/utils/prayerGoalMap";
import { isQuranGoalKey, resolveQuranUiId } from "@/src/utils/quranGoalMap";
import {
  isFastingGoalKey,
  resolveFastingUiId,
} from "@/src/utils/fastingGoalMap";
import {
  getSadaqahDetailImage,
  isSadaqahGoalKey,
  resolveSadaqahUiId,
} from "@/src/utils/sadaqahGoalMap";
import { getAccessToken } from "@/src/storage/tokenStorage";
import { createReadMoreStyles, styles } from "./styles";
type ReadMoreStyles = ReturnType<typeof createReadMoreStyles>;

const READ_MORE_ICON_MAP: Record<string, ComponentType<any>> = {
  FajarSunIcon,
  HadeethBookIcon,
  DuhaPrayerStar,
  ManPrayerIcon,
  QuranImageIcon,
  IstikharaClockIcon,
  ManDuaIcon,
  QuranListeningMoon,
  QuranMemorizationIcon,
  QuranTajweedIcon,
  MissedRamadanFastsHandsIcon,
  MissedRamadanFastsPlatesIcon,
  ProphetDawoodFastsConnectionWithAllah,
  ProphetDawoodFastsMoonAndHandIcon,
  ProphetDawoodFastsHeartIcon,
  ProphetDawoodMindfullnessIcon,
  ProphetDawoodGratitudeIcon,
  ProphetDawoodMentalHealthIcon,
  ProphetDawoodHeartBreakIcon,
  ProphetDawoodPersonalDevelopmentIcon,
  ProphetDawoodBalanceIcon,
  MondayAndThursdayFastsHabitualIcon,
  MondayAndThursdayAllahRememberenceIcon,
  DashBoardHandHeartIcon,
  HeartBreakIcon,
  StarSparkleIcon,
  FajrFardPrayerIcon,
  DhuharFardPrayerIcon,
  AsrFardPrayerIcon,
  MaghrebFardPrayerIcon,
  IshaFardPrayerIcon,
  MissedZakatAccountabilityIcon,
  MissedZakatSocialIcon,
  MissedZakatCalculateIcon,
  LillahDonationGiverIcon,
  LillahDonationRecipientIcon,
  VolunteeringServicesCharityEventIcon,
  SadaqahJariyahEducationalIcon,
  SadaqahJariyahMedicalAidIcon,
  SadaqahJariyahSpirtualIcon,
  SadaqahJariyahWaterWellIcon,
  SadaqahJariyahSponsoringOrphanIcon,
  SadaqahJariyahMosqueIcon,
  SadaqahJariyahReligiousIcon,
  SadaqahJariyahTreePlantIcon,
  SadaqahJariyahCloathIcon,
};

const resolveReadMoreIcon = (iconName?: string) =>
  iconName ? (READ_MORE_ICON_MAP[iconName] ?? null) : null;

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
const token = getAccessToken();
console.log("token", token);
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
    let PrayerIcon: React.ComponentType<{
      color?: string;
      size?: number;
    }> | null = null;
    if (item.heading === "Fajr Prayer") PrayerIcon = FajarSunIcon;
    else if (item.heading === "Dhuhr Prayer") PrayerIcon = DuhrSunIcon;
    else if (item.heading === "Maghrib Prayer") PrayerIcon = MaghribSunIcon;
    else if (item.heading === "Isha Prayer") PrayerIcon = IshaMoonIcon;

    return (
      <View
        key={`prayer-${item.heading}-${index}`}
        style={[
          readMoreStyles.prayerSection,
          isFirstInContainer && index === 0
            ? readMoreStyles.prayerSectionFirst
            : null,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        <Text style={[readMoreStyles.prayerHeading, { textAlign }]}> 
          {item.heading}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
            marginTop: 4,
          }}
        >
          <View style={{ marginRight: 12, marginTop: 2 }}>
            {PrayerIcon ? (
              <PrayerIcon color={Colors.light.dullWhite} size={28} />
            ) : (
              <StarSparkleIcon color={Colors.light.white} size={24} />
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={[
                readMoreStyles.body,
                readMoreStyles.prayerDescription,
                { textAlign, width: undefined, flexShrink: 1 },
              ]}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (item.type === "benefit") {
    let BenefitIcon = null;
    if (item.heading === "Spiritual Readiness")
      BenefitIcon = TahiyyatWudhuEyeIcon;
    if (item.heading === "Purification") BenefitIcon = TahiyyatWudhuDropIcon;
    if (item.heading === "Intention Setting")
      BenefitIcon = TahiyyatWudhuShootIcon;
    if (item.heading === "Connection with Allah")
      BenefitIcon = TahiyyatWudhuHeartIcon;

    return (
      <View
        key={`benefit-${item.heading}-${index}`}
        style={[
          readMoreStyles.benefitSection,
          index > 0 ? readMoreStyles.blockSpacing : null,
        ]}
      >
        {BenefitIcon && (
          <View style={{ marginTop: 2, marginRight: 12 }}>
            <BenefitIcon />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[readMoreStyles.benefitHeading, { textAlign }]}>
            {item.heading}:{" "}
            <Text style={[readMoreStyles.benefitDescription, { textAlign }]}>
              {item.description}
            </Text>
          </Text>
        </View>
      </View>
    );
  }

  if (item.type === "replyWithQuote") {
    return (
      <Text
        key={`reply-${index}`}
        style={[
          readMoreStyles.bilalReply,
          index > 0 ? readMoreStyles.blockSpacing : null,
          { textAlign },
        ]}
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

    const IconComp = resolveReadMoreIcon(item.icon);

    if (IconComp) {
      let iconColor =
        item.icon === "QuranImageIcon"
          ? Colors.light.green
          : Colors.light.dullWhite;
      let iconSize = 30;
      return (
        <View
          key={`bold-prefix-${index}`}
          style={[
            { flexDirection: "row", alignItems: "flex-start", width: "100%" },
            spacingStyle,
          ]}
        >
          <View style={{ marginRight: 12, marginTop: 4 }}>
            <IconComp color={iconColor} size={iconSize} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                getReadMoreTextStyle(item.style, readMoreStyles),
                { textAlign: itemTextAlign, width: undefined },
              ]}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontFamily: fonts.primary.semiBold,
                }}
              >
                {item.prefix}{" "}
              </Text>
              {renderParsedContent(item.content)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text
        key={`bold-prefix-${index}`}
        style={[
          getReadMoreTextStyle(item.style, readMoreStyles),
          spacingStyle,
          { textAlign: itemTextAlign },
        ]}
      >
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>
          {item.prefix}{" "}
        </Text>
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

    const IconComp = resolveReadMoreIcon(item.icon);

    if (IconComp) {
      let iconColor =
        item.icon === "QuranImageIcon"
          ? Colors.light.green
          : Colors.light.dullWhite;
      let iconSize = 30;
      return (
        <View
          key={`bold-suffix-${index}`}
          style={[
            { flexDirection: "row", alignItems: "flex-start", width: "100%" },
            spacingStyle,
          ]}
        >
          <View style={{ marginRight: 12, marginTop: 4 }}>
            <IconComp color={iconColor} size={iconSize} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                getReadMoreTextStyle(item.style, readMoreStyles),
                { textAlign: itemTextAlign, width: undefined },
              ]}
            >
              {renderParsedContent(item.content)}{" "}
              <Text
                style={{
                  fontWeight: "600",
                  fontFamily: fonts.primary.semiBold,
                }}
              >
                {item.suffix}
              </Text>
            </Text>
          </View>
        </View>
      );
    }

    return (
      <Text
        key={`bold-suffix-${index}`}
        style={[
          getReadMoreTextStyle(item.style, readMoreStyles),
          spacingStyle,
          { textAlign: itemTextAlign },
        ]}
      >
        {renderParsedContent(item.content)}{" "}
        <Text style={{ fontWeight: "600", fontFamily: fonts.primary.semiBold }}>
          {item.suffix}
        </Text>
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
                  hIdx < headers.length - 1
                    ? readMoreStyles.borderRightWhite
                    : null,
                ]}
              >
                <Text style={readMoreStyles.tableHeaderText}>{parts[0]}</Text>
                {parts.length > 1 && (
                  <Text style={readMoreStyles.tableHeaderSubText}>
                    {parts[1]}
                  </Text>
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
                  cIdx < row.length - 1
                    ? readMoreStyles.borderRightWhite
                    : null,
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

  let IconComponent =
    item.type === "text" ? resolveReadMoreIcon(item.icon) : null;
  if (
    !IconComponent &&
    (item.style === "hadithQuoteLead" ||
      item.style === "bilalQuote" ||
      item.style === "quoteMediumItalic" ||
      item.style === "quoteItalic" ||
      item.style === "quoteSemibold")
  ) {
    IconComponent = HadeethBookIcon;
  }

  if (IconComponent) {
    let iconColor: string =
      item.icon === "QuranImageIcon" ||
      item.icon === "HadeethBookIcon" ||
      IconComponent === HadeethBookIcon
        ? Colors.light.green
        : Colors.light.dullWhite;
    let iconSize =
      item.icon === "FajarSunIcon" || item.icon === "DuhaPrayerStar" ? 28 : 30;

    return (
      <View
        key={`text-${index}`}
        style={[
          {
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
          },
          spacingStyle,
        ]}
      >
        <View
          style={{
            marginRight: 12,
            marginTop: item.style === "bilalQuote" ? 14 : 4,
          }}
        >
          <IconComponent color={iconColor} size={iconSize} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[
              getReadMoreTextStyle(item.style, readMoreStyles),
              { textAlign: itemTextAlign, width: undefined, flexShrink: 1 },
            ]}
          >
            {renderParsedContent(item.content)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Text
      key={`text-${index}`}
      style={[
        getReadMoreTextStyle(item.style, readMoreStyles),
        spacingStyle,
        { textAlign: itemTextAlign },
      ]}
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
    <GoalDescriptionContent
      key={`read-more-container-${containerIndex}`}
      textAlign={textAlign}
    >
      {container.items.map((item, itemIndex) =>
        renderReadMoreItem(
          item,
          itemIndex,
          textAlign,
          readMoreStyles,
          itemIndex === 0,
        ),
      )}
    </GoalDescriptionContent>
  ));

export const GoalDescriptionDetails = ({ goal }: { goal: string }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigation = useNavigation();
  const readMoreStyles = createReadMoreStyles();
  const isPrayerGoal = isPrayerGoalKey(goal);
  const isQuranGoal = isQuranGoalKey(goal);
  const isFastingGoal = isFastingGoalKey(goal);
  const isSadaqahGoal = isSadaqahGoalKey(goal);
  const goalUiId = isSadaqahGoal
    ? resolveSadaqahUiId(goal)
    : isFastingGoal
      ? resolveFastingUiId(goal)
      : isQuranGoal
        ? resolveQuranUiId(goal)
        : resolvePrayerUiId(goal);

  const isLoadingDetail = false;

  const localGoalInfo = (t(`goalsData.${goalUiId}`, {
    returnObjects: true,
  }) || {}) as GoalInfo;

  const goalInfo: GoalInfo = localGoalInfo;

  const steps = goalInfo.steps || [];
  const readMore = goalInfo.readMore || [];
  const heroTitle = goalInfo.heroTitle || "";
  const navTitle = goalInfo.navTitle || "";
  const description = goalInfo.description || "";
  const summaryDescription = goalInfo.summaryDescription || "";
  const textAlign = isRtl ? "right" : "left";

  const hasReadMoreContent = readMore.length > 0;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getImageSource = () => {
    if (goalUiId === "qiyamalLail") return qiyamallayldetailimage;
    if (goalUiId === "fiveDailyPrayers") return fivedailyprayerbottomsheetimage;
    if (goalUiId === "duhaPrayer") return duhaprayerdetailimage;
    if (goalUiId === "istikharah") return istikharaprayerdetailimage;
    if (goalUiId === "tawbaPrayer") return tawbahprayerdetailimage;
    if (goalUiId === "tahayyat-ul-wudhu") return tahiyyatwudhudetailimage;
    if (goalUiId === "thayyat-ul-masjid") return tahiyyatmasjiddetailimage;
    if (goalUiId === "sunnahRawatib") return sunnahrawatibdetailimage;
    if (goalUiId === "missedPastPrayers") return missedprayerdetailimage;
    if (goalUiId === "shukrPrayer") return shukarprayerdetailimage;
    if (goalUiId === "quran-listening") return quranlisteningbottomsheetimage;
    if (goalUiId === "quran-recitation") return quranrecitationbottomsheetimage;
    if (goalUiId === "quran-memorization")
      return quranmemorizationbottomsheetimage;
    if (goalUiId === "quran-tajweed") return qurantajweedbottomsheetimage;
    if (goalUiId === "missed-fasts") return missedramadanfastsbottomsheetimage;
    if (goalUiId === "dawood-fasts")
      return thefastsofprophetdawoodbottomsheetimage;
    if (goalUiId === "monday-and-thursday-fasts")
      return mondayandthursdayfastsbottomsheetimage;
    if (goalUiId === "white-days-fasts") return whitedaysfastsbottomsheetimage;
    if (goalUiId === "missed-zakat") return missedzakatbottomsheetimage;
    if (goalUiId === "kafarah-for-breaking-fasts")
      return kaffarahbottomsheetimage;
    if (goalUiId === "fidya") return fidyabottomsheetimage;
    if (goalUiId === "lilah-donations") return lillahdonationbottomsheetimage;
    if (goalUiId === "volunteering-services")
      return volunteeringservicesbottomsheetimage;
    if (goalUiId === "sadaqah-jariyah") return sadaqahjariyahbottomsheetimage;
    return getSadaqahDetailImage(goalUiId) ?? Icon;
  };

  const getImageHeight = () => {
    if (
      goalUiId === "qiyamalLail" ||
      goalUiId === "fiveDailyPrayers" ||
      goalUiId === "duhaPrayer" ||
      goalUiId === "istikharah" ||
      goalUiId === "tawbaPrayer" ||
      goalUiId === "tahayyat-ul-wudhu" ||
      goalUiId === "thayyat-ul-masjid" ||
      goalUiId === "sunnahRawatib" ||
      goalUiId === "missedPastPrayers" ||
      goalUiId === "shukrPrayer" ||
      goalUiId === "quran-listening" ||
      goalUiId === "quran-recitation" ||
      goalUiId === "quran-memorization" ||
      goalUiId === "quran-tajweed" ||
      goalUiId === "missed-fasts" ||
      goalUiId === "dawood-fasts" ||
      goalUiId === "monday-and-thursday-fasts" ||
      goalUiId === "white-days-fasts" ||
      goalUiId === "missed-zakat" ||
      goalUiId === "kafarah-for-breaking-fasts" ||
      goalUiId === "fidya" ||
      goalUiId === "lilah-donations" ||
      goalUiId === "volunteering-services" ||
      goalUiId === "sadaqah-jariyah"
    ) {
      return 380;
    }
    return undefined;
  };

  const renderHeader = () => (
    <HeaderWithImageAndDescription
      heroTitle={heroTitle}
      navTitle={navTitle}
      description={description || summaryDescription}
      imageSource={getImageSource()}
      imageHeight={getImageHeight()}
      onBackPress={() => navigation.goBack()}
    />
  );

  const renderReadMoreContent = () => (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 50 },
      ]}
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ListHeaderComponent={renderHeader()}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <GoalDescriptionContent
              lines={item.split("\n")}
              textAlign={textAlign}
            />
          </View>
        )}
      />
    </View>
  );
};
