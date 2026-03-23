import { spacing } from "@/constants/Colors";
import { Platform } from "react-native";

// Floating tab bar metrics should match app/(tabs)/_layout.tsx
export const tabBarHeight = 72;
export const tabBarBottomOffset = Platform.OS === "ios" ? 24 : 16;

// Extra spacer so content doesn't sit flush under the bar
export const tabBarSpacerExtra = spacing.xl;

export const tabBarSpacerHeight =
  tabBarHeight + tabBarBottomOffset + tabBarSpacerExtra; // ~112-120
 
