import Text from '@/components/FontText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmotionCameraBadge } from '@/components/EmotionCameraBadge';
import PuzzlePiece from '@/components/PuzzlePiece';

import { lightenColor } from '@/components/TileCard';
import { TileGrid } from '@/components/TileGrid';
import Colors, { radius, shadows, spacing } from '@/constants/Colors';
import { Tile } from '@/constants/tiles';
import { speak } from '@/services/elevenlabs';
import { detectEmotion, suggestNextWords } from '@/services/openrouter';
import { searchSymbol } from '@/services/opensymbols';
import { getBreadcrumbLabels, tilesMap, useAacStore, visibleTilesForPath } from '@/state/useAacStore';
import { useSettingsStore } from '@/state/useSettingsStore';

export default function SpeakScreen() {
  const sentence = useAacStore((state) => state.sentence);
  const localSuggestions = useAacStore((state) => state.suggestions);
  const addWord = useAacStore((state) => state.addWord);
  const clearSentence = useAacStore((state) => state.clearSentence);
  const undo = useAacStore((state) => state.undo);
  const removeAtIndex = useAacStore((state) => state.removeAtIndex);
  const tiles = useAacStore((state) => state.tiles);
  const folderPath = useAacStore((state) => state.folderPath);
  const goBack = useAacStore((state) => state.goBack);
  const openFolder = useAacStore((state) => state.openFolder);
  const selectedLanguage = useSettingsStore((state) => state.selectedLanguage);
  const visibleTiles = useMemo(() => visibleTilesForPath(tiles, folderPath), [tiles, folderPath]);
  const tileMap = useMemo(() => tilesMap(tiles), [tiles]);

  const [aiSuggestions, setAiSuggestions] = useState<Tile[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const [imageCache] = useState(() => new Map<string, string | null>());
  const backspaceLongPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Tile popup modal state
  const [selectedTileForPopup, setSelectedTileForPopup] = useState<Tile | null>(null);
  const [tilePopupImage, setTilePopupImage] = useState<string | null>(null);

  // Emotion camera state
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0);

  const handleEmotionDetected = useCallback((emotion: string, confidence: number) => {
    setCurrentEmotion(emotion);
    setEmotionConfidence(confidence);
  }, []);

  // Fetch AI suggestions when sentence changes
  useEffect(() => {
    let cancelled = false;

    async function fetchSuggestions() {
      if (sentence.length === 0) {
        setAiSuggestions([]);
        return;
      }

      setLoadingAi(true);
      try {
        const suggested = await suggestNextWords(sentence, tiles);
        if (!cancelled) {
          const matchedTiles = suggested
            .map((label) => tiles.find((t) => t.label.toLowerCase() === label))
            .filter((t): t is Tile => Boolean(t));
          setAiSuggestions(matchedTiles.length > 0 ? matchedTiles : localSuggestions);
        }
      } catch {
        if (!cancelled) setAiSuggestions(localSuggestions);
      } finally {
        if (!cancelled) setLoadingAi(false);
      }
    }

    // Debounce slightly
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [sentence, tiles, localSuggestions]);

  const displayedSuggestions = aiSuggestions.length > 0 ? aiSuggestions : localSuggestions;

  const isSentenceEmpty = sentence.length === 0;

  // Load image for tile popup
  useEffect(() => {
    if (!selectedTileForPopup) {
      setTilePopupImage(null);
      return;
    }
    if (selectedTileForPopup.imageUrl) {
      setTilePopupImage(selectedTileForPopup.imageUrl);
      return;
    }
    let cancelled = false;
    searchSymbol(selectedTileForPopup.label).then((result) => {
      if (!cancelled && result?.image_url) {
        setTilePopupImage(result.image_url);
      }
    });
    return () => { cancelled = true; };
  }, [selectedTileForPopup]);

  // Handler for tile long press to show popup
  const handleTileLongPress = useCallback((tile: Tile) => {
    if (tile.isFolder) return;
    setSelectedTileForPopup(tile);
  }, []);

  const breadcrumb = useMemo(() => {
    const labels = getBreadcrumbLabels(folderPath, tileMap);
    return labels.join(' / ');
  }, [folderPath, tileMap]);

  const handleSpeak = useCallback(async () => {
    if (!sentence.length) {
      Alert.alert('Nothing to say', 'Add a few tiles first.');
      return;
    }
    if (speakingRef.current || speaking) return; // prevent overlap/spam
    speakingRef.current = true;

    const text = sentence.map((tile) => tile.speechText ?? tile.label).join(' ');

    setSpeaking(true);
    try {
      const hasCameraSignal = emotionDetectionEnabled && emotionConfidence > 45;
      const emotionToUse = hasCameraSignal ? currentEmotion : await detectEmotion(text);
      const intensityToUse = 100; // Always use maximum intensity
      console.log('🎤 Speaking with emotion:', emotionToUse, 'intensity:', intensityToUse);
      await speak(text, emotionToUse, 'default', intensityToUse, selectedLanguage);
    } catch (error) {
      console.error('Speech failed:', error);
      Alert.alert('Speech Error', 'Could not play audio. Check your connection.');
    } finally {
      speakingRef.current = false;
      setSpeaking(false);
    }
  }, [sentence, speaking, emotionDetectionEnabled, emotionConfidence, currentEmotion, selectedLanguage]);

  // Declare after helpers to avoid use-before-declare lint
  const handleTileSpeakPress = useCallback((tile: Tile) => {
    const raw = tile.speechText ?? tile.label;
    const text = normalizeSpeechText(raw);
    Speech.speak(text, ttsOptions);
  }, []);

  const handleTilePress = useCallback((tile: Tile) => {
    if (tile.isFolder) {
      openFolder(tile.id);
      return;
    }
    // Speak the word using native TTS (normalized)
    const raw = tile.speechText ?? tile.label;
    const text = normalizeSpeechText(raw);
    Speech.speak(text, ttsOptions);
    addWord(tile.id);
  }, [openFolder, addWord]);

  const handleSentencePress = useCallback(() => {
    handleSpeak();
  }, [handleSpeak]);

  const handleBackspacePress = useCallback(() => {
    undo();
  }, [undo]);

  const handleBackspaceLongPress = useCallback(() => {
    clearSentence();
  }, [clearSentence]);

  // Normalize spoken text for native TTS to avoid odd pronunciations
  const normalizeSpeechText = useCallback((text: string): string => {
    const trimmed = text.trim();
    // Special-case single-letter pronoun 'I' so it isn't read as "capital I"
    if (trimmed === 'I') return 'I.'; // punctuation nudges TTS to treat as a word
    return trimmed;
  }, []);

  // Expo Speech options tuned to be closer to ElevenLabs output
  const ttsOptions = useMemo(() => ({
    language: 'en-US',
    rate: 0.92,
    pitch: 1.0,
    volume: 1.0,
  }), []);

  type PieceProps = {
    tile: Tile;
    width: number;
    height: number;
    tabSize: number;
    fontSize: number;
    seed?: string;
    edges?: { top: 'flat' | 'tab' | 'slot'; right: 'flat' | 'tab' | 'slot'; bottom: 'flat' | 'tab' | 'slot'; left: 'flat' | 'tab' | 'slot' };
  };

  const PuzzleTile = ({ tile, width, height, tabSize, fontSize, edges, seed }: PieceProps) => {
    const [img, setImg] = useState<string | null>(tile.imageUrl ?? imageCache.get(tile.id) ?? null);

    useEffect(() => {
      if (img || tile.isFolder) return;
      if (imageCache.has(tile.id)) {
        setImg(imageCache.get(tile.id) ?? null);
        return;
      }
      let cancelled = false;
      searchSymbol(tile.label).then((result) => {
        if (cancelled) return;
        const url = result?.image_url ?? null;
        imageCache.set(tile.id, url);
        setImg(url);
      });
      return () => { cancelled = true; };
    }, [img, tile.id, tile.label, tile.isFolder]);

    return (
      <PuzzlePiece
        width={width}
        height={height}
        tabSize={tabSize}
        cornerRadius={14}
        strokeColor={tile.color}
        fillColor={lightenColor(tile.color, 0.35)}
        label={tile.label}
        imageUrl={img ?? undefined}
        fontSize={fontSize}
        seed={seed}
        edges={edges}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Section: Sentence Bar + Suggestions */}
      <View style={styles.topSection}>
        <View style={styles.sentenceBar}>
          <View style={styles.sentenceHeaderRow}>
            <MaterialCommunityIcons name="message-text-outline" size={16} color={Colors.primary.base} />
            <Text style={styles.suggestionLabel}>SPEAK</Text>
          </View>
          <View style={styles.sentenceRowContainer}>
            <View style={styles.emotionBadgeWrap}>
              <EmotionCameraBadge
                active={emotionDetectionEnabled}
                emotion={currentEmotion}
                confidence={emotionConfidence}
                onToggle={() => setEmotionDetectionEnabled((prev) => !prev)}
                onEmotionDetected={handleEmotionDetected}
              />
            </View>
            <View style={[styles.sentenceRow, isSentenceEmpty && styles.sentenceRowEmpty]}>
            {isSentenceEmpty ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="gesture-tap" size={32} color={Colors.primary.base} />
                </View>
                <View style={styles.emptyCopy}>
                  <Text style={styles.emptyTitle}>Start your sentence</Text>
                  <Text style={styles.emptySubtitle}>Tap tiles below to add words</Text>
                </View>
              </View>
            ) : (
              sentence.map((tile, index) => {
                const isFirst = index === 0;
                const isLast = index === sentence.length - 1;
                const edges = {
                  top: 'flat',
                  bottom: 'flat',
                  left: isFirst ? 'flat' : 'slot',
                  right: 'tab',
                } as const;
                return (
                  <Pressable
                    key={`${tile.id}-${index}`}
                    onPress={handleSentencePress}
                    onLongPress={() => removeAtIndex(index)}
                    style={[styles.pieceWrap, !isLast && styles.pieceWrapConnected]}
                  >
                    <PuzzleTile
                      tile={tile}
                      width={95}
                      height={95}
                      tabSize={20}
                      fontSize={16}
                      seed={tile.id}
                      edges={edges}
                    />
                  </Pressable>
                );
              })
            )}
            </View>
          </View>
          {sentence.length > 0 && (
            <View style={styles.sentenceActions}>
              <Pressable
                style={styles.backspaceButton}
                onPress={handleBackspacePress}
                onLongPress={handleBackspaceLongPress}
              >
                <MaterialCommunityIcons name="backspace-outline" size={24} color={Colors.neutral[600]} />
              </Pressable>
              <Pressable
                style={[styles.submitButton, speaking && styles.submitButtonLoading]}
                onPress={handleSentencePress}
                disabled={speaking}
              >
                {speaking ? (
                  <ActivityIndicator size="small" color={Colors.background.card} />
                ) : (
                  <MaterialCommunityIcons name="play" size={28} color={Colors.background.card} />
                )}
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.suggestionBar}>
          <View style={styles.suggestionHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color={Colors.warning} />
            <Text style={styles.suggestionLabel}>SUGGESTIONS</Text>
            {loadingAi && <ActivityIndicator size="small" color={Colors.primary.base} />}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
            {displayedSuggestions.map((tile) => {
              return (
                <Pressable key={tile.id} onPress={() => addWord(tile.id)} style={styles.pieceWrap}>
                  <PuzzleTile
                    tile={tile}
                    width={95}
                    height={95}
                    tabSize={20}
                    fontSize={16}
                    seed={tile.id}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Folder Navigation */}
      {folderPath.length > 0 && (
        <View style={styles.folderRow}>
          <Text style={styles.breadcrumb}>{breadcrumb}</Text>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
      )}

      {/* Tile Grid */}
      <TileGrid
        tiles={visibleTiles}
        onTilePress={handleTilePress}
        onTileLongPress={handleTileLongPress}
      />

      {/* Tile Popup Modal */}
      <Modal
        visible={selectedTileForPopup !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedTileForPopup(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tilePopupCard}>
            {selectedTileForPopup && (
              <>
                <View style={styles.tilePopupHeader}>
                  <Text style={styles.tilePopupTitle}>{selectedTileForPopup.label}</Text>
                  <Pressable onPress={() => setSelectedTileForPopup(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.tilePopupContent}>
                  <PuzzlePiece
                    width={160}
                    height={160}
                    cornerRadius={radius.lg}
                    tabSize={28}
                    strokeColor={selectedTileForPopup.color}
                    fillColor={lightenColor(selectedTileForPopup.color, 0.35)}
                    imageUrl={tilePopupImage ?? undefined}
                    label={selectedTileForPopup.label}
                    fontSize={22}
                    seed={selectedTileForPopup.id}
                  />
                </View>
                <View style={styles.tilePopupActions}>
                  <Pressable
                    style={styles.tilePopupButton}
                    onPress={() => {
                      const text = selectedTileForPopup.speechText ?? selectedTileForPopup.label;
                      Speech.speak(normalizeSpeechText(text), ttsOptions);
                    }}
                  >
                    <Text style={styles.tilePopupButtonText}>🔊 Speak</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.tilePopupButton, styles.tilePopupPrimaryButton]}
                    onPress={() => {
                      addWord(selectedTileForPopup.id);
                      setSelectedTileForPopup(null);
                    }}
                  >
                    <Text style={styles.tilePopupPrimaryButtonText}>➕ Add</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Top Section
  topSection: {
    backgroundColor: Colors.background.card,
    marginHorizontal: spacing.xl,
    borderRadius: radius['2xl'],
    ...shadows.soft,
    marginBottom: 0,
    marginTop: 20,
    overflow: 'hidden',
  },

  // Sentence Bar
  sentenceBar: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    height: 135,
    overflow: 'hidden',
  },
  sentenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sentenceRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  emotionBadgeWrap: {
    width: 85,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sentenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: 92,
    overflow: 'visible',
    height: 95,
  },
  sentenceRowEmpty: {
    alignItems: 'center',
    paddingRight: 0,
    gap: spacing.md,
  },
  pieceWrap: {
    width: 95,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceWrapConnected: {
    marginRight: -32,
  },
  emptyState: {
    height: 85,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: Colors.primary.soft,
    borderStyle: 'dashed',
    backgroundColor: Colors.background.highlight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: Colors.primary.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    flex: 1,
  },
  emptyTitle: {
    color: Colors.neutral[800],
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    color: Colors.neutral[500],
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  sentenceActions: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.xs,
    bottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  backspaceButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: Colors.primary.base,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },

  // Suggestion Bar
  suggestionBar: {
    backgroundColor: Colors.secondary.soft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 0,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    minHeight: 120,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    minHeight: 24,
  },
  suggestionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.neutral[800],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Folder Navigation
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: Colors.background.primary,
  },
  breadcrumb: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: radius.xl,
    ...shadows.soft,
  },
  backButtonText: {
    color: Colors.neutral[700],
    fontWeight: '700',
    fontSize: 14,
  },

  // Tile Popup Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  tilePopupCard: {
    backgroundColor: Colors.background.card,
    borderRadius: radius['3xl'],
    padding: spacing['2xl'],
    width: '100%',
    maxWidth: 340,
    ...shadows.large,
  },
  tilePopupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tilePopupTitle: {
    color: Colors.neutral[900],
    fontWeight: '800',
    fontSize: 24,
    textTransform: 'capitalize',
    letterSpacing: -0.3,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.neutral[400],
    padding: spacing.sm,
  },
  tilePopupContent: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  tilePopupActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tilePopupButton: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 0,
  },
  tilePopupButtonText: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 16,
  },
  tilePopupPrimaryButton: {
    backgroundColor: Colors.primary.base,
    ...shadows.glow,
  },
  tilePopupPrimaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
 
