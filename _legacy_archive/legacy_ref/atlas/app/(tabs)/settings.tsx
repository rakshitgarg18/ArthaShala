import Text from '@/components/FontText';
import { TabBarSpacer } from '@/components/TabBarSpacer';
import Colors from '@/constants/Colors';
import { useSettingsStore } from '@/state/useSettingsStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { translateTiles } from '@/utils/translation';
import { initialTiles } from '@/constants/tiles';
import { useAacStore } from '@/state/useAacStore';

const translations = {
  en: {
    settings: "Settings",
    emotionDetection: "Emotion Detection",
    emotionDetectionDesc: "Enable camera-based emotion detection",
    emotionDebug: "Emotion Debug",
    emotionDebugDesc: "View detailed emotion detection interface",
    dyslexicFont: "OpenDyslexic Font",
    dyslexicFontDesc: "Use dyslexia-friendly font throughout the app",
    language: "Language",
    languageDesc: "Select app language",
  },
  hi: {
    settings: "सेटिंग्स",
    emotionDetection: "भाव पहचान",
    emotionDetectionDesc: "कैमरा-आधारित भाव पहचान सक्षम करें",
    emotionDebug: "भाव डीबग",
    emotionDebugDesc: "विस्तृत भाव पहचान इंटरफेस देखें",
    dyslexicFont: "OpenDyslexic फ़ॉन्ट",
    dyslexicFontDesc: "ऐप में डिस्लेक्सिया-अनुकूल फ़ॉन्ट का उपयोग करें",
    language: "भाषा",
    languageDesc: "ऐप भाषा चुनें",
  },
};

export default function SettingsScreen() {
  const {
    emotionFeatureEnabled,
    dyslexicFontEnabled,
    selectedLanguage,
    toggleEmotionFeature,
    toggleDyslexicFont,
    setSelectedLanguage,
    setTranslatedTiles,
  } = useSettingsStore();
  const [translating, setTranslating] = useState(false);

  const t = translations[selectedLanguage as 'en' | 'hi'] || translations.en;

  useEffect(() => {
    const handleLanguageChange = async () => {
      if (selectedLanguage === 'en') {
        setTranslatedTiles([]);
        useAacStore.getState().clearSentence(); // Reset sentence
        return;
      }

      setTranslating(true);
      try {
        const translated = await translateTiles(initialTiles, selectedLanguage);
        setTranslatedTiles(translated);
        useAacStore.getState().clearSentence(); // Reset sentence with new tiles
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedTiles([]); // Fallback
      } finally {
        setTranslating(false);
      }
    };

    handleLanguageChange();
  }, [selectedLanguage, setTranslatedTiles]);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text weight="bold" style={styles.header}>{t.settings}</Text>

        {/* Emotion Feature Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="emoticon-happy" size={24} color={Colors.primary.base} />
              <View style={styles.settingText}>
                <Text weight="semibold" style={styles.settingTitle}>{t.emotionDetection}</Text>
                <Text style={styles.settingDescription}>
                  {t.emotionDetectionDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={emotionFeatureEnabled}
              onValueChange={toggleEmotionFeature}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary.soft }}
              thumbColor={emotionFeatureEnabled ? Colors.primary.base : Colors.neutral[400]}
            />
          </View>
        </View>

        {/* Emotion Debug Setting */}
        {emotionFeatureEnabled && (
          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/(tabs)/emotions')}
            activeOpacity={0.7}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="bug" size={24} color={Colors.primary.base} />
                <View style={styles.settingText}>
                  <Text weight="semibold" style={styles.settingTitle}>Emotion Debug</Text>
                   <Text style={styles.settingDescription}>
                     {t.emotionDebugDesc}
                   </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.neutral[400]} />
            </View>
          </TouchableOpacity>
        )}

         {/* Language Setting */}
         <View style={styles.settingCard}>
           <View style={styles.settingRow}>
             <View style={styles.settingInfo}>
               <MaterialCommunityIcons name="translate" size={24} color={Colors.primary.base} />
               <View style={styles.settingText}>
                 <Text weight="semibold" style={styles.settingTitle}>{t.language}</Text>
                 <Text style={styles.settingDescription}>
                   {t.languageDesc}
                 </Text>
               </View>
             </View>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue: string) => setSelectedLanguage(itemValue)}
                style={{ width: 120 }}
                enabled={!translating}
              >
               <Picker.Item label="English" value="en" />
               <Picker.Item label="हिंदी" value="hi" />
             </Picker>
           </View>
           {translating && (
             <Text style={styles.translatingText}>Translating...</Text>
           )}
         </View>

         {/* Emotion Debug View */}

      </ScrollView>
      <TabBarSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: 24,
    marginTop: 8,
  },
  settingCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
   settingDescription: {
     fontSize: 14,
     color: Colors.neutral[600],
   },
   translatingText: {
     fontSize: 12,
     color: Colors.primary.base,
     marginTop: 8,
     textAlign: 'center',
   },
});
 
