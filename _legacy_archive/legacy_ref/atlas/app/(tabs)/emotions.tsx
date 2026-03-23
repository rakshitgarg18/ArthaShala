import { EmotionDetector } from '@/components/EmotionDetector';
import Text from '@/components/FontText';
import { TabBarSpacer } from '@/components/TabBarSpacer';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EmotionsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors.neutral[900]} />
        </TouchableOpacity>
        <Text weight="bold" style={styles.title}>Emotion Debug</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Emotion Detector */}
      <View style={styles.content}>
        <EmotionDetector />
      </View>
      <TabBarSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
});
 
