import Text from '@/components/FontText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmotionCameraBadge } from '@/components/EmotionCameraBadge';
import PuzzlePiece from '@/components/PuzzlePiece';
import { lightenColor } from '@/components/TileCard';
import { TileGrid } from '@/components/TileGrid';
import Colors, { radius, shadows, spacing } from '@/constants/Colors';
import { Tile } from '@/constants/tiles';
import { speak } from '@/services/elevenlabs';
import { simplifySentence, suggestReply } from '@/services/openrouter';
import { searchSymbol } from '@/services/opensymbols';
import {
  RecognitionState,
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from '@/services/speechRecognition';
import { useSettingsStore } from '@/state/useSettingsStore';
import { getBreadcrumbLabels, tilesMap, useAacStore, visibleTilesForPath } from '@/state/useAacStore';
import * as Speech from 'expo-speech';

type ConversationMessage = {
  id: string;
  type: 'incoming' | 'outgoing';
  original: string;
  simplified?: string;
  tiles: Tile[];
  timestamp: Date;
  isLoading?: boolean;
  emotion?: string;
  emotionConfidence?: number;
};

const simplificationCache = new Map<string, { simplified: string; tiles: Tile[] }>();
const STORAGE_KEY = 'transcribe.conversations';

type SavedConversation = {
  id: string;
  createdAt: string;
  title: string;
  messages: ConversationMessage[];
  duration?: string;
};

type ViewMode = 'list' | 'chat';

// Loading shimmer animation for puzzle piece placeholders
function LoadingShimmer() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={shimmerStyles.container}>
      {[1, 2, 3].map((i) => (
        <Animated.View key={i} style={[shimmerStyles.tile, { opacity }]} />
      ))}
    </View>
  );
}

const shimmerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
});

