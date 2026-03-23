import { Audio, AVPlaybackStatus } from "expo-av";
import { Platform } from "react-native";

import { API_ENDPOINTS, API_KEYS } from "@/config/api";

// Voice IDs from ElevenLabs
// For v3, choose voices with emotional range - see: https://elevenlabs.io/app/voice-library/collections/aF6JALq9R6tXwCczjhKH
// Added Hindi voices (assuming multilingual support; replace with actual IDs if needed)
const VOICES = {
  en: {
    default: "EXAVITQu4vr4xnSDxMaL", // Sarah - English
    child: "jBpfuIE2acCO8z3wKNLl", // Gigi - English
    calm: "pNInz6obpgDQGcFmaJgB", // Adam - English
    excited: "yoZ06aMxZJJ28mfd3POQ", // Sam - English
  },
  hi: {
    default: "EXAVITQu4vr4xnSDxMaL", // Placeholder: Sarah (if supports Hindi; replace with Hindi voice)
    child: "jBpfuIE2acCO8z3wKNLl", // Placeholder: Gigi
    calm: "pNInz6obpgDQGcFmaJgB", // Placeholder: Adam
    excited: "yoZ06aMxZJJ28mfd3POQ", // Placeholder: Sam
  },
};

// Map face-api emotions to v3 audio tags (kept subtle to avoid over-acting)
const EMOTION_TO_TAG: Record<string, string> = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  fearful: "nervous",
  surprised: "surprised",
  disgusted: "disgusted",
  neutral: "", // No tag for neutral
  excited: "excited",
  calm: "calm",
};

// Make text sound more natural with pauses and proper sentence structure
function enhanceTextForSpeech(text: string): string {
  let enhanced = text.trim();

  // If it's just a few words (incomplete sentence), add natural pauses
  const wordCount = enhanced.split(/\s+/).length;

  // Add ellipsis for hesitation if it's a fragment
  if (wordCount <= 3 && !enhanced.match(/[.!?]$/)) {
    // Short phrase - add slight pause feel with ellipsis
    enhanced = enhanced + "...";
  } else if (!enhanced.match(/[.!?,]$/)) {
    // Longer but no ending punctuation - add period
    enhanced = enhanced + ".";
  }

  // Add natural pauses between separate concepts (if there's no punctuation)
  // Replace multiple spaces with proper pause
  enhanced = enhanced.replace(/\s{2,}/g, "... ");

  return enhanced;
}

// Format text with v3 emotion audio tags
function formatTextWithEmotion(text: string, emotion: string): string {
  const enhancedText = enhanceTextForSpeech(text);
  const tag = EMOTION_TO_TAG[emotion] || "";

  if (!tag) {
    // Neutral - no tag needed
    return enhancedText;
  }

  // v3 format: [emotion] text
  return `[${tag}] ${enhancedText}`;
}

let currentSound: Audio.Sound | null = null;
let audioModeConfigured = false;

// Cache for audio blobs to avoid repeated API calls
const audioCache = new Map<string, Blob>();
const MAX_CACHE_SIZE = 20;

function getCacheKey(text: string, emotion: string, voiceType: string, language: string): string {
  return `${text}|${emotion}|${voiceType}|${language}`;
}

async function configureAudioMode(): Promise<void> {
  if (audioModeConfigured) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    audioModeConfigured = true;
  } catch (error) {
    console.error("Failed to configure audio mode:", error);
  }
}

export async function speak(
  text: string,
  emotion: string = "neutral",
  voiceType: keyof typeof VOICES.en = "default",
  intensity: number = 100,
  language: string = "en"
): Promise<void> {
  // Configure audio mode first
  await configureAudioMode();
  // Stop any currently playing audio
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Ignore cleanup errors
    }
    currentSound = null;
  }

  const langVoices = VOICES[language as keyof typeof VOICES] || VOICES.en;
  const voiceId = langVoices[voiceType];
  const cacheKey = getCacheKey(text, emotion, voiceType, language);

  // Format text with v3 emotion audio tags and natural enhancements
  const textWithEmotion = formatTextWithEmotion(text, emotion);

  console.log("🎤 Speaking with v3 audio tag:", textWithEmotion);

  try {
    // Check cache first
    let audioBlob = audioCache.get(cacheKey);

    if (!audioBlob) {
      const response = await fetch(
        `${API_ENDPOINTS.ELEVENLABS}/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": API_KEYS.ELEVENLABS,
          },
          body: JSON.stringify({
            text: textWithEmotion,
            model_id: "eleven_v3", // v3 model with audio tag support
            voice_settings: {
              stability: 0.0, // Creative mode (0.0) for maximum expressiveness with audio tags
              similarity_boost: 0.75,
              style: 1.0, // Maximum style for VERY dramatic emotion expression
              use_speaker_boost: true,
            },
            language_code: language === 'hi' ? 'hi' : 'en', // ElevenLabs language codes
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs error: ${response.status} - ${error}`);
      }

      // Get audio as blob and cache it
      audioBlob = await response.blob();

      // Evict oldest entry if cache is full
      if (audioCache.size >= MAX_CACHE_SIZE) {
        const firstKey = audioCache.keys().next().value;
        if (firstKey) audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, audioBlob);
    }

    if (Platform.OS === "web") {
      // Web: Use HTML5 Audio element
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new globalThis.Audio(audioUrl);

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error("Audio playback failed"));
        };
        audio.play().catch(reject);
      });
    } else {
      // Native: Use expo-av with blob URL
      // expo-av supports loading from base64 data URIs
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const dataUri = `data:audio/mpeg;base64,${base64}`;

      // Play the audio
      const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
      currentSound = sound;

      await sound.playAsync();

      // Wait for playback to finish
      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            currentSound = null;
            resolve();
          }
        });
      });
    }
  } catch (error) {
    console.error("ElevenLabs TTS failed:", error);
    throw error;
  }
}

export async function stopSpeaking(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Ignore
    }
    currentSound = null;
  }
}

export function getVoices() {
  return VOICES;
}
 
