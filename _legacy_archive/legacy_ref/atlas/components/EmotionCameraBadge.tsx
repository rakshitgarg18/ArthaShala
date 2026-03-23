import Text from '@/components/FontText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { EmotionDetector } from '@/components/EmotionDetector';
import Colors, { radius, spacing } from '@/constants/Colors';
import { searchSymbol } from '@/services/opensymbols';
import { useSettingsStore } from '@/state/useSettingsStore';

export type EmotionCameraBadgeProps = {
  active: boolean;
  emotion: string;
  confidence: number;
  onToggle: () => void;
  onEmotionDetected: (emotion: string, confidence: number) => void;
};

export function EmotionCameraBadge({
  active,
  emotion,
  confidence,
  onToggle,
  onEmotionDetected,
}: EmotionCameraBadgeProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const { emotionFeatureEnabled } = useSettingsStore();

  useEffect(() => {
    let cancelled = false;
    if (!emotion) {
      setIconUrl(null);
      return;
    }
    searchSymbol(emotion).then((res) => {
      if (!cancelled) setIconUrl(res?.image_url ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [emotion]);

  // Don't render if emotion feature is disabled
  if (!emotionFeatureEnabled) {
    return null;
  }

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.container, active ? styles.containerActive : styles.containerInactive]}
    >
      {active ? (
        <View style={styles.infoShell}>
          <View style={styles.hiddenDetectorWrapper} pointerEvents="none">
            <EmotionDetector
              showUI={false}
              compact
              onEmotionDetected={onEmotionDetected}
              style={styles.hiddenDetector}
            />
          </View>
          {iconUrl ? (
            <Image source={{ uri: iconUrl }} style={styles.icon} resizeMode="contain" />
          ) : (
            <MaterialCommunityIcons name="emoticon-happy-outline" size={28} color="#fff" />
          )}
          <Text style={styles.captionEmotion}>{emotion || 'neutral'}</Text>
          <Text style={styles.captionConfidence}>{Math.round(confidence)}%</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={26} color={Colors.neutral[500]} />
          <Text style={styles.placeholderText}>Enable</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 85,
    height: 85,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
  },
  containerActive: {
    backgroundColor: Colors.secondary.dark,
  },
  containerInactive: {
    backgroundColor: Colors.neutral[100],
  },
  infoShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: spacing.xs,
  },
  icon: {
    width: 32,
    height: 32,
  },
  captionEmotion: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  captionConfidence: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '700',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  placeholderText: {
    color: Colors.neutral[600],
    fontWeight: '700',
    fontSize: 11,
  },
  hiddenDetectorWrapper: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenDetector: {
    width: 1,
    height: 1,
  },
});
 