// Format duration for display
function formatDuration(start: Date, end: Date = new Date()): string {
  const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date for list display
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export default function TranscribeScreen() {
  const tiles = useAacStore((state) => state.tiles);
  const folderPath = useAacStore((state) => state.folderPath);
  const goBack = useAacStore((state) => state.goBack);
  const openFolder = useAacStore((state) => state.openFolder);
  const ensureWordsLoaded = useAacStore((state) => state.ensureWordsLoaded);
  const visibleTiles = useMemo(() => visibleTilesForPath(tiles, folderPath), [tiles, folderPath]);
  const tileMap = useMemo(() => tilesMap(tiles), [tiles]);
  const navigation = useNavigation();
  const selectedLanguage = useSettingsStore((state) => state.selectedLanguage);

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesRef = useRef<FlatList>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentConversationStartTime, setCurrentConversationStartTime] = useState<Date | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ visible: boolean; type: 'clear' | 'saved' | 'deleteSaved' | 'leave' | null; message?: string; payloadId?: string }>({
    visible: false,
    type: null,
  });
  const [pendingNavAction, setPendingNavAction] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [micState, setMicState] = useState<RecognitionState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processing, setProcessing] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSupported = isSpeechRecognitionSupported();
  const [imageCache] = useState(() => new Map<string, string | null>());
  const [speakerAvatarUrl, setSpeakerAvatarUrl] = useState<string | null>(null);
  const [youAvatarUrl, setYouAvatarUrl] = useState<string | null>(null);
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState(0);

  const availableTileLabels = useMemo(
    () => tiles.filter((t) => !t.isFolder).map((t) => t.label),
    [tiles]
  );

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

  const breadcrumb = useMemo(() => {
    const labels = getBreadcrumbLabels(folderPath, tileMap);
    return labels.length === 0 ? 'Board' : ['Board', ...labels].join(' / ');
  }, [folderPath, tileMap]);

  // Load avatar images from OpenSymbols
  useEffect(() => {
    let cancelled = false;
    searchSymbol('person').then((result) => {
      if (!cancelled && result?.image_url) {
        setSpeakerAvatarUrl(result.image_url);
      }
    });
    searchSymbol('me').then((result) => {
      if (!cancelled && result?.image_url) {
        setYouAvatarUrl(result.image_url);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Load saved conversations on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingHistory(true);
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted || !raw) return;
        const parsed: SavedConversation[] = JSON.parse(raw);
        const normalized = parsed.map((conv) => ({
          ...conv,
          messages: conv.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setSavedConversations(normalized);
      } catch (e) {
        console.warn('Failed to load saved conversations', e);
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(messages.length > 0);
  }, [messages]);

  // Navigation guard for unsaved changes - auto-save instead of prompting
  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', async (e: any) => {
      if (!hasUnsavedChanges || messages.length === 0) return;
      
      e.preventDefault();
      
      // Auto-save before leaving
      const createdAt = currentConversationStartTime || new Date();
      const titleSource = messages[0]?.original ?? 'Conversation';
      const title = titleSource.length > 80 ? `${titleSource.slice(0, 77)}...` : titleSource;
      const duration = formatDuration(createdAt);

      const payload: SavedConversation = {
        id: currentConversationId || String(Date.now()),
        createdAt: createdAt.toISOString(),
        title,
        messages,
        duration,
      };

      try {
        let next: SavedConversation[];
        if (currentConversationId) {
          // Update existing conversation
          next = savedConversations.map(c => c.id === currentConversationId ? payload : c);
        } else {
          // Create new conversation
          next = [payload, ...savedConversations].slice(0, 50);
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSavedConversations(next);
      } catch (error) {
        console.error('Auto-save on navigation failed:', error);
      }

      // Now allow navigation
      navigation.dispatch(e.data.action);
    });
    return sub;
  }, [navigation, hasUnsavedChanges, messages, savedConversations, currentConversationStartTime, currentConversationId]);

  // Start new conversation
  const handleStartNewConversation = useCallback(() => {
    setMessages([]);
    setSelectedTiles([]);
    setSuggestedReplies([]);
    setCurrentConversationStartTime(new Date());
    setCurrentConversationId(null);
    setViewMode('chat');
  }, []);

  // Load saved conversation
  const handleLoadConversation = useCallback((conv: SavedConversation) => {
    const restored = conv.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    setMessages(restored);
    setSelectedTiles([]);
    setSuggestedReplies([]);
    setCurrentConversationStartTime(new Date(conv.createdAt));
    setCurrentConversationId(conv.id);
    setViewMode('chat');
  }, []);

  // Handle microphone press
  const handleMicPress = useCallback(() => {
    if (micState === 'listening') {
      stopListening();
      return;
    }

    setInterimTranscript('');

    const started = startListening({
      onResult: async (result) => {
        setInterimTranscript(result.transcript);

        if (result.isFinal) {
          setProcessing(true);
          try {
            const transcript = result.transcript;
            const candidateWords = transcript.split(/[^A-Za-z0-9]+/).filter(Boolean);
            // This loads tiles for all words in the transcript into the store
            const hydratedTiles = ensureWordsLoaded(candidateWords);
            
            // Use hydratedTiles which includes dynamically loaded tiles for transcript words
            const allBoardTiles = hydratedTiles.filter((t) => !t.isFolder);
            const allBoardLabels = allBoardTiles.map((t) => t.label);
            
            console.log('[Transcribe] Transcript:', transcript);
            console.log('[Transcribe] Available tiles count:', allBoardLabels.length);
            console.log('[Transcribe] Sample labels:', allBoardLabels.slice(0, 30));

            // Create loading message immediately
            const loadingMessageId = String(Date.now());
            const loadingMessage: ConversationMessage = {
              id: loadingMessageId,
              type: 'incoming',
              original: transcript,
              tiles: [],
              timestamp: new Date(),
              isLoading: true,
            };
            setMessages((prev) => [...prev, loadingMessage]);
            setInterimTranscript('');

            // Scroll to bottom
            setTimeout(() => {
              messagesRef.current?.scrollToEnd({ animated: true });
            }, 100);

            let mappedTiles: Tile[] = [];
            let simplified = '';
            
            if (simplificationCache.has(transcript)) {
              const cached = simplificationCache.get(transcript)!;
              simplified = cached.simplified;
              mappedTiles = cached.tiles;
            } else {
              const { simplified: newSimplified, tileWords } = await simplifySentence(
                transcript,
                allBoardLabels
              );
              simplified = newSimplified;
              mappedTiles = tileWords
                .map((word) => allBoardTiles.find((t) => t.label.toLowerCase() === word.toLowerCase()))
                .filter((t): t is Tile => Boolean(t));
              simplificationCache.set(transcript, { simplified, tiles: mappedTiles });
            }

            // Update message with tiles
            setMessages((prev) => prev.map((m) => 
              m.id === loadingMessageId 
                ? { ...m, simplified, tiles: mappedTiles, isLoading: false }
                : m
            ));

            // Get reply suggestions using all board tiles
            const suggestions = await suggestReply(transcript, allBoardLabels);
            setSuggestedReplies(suggestions);
          } catch (error) {
            console.error('Processing failed:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process speech');
          } finally {
            setProcessing(false);
            // Stop listening after message is processed
            stopListening();
          }
        }
      },
      onStateChange: setMicState,
      onError: (error) => {
        console.error('Speech recognition error:', error);
        if (error.includes('Network')) {
          Alert.alert('Network Issue', 'Speech service encountered a network error. Try again.');
        } else if (error.includes('permission')) {
          Alert.alert('Microphone Access', error);
        } else if (!error.includes('No speech')) {
          Alert.alert('Microphone Error', error);
        }
      },
    });

    if (!started) {
      Alert.alert('Error', 'Could not start microphone');
    }
  }, [micState, ensureWordsLoaded]);

  // Add tile to selected tiles bar
  const handleTilePress = useCallback((tile: Tile) => {
    if (tile.isFolder) {
      openFolder(tile.id);
      return;
    }
    // Speak the word on tap (native TTS)
    const raw = tile.speechText ?? tile.label;
    const text = (raw.trim() === 'I') ? 'I.' : raw.trim();
    Speech.speak(text, { language: 'en-US', rate: 0.92, pitch: 1.0, volume: 1.0 });

    setSelectedTiles((current) => [...current, tile]);
  }, [openFolder]);

  // Remove tile from selection
  const handleRemoveTile = useCallback((index: number) => {
    setSelectedTiles((current) => current.filter((_, i) => i !== index));
  }, []);

  // Send reply
  const handleSendReply = useCallback(() => {
    if (selectedTiles.length === 0) return;

    const text = selectedTiles.map((t) => t.speechText ?? t.label).join(' ');
    const hasCameraSignal = emotionDetectionEnabled && emotionConfidence > 45;
    const emotionForMessage = hasCameraSignal ? currentEmotion : undefined;
    const confidenceForMessage = hasCameraSignal ? emotionConfidence : undefined;
    const outgoingMessage: ConversationMessage = {
      id: String(Date.now()),
      type: 'outgoing',
      original: text,
      tiles: [...selectedTiles],
      timestamp: new Date(),
      emotion: emotionForMessage,
      emotionConfidence: confidenceForMessage,
    };
    setMessages((prev) => [...prev, outgoingMessage]);
    setSelectedTiles([]);
    setSuggestedReplies([]);

    // Auto-play the message with ElevenLabs
    (async () => {
      try {
        const emotionToUse = hasCameraSignal ? currentEmotion : 'calm';
        await speak(text, emotionToUse, 'default', 100, selectedLanguage);
      } catch (error) {
        console.error('Auto-play speech failed:', error);
      }
    })();

    setTimeout(() => {
      messagesRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [selectedTiles, emotionDetectionEnabled, emotionConfidence, currentEmotion]);

  // Speak message
  const handleSpeakMessage = useCallback(async (message: ConversationMessage) => {
    if (message.tiles.length === 0) return;
    const text = message.tiles.map((t) => t.speechText ?? t.label).join(' ');
    setSpeakingMessageId(message.id);
    try {
      const emotionToUse = message.emotion ?? 'calm';
      await speak(text, emotionToUse, 'default', 100, selectedLanguage);
    } catch (error) {
      console.error('Speak message failed:', error);
    } finally {
      setSpeakingMessageId(null);
    }
  }, []);

  // Save conversation
  const handleSaveConversation = useCallback(async () => {
    if (messages.length === 0) {
      setDialog({ visible: true, type: 'saved', message: 'Record a conversation first.' });
      return;
    }

    const createdAt = currentConversationStartTime || new Date();
    const titleSource = messages[0]?.original ?? 'Conversation';
    const title = titleSource.length > 80 ? `${titleSource.slice(0, 77)}...` : titleSource;
    const duration = formatDuration(createdAt);

    const payload: SavedConversation = {
      id: String(Date.now()),
      createdAt: createdAt.toISOString(),
      title,
      messages,
      duration,
    };

    try {
      const next = [payload, ...savedConversations].slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedConversations(next);
      setHasUnsavedChanges(false);
      setDialog({ visible: true, type: 'saved', message: 'Conversation saved!' });
    } catch (e) {
      console.error('Save conversation failed:', e);
      setDialog({ visible: true, type: 'saved', message: 'Could not save.' });
    }
  }, [messages, savedConversations, currentConversationStartTime]);

  // Delete saved conversation
  const handleDeleteConversation = useCallback(async (id: string) => {
    const next = savedConversations.filter((c) => c.id !== id);
    setSavedConversations(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('Delete conversation failed:', e);
    }
  }, [savedConversations]);

  // Back to list
  const handleBackToList = useCallback(async () => {
    // Auto-save conversation if there are messages
    if (messages.length > 0) {
      const createdAt = currentConversationStartTime || new Date();
      const titleSource = messages[0]?.original ?? 'Conversation';
      const title = titleSource.length > 80 ? `${titleSource.slice(0, 77)}...` : titleSource;
      const duration = formatDuration(createdAt);

      const payload: SavedConversation = {
        id: currentConversationId || String(Date.now()),
        createdAt: createdAt.toISOString(),
        title,
        messages,
        duration,
      };

      try {
        let next: SavedConversation[];
        if (currentConversationId) {
          // Update existing conversation
          next = savedConversations.map(c => c.id === currentConversationId ? payload : c);
        } else {
          // Create new conversation
          next = [payload, ...savedConversations].slice(0, 50);
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSavedConversations(next);
      } catch (e) {
        console.error('Auto-save conversation failed:', e);
      }
    }

    // Clear state and go back to list
    setMessages([]);
    setSelectedTiles([]);
    setSuggestedReplies([]);
    setHasUnsavedChanges(false);
    setCurrentConversationId(null);
    setViewMode('list');
  }, [messages, savedConversations, currentConversationStartTime, currentConversationId]);

  const closeDialog = () => setDialog({ visible: false, type: null });

  const confirmLeave = async () => {
    // Auto-save conversation if there are messages
    if (messages.length > 0) {
      const createdAt = currentConversationStartTime || new Date();
      const titleSource = messages[0]?.original ?? 'Conversation';
      const title = titleSource.length > 80 ? `${titleSource.slice(0, 77)}...` : titleSource;
      const duration = formatDuration(createdAt);

      const payload: SavedConversation = {
        id: currentConversationId || String(Date.now()),
        createdAt: createdAt.toISOString(),
        title,
        messages,
        duration,
      };

      try {
        let next: SavedConversation[];
        if (currentConversationId) {
          // Update existing conversation
          next = savedConversations.map(c => c.id === currentConversationId ? payload : c);
        } else {
          // Create new conversation
          next = [payload, ...savedConversations].slice(0, 50);
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSavedConversations(next);
      } catch (e) {
        console.error('Auto-save conversation failed:', e);
      }
    }

    if (pendingNavAction) {
      navigation.dispatch(pendingNavAction);
      setPendingNavAction(null);
    } else {
      setMessages([]);
      setSelectedTiles([]);
      setSuggestedReplies([]);
      setHasUnsavedChanges(false);
      setCurrentConversationId(null);
      setViewMode('list');
    }
    closeDialog();
  };

  // Suggested reply tap
  const handleSuggestedReply = useCallback((suggestion: string) => {
    const words = suggestion.toLowerCase().split(/\s+/);
    const matchedTiles = words
      .map((word) => tiles.find((t) => t.label.toLowerCase() === word))
      .filter((t): t is Tile => Boolean(t));
    if (matchedTiles.length > 0) {
      setSelectedTiles(matchedTiles);
    }
  }, [tiles]);

  // Render conversation row (ChatGPT style)
  const renderMessage = useCallback(({ item }: { item: ConversationMessage }) => {
    const isIncoming = item.type === 'incoming';
    const avatarUrl = isIncoming ? speakerAvatarUrl : youAvatarUrl;
    const emotionLabel = !isIncoming && item.emotion
      ? `${item.emotion} (${Math.round(item.emotionConfidence ?? 0)}%)`
      : null;
    
    return (
      <View style={[styles.messageRow, isIncoming ? styles.messageRowIncoming : styles.messageRowOutgoing]}>
        <View style={[styles.messageAvatar, isIncoming ? styles.avatarIncoming : styles.avatarOutgoing]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{isIncoming ? '🗣️' : '💬'}</Text>
          )}
        </View>
        <View style={styles.messageBubbleWrapper}>
          {/* Chat bubble triangle */}
          <View style={[
            styles.messageTail,
            isIncoming ? styles.messageTailIncoming : styles.messageTailOutgoing
          ]} />
          <View style={[
            styles.messageBubble,
            isIncoming ? styles.messageBubbleIncoming : styles.messageBubbleOutgoing
          ]}>
            <View style={styles.messageHeaderRow}>
              <Text style={styles.messageSender}>{isIncoming ? 'Speaker' : 'You'}</Text>
              {emotionLabel && <Text style={styles.messageEmotion}>{emotionLabel}</Text>}
            </View>
            <Text style={styles.messageText}>{item.original}</Text>
            
            {item.isLoading ? (
              <LoadingShimmer />
            ) : item.tiles.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tilesScroll}>
                <View style={styles.tilesRow}>
                {item.tiles.map((tile, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === item.tiles.length - 1;
                  const edges = {
                    top: 'flat',
                    bottom: 'flat',
                    left: isFirst ? 'flat' : 'slot',
                    right: 'tab',
                  } as const;
                  return (
                    <Pressable 
                      key={`${tile.id}-${idx}`} 
                      onPress={() => handleTilePress(tile)} 
                      style={[styles.puzzlePieceWrapper, !isLast && styles.puzzlePieceConnected]}
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
                })}              </View>
            </ScrollView>
          ) : null}
          
          {item.tiles.length > 0 && !item.isLoading && (
            <Pressable 
              onPress={() => handleSpeakMessage(item)}
              disabled={speakingMessageId === item.id}
              style={styles.speakBtn}
            >
              {speakingMessageId === item.id ? (
                <ActivityIndicator size="small" color="#0369a1" />
              ) : (
                <Text style={styles.speakBtnIcon}>🔊</Text>
              )}
            </Pressable>
          )}
          </View>
        </View>
      </View>
    );
  }, [handleTilePress, handleSpeakMessage, speakingMessageId, speakerAvatarUrl, youAvatarUrl]);

  // Conversation list item component
  const ConversationListItem = ({ item }: { item: SavedConversation }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <Pressable 
        style={styles.listItem}
        onPress={() => handleLoadConversation(item)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
      >
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.listItemMeta}>
            <Text style={styles.listItemDate}>{formatDate(item.createdAt)}</Text>
            {item.duration && <Text style={styles.listItemDuration}>{item.duration}</Text>}
          </View>
        </View>
        {isHovered && (
          <Pressable 
            style={styles.deleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteConversation(item.id);
            }}
          >
            <Text style={styles.deleteBtnText}>×</Text>
          </Pressable>
        )}
      </Pressable>
    );
  };

  // Render saved conversation item (Voice Memos style)
  const renderConversationItem = useCallback(({ item }: { item: SavedConversation }) => (
    <ConversationListItem item={item} />
  ), [handleLoadConversation, handleDeleteConversation]);

  // LIST VIEW - Voice Memos style
  if (viewMode === 'list') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.listContainer}>
          {/* Header */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Transcriptions</Text>
            <Text style={styles.listSubtitle}>{savedConversations.length} recordings</Text>
          </View>

          {/* Conversations List */}
          {loadingHistory ? (
            <ActivityIndicator size="large" color="#0ea5e9" style={styles.loader} />
          ) : savedConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎙️</Text>
              <Text style={styles.emptyTitle}>No Recordings</Text>
              <Text style={styles.emptySubtitle}>Tap the button below to start transcribing</Text>
            </View>
          ) : (
            <FlatList
              data={savedConversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversationItem}
              contentContainerStyle={styles.listContent}
            />
          )}

        {/* Floating Transcribe Button */}
        <Pressable
          style={[styles.floatingButton, !isSupported && styles.disabled]}
          onPress={handleStartNewConversation}
          disabled={!isSupported}
        >
          <Text style={styles.floatingButtonIcon}>🎙️</Text>
          <Text style={styles.floatingButtonText}>New Transcription</Text>
        </Pressable>
        </View>

        {/* Dialog Modal - only for simple alerts */}
        <Modal visible={dialog.visible} transparent animationType="fade" onRequestClose={closeDialog}>
          <View style={styles.dialogOverlay}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogMessage}>{dialog.message}</Text>
              <View style={styles.dialogActions}>
                <Pressable onPress={closeDialog} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
                  <Text style={styles.dialogBtnTextPrimary}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // CHAT VIEW - ChatGPT style with tiles
  const chatSection = (
    <View style={[styles.chatSection, isLandscape && styles.chatSectionLandscape]}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <Pressable onPress={handleBackToList} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.chatTitle}>Transcription</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={messagesRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        ListEmptyComponent={
          <View style={styles.chatEmpty}>
            <Text style={styles.chatEmptyText}>Tap the microphone to start listening</Text>
          </View>
        }
        onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Interim Transcript */}
      {interimTranscript ? (
        <View style={styles.interimBox}>
          <Text style={styles.interimLabel}>Listening...</Text>
          <Text style={styles.interimText}>{interimTranscript}</Text>
        </View>
      ) : null}

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
          <View style={styles.suggestionsRow}>
            {suggestedReplies.map((s, idx) => (
              <Pressable key={idx} style={styles.suggestionChip} onPress={() => handleSuggestedReply(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Selected Tiles Bar */}
      <View style={styles.selectedBar}>
        {/* Emotion Camera Badge */}
        <View style={styles.emotionBadgeWrapper}>
          <EmotionCameraBadge
            active={emotionDetectionEnabled}
            emotion={currentEmotion}
            confidence={emotionConfidence}
            onToggle={() => setEmotionDetectionEnabled((prev) => !prev)}
            onEmotionDetected={(emotion, confidence) => {
              setCurrentEmotion(emotion);
              setEmotionConfidence(confidence);
            }}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll}>
          <View style={styles.selectedTilesRow}>
            {selectedTiles.map((tile, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === selectedTiles.length - 1;
              const edges = {
                top: 'flat',
                bottom: 'flat',
                left: isFirst ? 'flat' : 'slot',
                right: 'tab',
              } as const;
              return (
                <Pressable 
                  key={`${tile.id}-${idx}`} 
                  onPress={() => handleRemoveTile(idx)} 
                  style={[styles.puzzlePieceWrapper, !isLast && styles.puzzlePieceConnected]}
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
            })}
            {selectedTiles.length === 0 && (
              <Text style={styles.selectedPlaceholder}>🎤 Tap to speak or select tiles to reply</Text>
            )}
          </View>
        </ScrollView>
        
        {/* Microphone Button */}
        <Pressable
          onPress={handleMicPress}
          disabled={!isSupported || processing}
          style={[
            styles.micButtonCompact,
            micState === 'listening' && styles.micButtonListening,
            processing && styles.micButtonProcessing,
            !isSupported && styles.disabled,
          ]}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.micIconCompact}>{micState === 'listening' ? '🔴' : '🎤'}</Text>
          )}
        </Pressable>
        
        {selectedTiles.length > 0 && (
          <Pressable style={styles.sendBtn} onPress={handleSendReply}>
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );

  const tilesSection = (
    <View style={[styles.tilesSection, isLandscape && styles.tilesSectionLandscape]}>
      <View style={styles.folderRow}>
        <Text style={styles.breadcrumb}>{breadcrumb}</Text>
        {folderPath.length > 0 && (
          <Pressable onPress={goBack} style={styles.folderBackBtn}>
            <Text style={styles.folderBackText}>Back</Text>
          </Pressable>
        )}
      </View>
      <TileGrid tiles={visibleTiles} onTilePress={handleTilePress} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {isLandscape ? (
        <View style={styles.landscapeContainer}>
          {chatSection}
          {tilesSection}
        </View>
      ) : (
        <View style={styles.portraitContainer}>
          {chatSection}
          {tilesSection}
        </View>
      )}

      {/* Dialog Modal */}
      <Modal visible={dialog.visible} transparent animationType="fade" onRequestClose={closeDialog}>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogMessage}>{dialog.message}</Text>
            <View style={styles.dialogActions}>
              {dialog.type === 'leave' ? (
                <>
                  <Pressable onPress={closeDialog} style={[styles.dialogBtn, styles.dialogBtnSecondary]}>
                    <Text style={styles.dialogBtnText}>Stay</Text>
                  </Pressable>
                  <Pressable onPress={confirmLeave} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
                    <Text style={styles.dialogBtnTextPrimary}>Leave</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={closeDialog} style={[styles.dialogBtn, styles.dialogBtnPrimary]}>
                  <Text style={styles.dialogBtnTextPrimary}>OK</Text>
                </Pressable>
              )}
            </View>
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

  // LIST VIEW STYLES
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: Colors.background.primary,
  },
  listTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral[900],
  },
  listSubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: 120,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: Colors.background.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  listItemMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  listItemDate: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  listItemDuration: {
    fontSize: 13,
    color: Colors.neutral[400],
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 28,
    color: Colors.background.card,
    fontWeight: '400',
    lineHeight: 28,
    marginTop: -2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing['4xl'],
    fontWeight: '500',
  },
  loader: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: Colors.primary.base,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
  floatingButtonText: {
    fontSize: 16,
    color: Colors.background.card,
    fontWeight: '700',
  },

  // CHAT VIEW STYLES
  portraitContainer: {
    flex: 1,
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatSection: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral[300],
  },
  chatSectionLandscape: {
    flex: 1,
  },
  tilesSection: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[300],
  },
  tilesSectionLandscape: {
    flex: 1.025,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: radius.md,
  },
  backBtnText: {
    fontSize: 15,
    color: Colors.neutral[700],
    fontWeight: '600',
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  headerSpacer: {
    width: 60,
  },
  emotionRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: Colors.background.card,
  },
  messagesContent: {
    padding: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chatEmpty: {
    padding: spacing['4xl'],
    alignItems: 'center',
  },
  chatEmptyText: {
    fontSize: 15,
    color: Colors.neutral[400],
    textAlign: 'center',
  },

  // Message Row
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  messageRowIncoming: {
    marginRight: spacing['4xl'],
  },
  messageRowOutgoing: {
    marginLeft: spacing['4xl'],
    flexDirection: 'row-reverse',
  },
  messageBubbleWrapper: {
    flex: 1,
    position: 'relative',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBubbleIncoming: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 4,
  },
  messageBubbleOutgoing: {
    backgroundColor: Colors.primary.base + '15',
    borderTopRightRadius: 4,
  },
  messageTail: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  messageTailIncoming: {
    left: -8,
    borderTopWidth: 0,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: Colors.background.card,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  messageTailOutgoing: {
    right: -8,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 10,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.primary.base + '15',
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIncoming: {
    backgroundColor: Colors.secondary.base,
  },
  avatarOutgoing: {
    backgroundColor: Colors.primary.base,
  },
  avatarText: {
    fontSize: 16,
  },
  avatarImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  messageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageEmotion: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.dark,
    textTransform: 'capitalize',
  },
  messageText: {
    fontSize: 15,
    color: Colors.neutral[900],
    lineHeight: 22,
  },
  tilesScroll: {
    marginTop: spacing.xs,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  puzzlePieceWrapper: {
    width: 85,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  puzzlePieceConnected: {
    marginRight: -28,
  },
  speakBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    backgroundColor: Colors.secondary.base + '30',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakBtnIcon: {
    fontSize: 18,
  },

  // Interim transcript
  interimBox: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: Colors.warning + '20',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '50',
  },
  interimLabel: {
    fontSize: 11,
    color: Colors.neutral[600],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  interimText: {
    fontSize: 14,
    color: Colors.neutral[800],
  },

  // Suggestions
  suggestionsScroll: {
    maxHeight: 44,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: Colors.secondary.base + '20',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary.base + '40',
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.secondary.dark,
    fontWeight: '700',
  },

  // Selected tiles bar
  selectedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.soft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    minHeight: 80,
    borderTopWidth: 0,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  selectedScroll: {
    flex: 1,
  },
  selectedTilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
  },
  selectedPlaceholder: {
    fontSize: 15,
    color: Colors.neutral[400],
  },
  emotionBadgeWrapper: {
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary.base,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: spacing.sm,
  },

  // Mic button
  micContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: Colors.background.card,
    borderTopWidth: 0,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  micButtonCompact: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: Colors.secondary.base,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondary.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: spacing.sm,
    borderWidth: 2,
    borderColor: Colors.secondary.dark,
  },
  micButtonListening: {
    backgroundColor: Colors.error,
    ...shadows.glow,
  },
  micButtonProcessing: {
    backgroundColor: Colors.neutral[500],
  },
  micIcon: {
    fontSize: 30,
  },
  micIconCompact: {
    fontSize: 24,
  },

  // Folder navigation
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background.primary,
  },
  breadcrumb: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  folderBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.background.card,
    borderRadius: radius.xl,
    ...shadows.soft,
  },
  folderBackText: {
    fontSize: 14,
    color: Colors.neutral[700],
    fontWeight: '700',
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.background.card,
    borderRadius: radius['3xl'],
    padding: spacing['2xl'],
    gap: spacing.xl,
    ...shadows.large,
  },
  dialogMessage: {
    fontSize: 17,
    color: Colors.neutral[800],
    textAlign: 'center',
    lineHeight: 26,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  dialogBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
  },
  dialogBtnSecondary: {
    backgroundColor: Colors.neutral[100],
  },
  dialogBtnPrimary: {
    backgroundColor: Colors.primary.base,
    ...shadows.glow,
  },
  dialogBtnText: {
    fontSize: 16,
    color: Colors.neutral[700],
    fontWeight: '700',
  },
  dialogBtnTextPrimary: {
    fontSize: 16,
    color: Colors.background.card,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.5,
  },
});
 
