// Professional AAC App Color Palette
// Designed for children with autism: warm, friendly, accessible, calming

// Primary brand colors
const primary = "#FF6B35"; // Warm orange - main action color
const primaryLight = "#FF8F66";
const primaryDark = "#E55A2B";
const primarySoft = "#FFEBE3"; // Very soft orange for backgrounds

// Secondary colors
const secondary = "#4ECDC4"; // Teal - accent color
const secondaryLight = "#7EDDD6";
const secondaryDark = "#3DBDB4";
const secondarySoft = "#E3F9F7"; // Very soft teal for backgrounds

// Accent colors for variety (kid-friendly)
const accent = {
  purple: "#9B59B6",
  purpleSoft: "#F3E8F7",
  blue: "#3498DB",
  blueSoft: "#E8F4FC",
  pink: "#E91E63",
  pinkSoft: "#FCE4EC",
  green: "#27AE60",
  greenSoft: "#E8F8EF",
  yellow: "#F1C40F",
  yellowSoft: "#FDF9E7",
};

// Semantic colors
const success = "#27AE60";
const warning = "#F1C40F";
const error = "#E74C3C";
const info = "#3498DB";

// Neutral palette - slightly warmer tones for friendliness
const neutral = {
  50: "#FDFCFB",
  100: "#F8F6F4",
  200: "#F0EDEB",
  300: "#E3DFDC",
  400: "#C4BFBB",
  500: "#9E9892",
  600: "#756F69",
  700: "#5C5650",
  800: "#3D3833",
  900: "#1F1B18",
};

// Background colors - warm and inviting
const background = {
  primary: "#FFF9F5", // Warm off-white
  secondary: "#FFF3EB", // Slightly warmer
  tertiary: "#FFEDE3", // Even warmer for sections
  card: "#FFFFFF",
  elevated: "#FFFFFF",
  highlight: "#FFF0E8", // Light highlight for active states
  muted: "#F5F2EF", // For disabled/muted states
};

// Emotion detection colors - softer for kids
const emotions = {
  happy: "#FFD93D", // Bright happy yellow
  sad: "#74B9FF", // Soft calming blue
  angry: "#FF6B6B", // Softer red
  fearful: "#A29BFE", // Gentle purple
  surprised: "#FDCB6E", // Warm orange-yellow
  disgusted: "#A3E635", // Fresh green
  neutral: "#94A3B8", // Calm gray
};

// Shadows - softer for a friendlier look
export const shadows = {
  small: {
    shadowColor: "#1F1B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  medium: {
    shadowColor: "#1F1B18",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: "#1F1B18",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  glow: {
    shadowColor: primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: "#1F1B18",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
};

// Spacing scale (consistent 4pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};

// Border radius - larger for kid-friendly rounded look
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 36,
  full: 9999,
};

// Typography - friendly and readable
export const typography = {
  fontFamily: {
    regular: "Calibri",
    medium: "Calibri",
    semibold: "Calibri",
    bold: "Calibri",
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    "2xl": 24,
    "3xl": 28,
    "4xl": 32,
    "5xl": 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const tintColorLight = primary;
const tintColorDark = "#fff";

export default {
  light: {
    text: neutral[900],
    textSecondary: neutral[600],
    textMuted: neutral[500],
    background: background.primary,
    backgroundSecondary: background.secondary,
    card: background.card,
    tint: tintColorLight,
    tabIconDefault: neutral[400],
    tabIconSelected: tintColorLight,
    border: neutral[200],
    borderLight: neutral[100],
    // Brand colors
    primary,
    primaryLight,
    primaryDark,
    secondary,
    secondaryLight,
    secondaryDark,
    // Semantic
    success,
    warning,
    error,
    info,
    // Neutrals
    ...neutral,
  },
  dark: {
    text: "#fff",
    textSecondary: neutral[400],
    textMuted: neutral[500],
    background: neutral[900],
    backgroundSecondary: neutral[800],
    card: neutral[800],
    tint: tintColorDark,
    tabIconDefault: neutral[600],
    tabIconSelected: tintColorDark,
    border: neutral[700],
    borderLight: neutral[800],
    // Brand colors
    primary,
    primaryLight,
    primaryDark,
    secondary,
    secondaryLight,
    secondaryDark,
    // Semantic
    success,
    warning,
    error,
    info,
    // Neutrals
    ...neutral,
  },
  // Direct access to theme tokens
  primary: {
    base: primary,
    light: primaryLight,
    dark: primaryDark,
    soft: primarySoft,
  },
  secondary: {
    base: secondary,
    light: secondaryLight,
    dark: secondaryDark,
    soft: secondarySoft,
  },
  accent,
  success,
  warning,
  error,
  info,
  neutral,
  background,
  emotions,
};
 
