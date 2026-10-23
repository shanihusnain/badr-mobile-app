const path = require("path");
const fs = require("fs");

/** Ensure `.env` is available when Expo evaluates this file (prebuild / EAS). */
function loadDotEnv() {
  try {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadDotEnv();

const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN ?? "";
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

/** `123-abc.apps.googleusercontent.com` → `com.googleusercontent.apps.123-abc` */
function googleIosUrlScheme(clientId) {
  const match = clientId.match(/^([\w-]+)\.apps\.googleusercontent\.com$/);
  return match ? `com.googleusercontent.apps.${match[1]}` : "";
}

module.exports = ({ config }) => {
  const plugins = [...(config.plugins ?? [])];

  if (facebookAppId) {
    if (!facebookClientToken) {
      console.warn(
        "[app.config] EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN is missing. Facebook login will crash in native builds.",
      );
    }

    plugins.push([
      "react-native-fbsdk-next",
      {
        appID: facebookAppId,
        clientToken: facebookClientToken,
        displayName: "badr",
        scheme: `fb${facebookAppId}`,
        isAutoInitEnabled: true,
      },
    ]);
  }

  const iosUrlScheme = googleIosUrlScheme(googleIosClientId);
  if (iosUrlScheme) {
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme },
    ]);
  } else {
    console.warn(
      "[app.config] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is missing. Google Sign-In will fail on iOS (simulator + TestFlight).",
    );
    plugins.push("@react-native-google-signin/google-signin");
  }

  return {
    ...config,
    plugins,
  };
};
