import { useEffect, useState } from "react";
import { Keyboard, Platform, View } from "react-native";

/**
 * Owns keyboard height locally so parent lists/sheets do not re-render on
 * keyboard show/hide. Renders empty space matching prior contentContainer
 * padding: max(0, kb) + (kb > 0 ? 48 : 0).
 */
export function KeyboardAwareListBottomPad() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const height =
    Math.max(0, keyboardHeight) + (keyboardHeight > 0 ? 48 : 0);
  if (height <= 0) return null;
  return <View style={{ height }} />;
}
