import Text from '@/components/FontText';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import PuzzlePiece from '@/components/PuzzlePiece';
import { lightenColor } from '@/components/TileCard';

import {
  InfiniteBoard,
  PlacedImage,
  PlacedTile,
  Stroke,
  describeBoardContent,
} from '@/components/InfiniteBoard';
import { TileGrid } from '@/components/TileGrid';
import Colors, { radius, shadows, spacing } from '@/constants/Colors';
import { tabBarBottomOffset, tabBarHeight } from '@/constants/Layout';
import { Tile } from '@/constants/tiles';
import { speak } from '@/services/elevenlabs';
import { interpretBoard } from '@/services/openrouter';
import { searchSymbol } from '@/services/opensymbols';
import { getBreadcrumbLabels, tilesMap, useAacStore, visibleTilesForPath } from '@/state/useAacStore';
import { useSettingsStore } from '@/state/useSettingsStore';
import { drawingToBase64Image } from '@/utils/drawingToImage';
import * as Speech from 'expo-speech';

type Mode = 'draw' | 'pan' | 'erase' | 'select';

const COLORS = ['#0f172a', '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];
const WIDTHS = [2, 4, 8, 12];

type IconKey = 'draw' | 'erase' | 'choose' | 'move' | 'undo' | 'delete' | 'speak' | 'words' | 'photos' | 'camera';

const IconImage = ({ iconKey, fallback, size = 24, cache, onCache }: { iconKey: IconKey; fallback: string; size?: number; cache: Record<IconKey, string | null>; onCache: (key: IconKey, url: string | null) => void; }) => {
  const uri = cache[iconKey];
  useEffect(() => {
    if (uri !== null && uri !== undefined) return;
    let cancelled = false;
    searchSymbol(iconKey).then((res) => {
      if (cancelled) return;
      onCache(iconKey, res?.image_url ?? null);
    });
    return () => { cancelled = true; };
  }, [iconKey, uri, onCache]);

  if (!uri) {
    return <Text style={[styles.controlIcon, { fontSize: size }]}>{fallback}</Text>;
  }
  return <Image source={{ uri }} style={{ width: size, height: size, resizeMode: 'contain' }} />;
};

// Component to render a word tile in interpretations with dynamic image loading
const InterpretationWord = React.memo(({
  tile,
  edges,
  isLast,
  imageCache,
  onImageLoaded,
}: {
  tile: Tile;
  edges: { top: 'tab' | 'slot' | 'flat'; right: 'tab' | 'slot' | 'flat'; bottom: 'tab' | 'slot' | 'flat'; left: 'tab' | 'slot' | 'flat' };
  isLast: boolean;
  imageCache: Record<string, string | null>;
  onImageLoaded: (tileId: string, url: string | null) => void;
}) => {
  const [img, setImg] = useState<string | null>(imageCache[tile.id] ?? null);

  useEffect(() => {
    if (imageCache[tile.id] !== undefined) {
      setImg(imageCache[tile.id]);
      return;
    }
    if (tile.imageUrl) {
      setImg(tile.imageUrl);
      onImageLoaded(tile.id, tile.imageUrl);
      return;
    }
    let cancelled = false;
    searchSymbol(tile.label).then((result) => {
      if (!cancelled) {
        const url = result?.image_url ?? null;
        setImg(url);
        onImageLoaded(tile.id, url);
      }
    });
    return () => { cancelled = true; };
  }, [tile.id, tile.label, tile.imageUrl, imageCache, onImageLoaded]);

  return (
    <View 
      style={[styles.interpretationPuzzlePiece, !isLast && styles.interpretationPuzzlePieceConnected]}
    >
      <PuzzlePiece
        width={90}
        height={90}
        tabSize={18}
        fontSize={13}
        cornerRadius={10}
        strokeColor={tile.color}
        fillColor={lightenColor(tile.color, 0.35)}
        label={tile.label}
        imageUrl={img ?? undefined}
        seed={tile.id}
        edges={edges}
      />
    </View>
  );
});

// Convert image URI to base64 data URI for the vision API
async function imageUriToBase64(uri: string): Promise<string> {
  // On web, if URI is already a data URI or blob URL, fetch and convert
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result); // Already includes data:image/...;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw error;
    }
  }
  
  // On native, use fetch and blob API (modern approach)
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result); // Already includes data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to read image as base64:', error);
    throw error;
  }
}

