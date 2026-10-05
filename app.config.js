const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "";
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN ?? "";

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

  plugins.push("@react-native-google-signin/google-signin");

  return {
    ...config,
    plugins,
  };
};
