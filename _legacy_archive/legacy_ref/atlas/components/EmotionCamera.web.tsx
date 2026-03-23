import Text from '@/components/FontText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';

interface EmotionCameraProps {
  onEmotionDetected?: (emotion: string, confidence: number) => void;
}

/**
 * Web fallback for EmotionCamera - shows placeholder since WebView isn't available on web.
 */
export const EmotionCamera: React.FC<EmotionCameraProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📷</Text>
      <Text style={styles.subtext}>Camera</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
  },
  text: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11,
    color: Colors.neutral[500],
  },
});

export default EmotionCamera;
 
