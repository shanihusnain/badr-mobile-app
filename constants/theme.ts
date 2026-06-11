import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
const greenColor = "#1DBF73";
const redColor = "#FF4C4C";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#ffffff",
    tint: tintColorLight,
    icon: "#687076",
    border: "#E0E0E0",
    inputBackground: "#F9F9F9",
    green: greenColor,
    red: redColor,
    overlayMask: "rgba(0, 0, 0, 0.35)",
    blackBackground: "#081A2F",
    buttonBackground: "#36454F",
    white: "#FFFFFF",
    greybuttonBackground: "#213144",
    grey: "#A0A0A0",
    placeholder: "#8A8A8A",
    calendarBg: "#2F4054",
    calendarTodayBg: "#A0A0A057",
    ringRamadan: "#B7977E",
    ringDawood: "#439CB8",
    ringMonThu: "#61C8A6",
    subtext: "#999999",
    dullWhite: "#D7D7D7",
    darkgrey: "#203043",
    unselectedSwtchTrack: "#919EAB",
    dullWhiteOpacity: "rgba(255, 255, 255, 0.1)",
    divider: "rgba(255, 255, 255, 0.08)",
    seagreen: "#00EAD2",
    greybuttonversion: "#53566052",
    graylightshade: "#8B8B8B",
    lightgreen: "rgba(29, 191, 115, 0.1)",
    golden: "#FFAA00",
    goldenBright: "#FFD56B",
    goldenDeep: "#C9A227",
    goldenGlow: "rgba(255, 213, 107, 0.55)",
    ringPrayer: "#5B9FD4",
    ringQuran: "#8B7CF6",
    ringFasting: "#FFFFFF",
    ringSadaqah: "#FFAA00",
    dayProgressCardBg: "#364556",
    dullestWhite: "rgba(255, 255, 255, 0.1)",
    progressBarEmpty: "#374556",
    selectcategory: "#425060",
    lightpurple: "#CBD3FF",
    darkblue: "#3448FF",
    lightblue: "#00B0E8",
    yellow: "#E0A739",
    overlayBlackColor: "rgba(0, 0, 0, 0.6)",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    border: "#333333",
    inputBackground: "#1E1E1E",
    green: greenColor,
    red: redColor,
    overlayMask: "rgba(0, 0, 0, 0.35)",
    buttonBackground: "#36454F",
    greybuttonBackground: "#213144",
    dullWhite: "#D7D7D7",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