export default function BoardScreen() {
  const tiles = useAacStore((state) => state.tiles);
  const folderPath = useAacStore((state) => state.folderPath);
  const goBack = useAacStore((state) => state.goBack);
  const openFolder = useAacStore((state) => state.openFolder);
  const visibleTiles = useMemo(() => visibleTilesForPath(tiles, folderPath), [tiles, folderPath]);
  const tileMap = useMemo(() => tilesMap(tiles), [tiles]);
  const selectedLanguage = useSettingsStore((state) => state.selectedLanguage);

  // Board state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [placedImages, setPlacedImages] = useState<PlacedImage[]>([]);

  // Tool state
  const [mode, setMode] = useState<Mode>('draw');
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Native TTS helpers for tile press
  const normalizeSpeechText = useCallback((text: string): string => {
    const trimmed = text.trim();
    if (trimmed === 'I') return 'I.';
    return trimmed;
  }, []);
  const ttsOptions = useMemo(() => ({ language: 'en-US', rate: 0.92, pitch: 1.0, volume: 1.0 }), []);

  // UI state
  const [showPalette, setShowPalette] = useState(false);
  const [interpretations, setInterpretations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [interpretationWordImages, setInterpretationWordImages] = useState<Record<string, string | null>>({});
  const [interpretationWordTiles, setInterpretationWordTiles] = useState<Record<string, Tile>>({});
  const [iconCache, setIconCache] = useState<Record<IconKey, string | null>>({
    draw: null,
    erase: null,
    choose: null,
    move: null,
    undo: null,
    delete: null,
    speak: null,
    words: null,
    photos: null,
    camera: null,
  });
  const handleIconCache = useCallback((key: IconKey, url: string | null) => {
    setIconCache((prev) => ({ ...prev, [key]: url }));
  }, []);
  
  // Tile popup modal state
  const [selectedTileForPopup, setSelectedTileForPopup] = useState<Tile | null>(null);
  const [tilePopupImage, setTilePopupImage] = useState<string | null>(null);
  
  // Safe area insets for proper control positioning
  const insets = useSafeAreaInsets();

  // Always clear stale interpretations when the board content changes so Interpret reruns on latest state
  useEffect(() => {
    setInterpretations([]);
  }, [strokes, placedTiles, placedImages]);

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

  // Build word -> tile map for interpretations so words stay consistent and fetch symbols if missing
  useEffect(() => {
    const run = async () => {
      const wordSet = new Set<string>();
      interpretations.forEach((sentence) => {
        const cleaned = sentence.toLowerCase().replace(/[.,!?;:]/g, ' ');
        cleaned.split(/\s+/).forEach((w) => { if (w.trim()) wordSet.add(w.trim()); });
      });

      if (wordSet.size === 0) {
        setInterpretationWordTiles({});
        return;
      }

      const next: Record<string, Tile> = {};
      for (const word of wordSet) {
        // Try to find an existing tile by label
        const match = tiles.find((t) => t.label.toLowerCase() === word || word.includes(t.label.toLowerCase()) || t.label.toLowerCase().includes(word));
        if (match) {
          next[word] = match;
          continue;
        }

        // Otherwise fetch symbol and create a temporary tile-like entry
        try {
          const result = await searchSymbol(word);
          next[word] = {
            id: `word-${word}`,
            label: word,
            color: Colors.primary.soft,
            imageUrl: result?.image_url ?? undefined,
          } as Tile;
        } catch (e) {
          next[word] = {
            id: `word-${word}`,
            label: word,
            color: Colors.primary.soft,
          } as Tile;
        }
      }

      setInterpretationWordTiles(next);
    };

    run();
  }, [interpretations, tiles]);

  // Handler for tile click to show popup
  const handleTilePopup = useCallback((tile: Tile) => {
    if (tile.isFolder) return;
    setSelectedTileForPopup(tile);
  }, []);

  const { width, height } = useWindowDimensions();

  const breadcrumb = useMemo(() => {
    const labels = getBreadcrumbLabels(folderPath, tileMap);
    return labels.length === 0 ? 'Home' : ['Home', ...labels].join(' / ');
  }, [folderPath, tileMap]);

  // Track tile scales for proper sequential placement
  const [tileScales, setTileScales] = useState<Record<string, number>>({});

  const handleAddTileToBoard = useCallback((tile: Tile) => {
    if (tile.isFolder) {
      openFolder(tile.id);
      return;
    }
    
    // Speak the word on tap (native TTS)
    const raw = tile.speechText ?? tile.label;
    const text = normalizeSpeechText(raw);
    Speech.speak(text, ttsOptions);

    // Calculate position - place tiles sequentially in a horizontal row
    const BASE_TILE_SIZE = 180; // Match the size in InfiniteBoard.tsx
    const TILE_GAP = 15; // Increased gap for larger tiles
    const START_X = 50; // Starting X position
    const START_Y = height / 3; // Starting Y position (upper third of screen)
    
    // Find the rightmost tile to place the new one next to it
    let nextX = START_X;
    let nextY = START_Y;
    
    if (placedTiles.length > 0) {
      // Find the rightmost tile, accounting for its actual size
      let rightEdge = START_X;
      let rightTileY = START_Y;
      
      for (const pt of placedTiles) {
        const ptScale = tileScales[pt.id] || 1;
        const ptWidth = BASE_TILE_SIZE * ptScale;
        const ptRightEdge = pt.x + ptWidth;
        
        if (ptRightEdge > rightEdge) {
          rightEdge = ptRightEdge;
          rightTileY = pt.y;
        }
      }
      
      nextX = rightEdge + TILE_GAP;
      nextY = rightTileY;
      
      // If going off screen, wrap to next row
      if (nextX + BASE_TILE_SIZE > width - 50) {
        nextX = START_X;
        // Find the lowest tile to start a new row below it
        let lowestEdge = START_Y;
        for (const pt of placedTiles) {
          const ptScale = tileScales[pt.id] || 1;
          const ptHeight = BASE_TILE_SIZE * ptScale;
          const ptBottomEdge = pt.y + ptHeight;
          if (ptBottomEdge > lowestEdge) {
            lowestEdge = ptBottomEdge;
          }
        }
        nextY = lowestEdge + TILE_GAP;
      }
    }
    
    const newTile: PlacedTile = {
      id: `tile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tile,
      x: nextX,
      y: nextY,
    };
    setPlacedTiles((prev) => [...prev, newTile]);
    setShowPalette(false);
    setInterpretations([]);
  }, [width, height, openFolder, placedTiles, tileScales]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setPlacedTiles([]);
    setPlacedImages([]);
    setInterpretations([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (strokes.length > 0) {
      setStrokes((prev) => prev.slice(0, -1));
    } else if (placedTiles.length > 0) {
      setPlacedTiles((prev) => prev.slice(0, -1));
    }
  }, [strokes.length, placedTiles.length]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.4,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });
      
      if (!result.canceled && result.assets?.length) {
        const newImages: PlacedImage[] = result.assets.map((asset, index) => ({
          id: `img-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          uri: asset.uri,
          x: width / 2 - 75 + (index * 30),
          y: height / 2 - 75 + (index * 30),
          width: 150,
          height: 150,
        }));
        setPlacedImages((current) => [...current, ...newImages]);
        setInterpretations([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  }, [width, height]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.4,
        allowsEditing: false,
      });
      
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const newImage: PlacedImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          uri: asset.uri,
          x: width / 2 - 75,
          y: height / 2 - 75,
          width: 150,
          height: 150,
        };
        setPlacedImages((current) => [...current, newImage]);
        setInterpretations([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  }, [width, height]);

  const handleInterpret = useCallback(async () => {
    if (strokes.length === 0 && placedTiles.length === 0 && placedImages.length === 0) {
      Alert.alert('Nothing to interpret', 'Draw something or add tiles first.');
      return;
    }

    setLoading(true);
    try {
      const boardDescription = describeBoardContent(strokes, placedTiles, placedImages);
      
      // Convert drawing to base64 image for vision API
      let drawingImageBase64: string | undefined;
      if (strokes.length > 0 || placedTiles.length > 0) {
        drawingImageBase64 = await drawingToBase64Image(strokes, placedTiles);
      }
      
      // Convert photo URIs to base64 data URIs so the AI can actually see them
      const photoBase64Uris: string[] = [];
      for (const img of placedImages) {
        try {
          const base64Uri = await imageUriToBase64(img.uri);
          photoBase64Uris.push(base64Uri);
        } catch (error) {
          console.error('Failed to convert photo to base64:', error);
        }
      }
      
      const results = await interpretBoard([], boardDescription, drawingImageBase64, photoBase64Uris);
      setInterpretations(results);
    } catch (error) {
      console.error('Interpretation failed:', error);
      Alert.alert('Error', 'Could not interpret the board.');
    } finally {
      setLoading(false);
    }
  }, [strokes, placedTiles, placedImages]);

   const handleSpeakInterpretation = useCallback(async (text: string) => {
     try {
       await speak(text, 'neutral', 'default', 100, selectedLanguage);
     } catch (error) {
       console.error('Speech failed:', error);
     }
   }, [selectedLanguage]);

  // Create puzzle piece tiles for each interpretation with the placed tiles
  const interpretationPieces = useMemo(() => {
    return placedTiles.map((pt) => pt.tile);
  }, [placedTiles]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Main infinite canvas */}
      <InfiniteBoard
        strokes={strokes}
        onStrokesChange={setStrokes}
        placedTiles={placedTiles}
        onPlacedTilesChange={setPlacedTiles}
        placedImages={placedImages}
        onPlacedImagesChange={setPlacedImages}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        mode={mode}
        tileScales={tileScales}
        onTileScalesChange={setTileScales}
        drawOverlay={mode === 'draw'}
      />

      {/* Floating controls - Right side, wrap into two columns instead of scrolling */}
      <View 
        style={[
          styles.floatingControlsContainer,
          { top: insets.top + 10, bottom: tabBarBottomOffset + tabBarHeight + spacing.md }
        ]}
      >
        {/* Left column: Colors and Sizes */}
        <View style={styles.leftColumn}>
          {/* Drawing tools (when in draw mode or overlay) */}
          {mode === 'draw' && (
            <View style={styles.controlGroup}>
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setStrokeColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    strokeColor === color && styles.selectedColor,
                  ]}
                />
              ))}
            </View>
          )}

          {mode === 'draw' && (
            <View style={styles.controlGroup}>
              {WIDTHS.map((w) => (
                <Pressable
                  key={w}
                  onPress={() => setStrokeWidth(w)}
                  style={[styles.widthButton, strokeWidth === w && styles.selectedWidth]}
                >
                  <View style={[styles.widthDot, { width: w * 2, height: w * 2, backgroundColor: strokeColor }]} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Middle/Right column: Mode buttons and actions */}
        <View style={styles.rightColumn}>
          {/* Mode buttons (draw acts like pen overlay by default) */}
          <View style={styles.controlGroup}>
            <Pressable
              onPress={() => { setMode('draw'); }}
              style={[styles.controlButton, mode === 'draw' && styles.activeButton]}
            >
              <IconImage iconKey="draw" fallback="✏️" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>draw</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('erase'); }}
              style={[styles.controlButton, mode === 'erase' && styles.activeButton]}
            >
              <IconImage iconKey="erase" fallback="🧽" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>erase</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('select'); }}
              style={[styles.controlButton, mode === 'select' && styles.activeButton]}
            >
              <IconImage iconKey="choose" fallback="👆" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>choose</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('pan'); }}
              style={[styles.controlButton, mode === 'pan' && styles.activeButton]}
            >
              <IconImage iconKey="move" fallback="✋" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>move</Text>
            </Pressable>
          </View>

          {/* Actions */}
          <View style={styles.controlGroup}>
            <Pressable onPress={handleUndo} style={styles.controlButton}>
              <IconImage iconKey="undo" fallback="↩️" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>undo</Text>
            </Pressable>
            <Pressable onPress={handleClear} style={styles.controlButton}>
              <IconImage iconKey="delete" fallback="✕" cache={iconCache} onCache={handleIconCache} />
              <Text style={styles.controlLabel}>delete</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom toolbar - wrapped in SafeAreaView to position at actual bottom */}
      <SafeAreaView style={styles.safeBottomBar} edges={['bottom']}>
        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => setShowPalette(!showPalette)}
            style={[styles.bottomButton, showPalette && styles.activeBottomButton]}
          >
            <IconImage iconKey="words" fallback="📋" cache={iconCache} onCache={handleIconCache} size={36} />
            <Text style={styles.bottomButtonText}>Words</Text>
          </Pressable>

          <Pressable onPress={handlePickImage} style={styles.bottomButton}>
            <IconImage iconKey="photos" fallback="🖼️" cache={iconCache} onCache={handleIconCache} size={36} />
            <Text style={styles.bottomButtonText}>Photos</Text>
          </Pressable>

          <Pressable onPress={handleTakePhoto} style={styles.bottomButton}>
            <IconImage iconKey="camera" fallback="📷" cache={iconCache} onCache={handleIconCache} size={36} />
            <Text style={styles.bottomButtonText}>Camera</Text>
          </Pressable>

          <Pressable
            onPress={handleInterpret}
            disabled={loading}
            style={[styles.speakButton, loading && styles.disabledButton]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconImage iconKey="speak" fallback="🔊" cache={iconCache} onCache={handleIconCache} size={36} />
                <Text style={styles.speakButtonText}>Speak</Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Tile palette drawer */}
      {showPalette && (
        <View style={[styles.paletteDrawer, { bottom: insets.bottom + 90 }]}>
          <View style={styles.paletteHeader}>
            <Text style={styles.paletteTitle}>Tap to add, long press for info</Text>
            <Pressable onPress={() => setShowPalette(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.folderRow}>
            <Text style={styles.breadcrumb}>{breadcrumb}</Text>
            {folderPath.length > 0 && (
              <Pressable onPress={goBack} style={styles.backButton}>
                <Text style={styles.secondaryText}>Back</Text>
              </Pressable>
            )}
          </View>
          <TileGrid
            tiles={visibleTiles}
            onTilePress={handleAddTileToBoard}
            onTileLongPress={handleTilePopup}
          />
        </View>
      )}

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
                      Speech.speak(text, ttsOptions);
                    }}
                  >
                    <Text style={styles.tilePopupButtonText}>🔊 Speak</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.tilePopupButton, styles.tilePopupPrimaryButton]}
                    onPress={() => {
                      handleAddTileToBoard(selectedTileForPopup);
                      setSelectedTileForPopup(null);
                    }}
                  >
                    <Text style={styles.tilePopupPrimaryButtonText}>➕ Add to Board</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Interpretations overlay - shows puzzle pieces below each text option */}
      <Modal
        visible={interpretations.length > 0}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setInterpretations([])}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.interpretationsScroll}>
            <View style={styles.interpretationsCard}>
              <View style={styles.interpretationsHeader}>
                <Text style={styles.interpretationsTitle}>What you said</Text>
                <Pressable onPress={() => setInterpretations([])}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>
              
              <Text style={styles.interpretationsHint}>Tap an option to speak</Text>
              {interpretations.map((text, i) => {
                // Clean the text and split into words
                const cleanedText = text.toLowerCase().replace(/[.,!?;:]/g, '');
                const words = cleanedText.split(/\s+/).filter(w => w.length > 0);
                
                // Match words to tiles using precomputed map
                const wordTiles = words
                  .map(word => interpretationWordTiles[word])
                  .filter((tile): tile is Tile => !!tile);

                return (
                  <Pressable
                    key={i}
                    onPress={() => handleSpeakInterpretation(text)}
                    style={styles.interpretationRowWithPuzzles}
                  >
                    <View style={styles.interpretationContent}>
                      <Text style={styles.interpretationText}>{text}</Text>
                      <Text style={styles.speakIcon}>🔊</Text>
                    </View>
                    {wordTiles.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.puzzlePiecesInsideRow}
                        contentContainerStyle={styles.puzzlePiecesRowContent}
                      >
                        {wordTiles.map((tile, index) => {
                          const isFirst = index === 0;
                          const isLast = index === wordTiles.length - 1;
                          const edges = {
                            top: 'flat',
                            bottom: 'flat',
                            left: isFirst ? 'flat' : 'slot',
                            right: isLast ? 'flat' : 'tab',
                          } as const;
                          return (
                            <InterpretationWord 
                              key={`${tile.id}-${index}`}
                              tile={tile}
                              edges={edges}
                              isLast={isLast}
                              imageCache={interpretationWordImages}
                              onImageLoaded={(tileId, url) => {
                                setInterpretationWordImages(prev => ({...prev, [tileId]: url}));
                              }}
                            />
                          );
                        })}
                      </ScrollView>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  floatingControlsContainer: {
    position: 'absolute',
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: 0,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  rightColumn: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  controlGroup: {
    backgroundColor: Colors.background.card,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.xs,
    ...shadows.medium,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  activeButton: {
    backgroundColor: Colors.primary.soft,
    borderWidth: 2,
    borderColor: Colors.primary.base,
  },
  activeOverlayButton: {
    backgroundColor: Colors.accent.yellowSoft,
    borderWidth: 2,
    borderColor: Colors.accent.yellow,
  },
  controlIcon: {
    fontSize: 22,
  },
  controlLabel: {
    fontSize: 11,
    color: Colors.neutral[700],
    fontWeight: '700',
    textAlign: 'center',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  widthButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedWidth: {
    backgroundColor: Colors.primary.soft,
    borderWidth: 2,
    borderColor: Colors.primary.base,
  },
  widthDot: {
    borderRadius: radius.full,
  },
  safeBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    zIndex: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    ...shadows.large,
  },
  bottomButton: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.neutral[100],
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  activeBottomButton: {
    backgroundColor: Colors.primary.soft,
    borderColor: Colors.primary.base,
  },
  bottomButtonText: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 14,
  },
  speakButton: {
    flex: 1.2,
    minWidth: 90,
    backgroundColor: Colors.primary.base,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary.base,
    ...shadows.glow,
  },
  speakButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  paletteDrawer: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: 80,
    backgroundColor: Colors.background.card,
    borderRadius: radius['2xl'],
    maxHeight: 300,
    ...shadows.large,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 0,
  },
  paletteTitle: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 16,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.neutral[400],
    padding: spacing.sm,
  },
  interpretationsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31, 27, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  interpretationsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: radius['3xl'],
    padding: spacing['3xl'],
    width: '100%',
    maxWidth: 450,
    ...shadows.large,
  },
  interpretationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  interpretationsTitle: {
    color: Colors.neutral[900],
    fontWeight: '800',
    fontSize: 26,
    letterSpacing: -0.3,
    marginBottom: spacing.lg,
  },
  interpretationsHint: {
    color: Colors.neutral[600],
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  interpretationRow: {
    backgroundColor: Colors.secondary.soft,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: Colors.secondary.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.soft,
  },
  interpretationRowWithPuzzles: {
    backgroundColor: Colors.secondary.soft,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: Colors.secondary.base,
    flexDirection: 'column',
    ...shadows.soft,
  },
  interpretationText: {
    color: Colors.neutral[900],
    fontWeight: '700',
    fontSize: 19,
    flex: 1,
  },
  speakIcon: {
    fontSize: 24,
    marginLeft: spacing.md,
  },
  interpretationsScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  puzzlePieceBelowText: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginLeft: spacing['2xl'],
  },
  puzzlePiecesRowBelow: {
    marginBottom: spacing.xl,
    marginHorizontal: spacing.md,
    flexGrow: 0,
  },
  puzzlePiecesInsideRow: {
    marginTop: spacing.md,
    flexGrow: 0,
  },
  puzzlePiecesRowContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  puzzlePieceContainer: {
    marginRight: spacing.sm,
  },
  interpretationPuzzlePiece: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interpretationPuzzlePieceConnected: {
    marginRight: -28,
  },
  interpretationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 24, 0.8)',
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
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  tilePopupButtonText: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 17,
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
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  breadcrumb: {
    color: Colors.neutral[800],
    fontWeight: '700',
    fontSize: 15,
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
  secondaryText: {
    color: Colors.neutral[700],
    fontWeight: '700',
  },
});
 
