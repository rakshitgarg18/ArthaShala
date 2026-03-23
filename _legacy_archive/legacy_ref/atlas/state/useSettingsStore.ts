import { create } from "zustand";

import { Tile } from "@/constants/tiles";

type SettingsState = {
  emotionFeatureEnabled: boolean;
  dyslexicFontEnabled: boolean;
  selectedLanguage: string;
  translatedTiles: Tile[];
  toggleEmotionFeature: () => void;
  toggleDyslexicFont: () => void;
  setSelectedLanguage: (lang: string) => void;
  setTranslatedTiles: (tiles: Tile[]) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  emotionFeatureEnabled: true,
  dyslexicFontEnabled: false,
  selectedLanguage: 'en',
  translatedTiles: [],
  toggleEmotionFeature: () =>
    set((state) => ({ emotionFeatureEnabled: !state.emotionFeatureEnabled })),
  toggleDyslexicFont: () =>
    set((state) => ({ dyslexicFontEnabled: !state.dyslexicFontEnabled })),
  setSelectedLanguage: (lang) =>
    set(() => ({ selectedLanguage: lang })),
  setTranslatedTiles: (tiles) =>
    set(() => ({ translatedTiles: tiles })),
}));
 
