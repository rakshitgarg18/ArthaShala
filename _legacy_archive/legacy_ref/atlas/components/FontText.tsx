import { useSettingsStore } from '@/state/useSettingsStore';
import React from 'react';
import { Text as RNText } from 'react-native';

type FontTextProps = RNText['props'] & {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

const fredokaFontMap = {
  regular: 'Fredoka_400Regular',
  medium: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
};

const dyslexicFontMap = {
  regular: 'OpenDyslexic-Regular',
  medium: 'OpenDyslexic-Regular',
  semibold: 'OpenDyslexic-Bold',
  bold: 'OpenDyslexic-Bold',
};

/**
 * FontText: A Text component that enforces app font family.
 * Use this instead of importing Text directly from react-native.
 * Supports weight prop to easily switch between font variants.
 * Automatically switches between Fredoka and OpenDyslexic based on settings.
 */
export function Text({
  weight = 'medium',
  style,
  ...props
}: FontTextProps) {
  const { dyslexicFontEnabled } = useSettingsStore();
  const fontMap = dyslexicFontEnabled ? dyslexicFontMap : fredokaFontMap;
  const fontFamily = fontMap[weight];
  
  // Merge fontFamily with any existing styles
  const baseStyle = { fontFamily };
  
  return (
    <RNText
      {...props}
      style={[baseStyle, style]}
    />
  );
}

export default Text;
 
