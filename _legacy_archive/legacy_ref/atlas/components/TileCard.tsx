import Text from '@/components/FontText';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import FolderShape from './FolderShape';
import PuzzlePiece from './PuzzlePiece';

import Colors, { radius, spacing } from '@/constants/Colors';
import { Tile } from '@/constants/tiles';
import { searchSymbol } from '@/services/opensymbols';

type TileCardProps = {
  tile: Tile;
  onPress: () => void;
  onLongPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
};

// Cache images per tile id
const imageCache = new Map<string, string | null>();

export function TileCard({ tile, onPress, onLongPress, size = 'medium', showLabel = true }: TileCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(tile.imageUrl ?? imageCache.get(tile.id) ?? null);
  const [loading, setLoading] = useState(!imageUrl && !tile.isFolder);
  const [pressed, setPressed] = useState(false);

  const baseColor = tile.color;
  const innerColor = lightenColor(baseColor, 0.3);
  const displayLabel = tile.label === 'I' ? 'I' : tile.label.toLowerCase();
  const shouldShowLabel = showLabel || tile.isFolder;

  useEffect(() => {
    if (tile.isFolder || imageUrl) return;

    if (imageCache.has(tile.id)) {
      setImageUrl(imageCache.get(tile.id) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadImage() {
      try {
        const result = await searchSymbol(tile.label);
        if (!cancelled && result?.image_url) {
          imageCache.set(tile.id, result.image_url);
          setImageUrl(result.image_url);
        } else {
          imageCache.set(tile.id, null);
        }
      } catch {
        imageCache.set(tile.id, null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImage();
    return () => { cancelled = true; };
  }, [tile.id, tile.label, tile.isFolder, imageUrl]);

  const sizeStyles = {
    small: { padding: spacing.sm },
    medium: { padding: spacing.md },
    large: { padding: spacing.lg },
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        sizeStyles[size],
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.pieceContainer, pressed && styles.pieceContainerPressed]}>
        {tile.isFolder ? (
          <FolderShape
            width={160}
            height={160}
            strokeColor={baseColor}
            fillColor={innerColor}
            label={shouldShowLabel ? displayLabel : undefined}
            fontSize={22}
          />
        ) : (
          <PuzzlePiece
            width={160}
            height={160}
            cornerRadius={radius.xl}
            tabSize={28}
            strokeColor={baseColor}
            fillColor={innerColor}
            imageUrl={imageUrl ?? undefined}
            label={shouldShowLabel ? displayLabel : undefined}
            fontSize={22}
            seed={tile.id}
          />
        )}
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary.base} />
        </View>
      )}
    </Pressable>
  );
}

type ChipProps = {
  tile: Tile;
  onPress?: () => void;
  variant?: 'sentence' | 'suggestion';
};

export function TileChip({ tile, onPress, variant = 'sentence' }: ChipProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(imageCache.get(tile.id) ?? null);

  const chipImageSize = variant === 'sentence' ? 32 : 24;
  const baseColor = tile.color;
  const innerColor = lightenColor(baseColor, 0.4);
  const displayLabel = tile.label === 'I' ? 'I' : tile.label.toLowerCase();

  useEffect(() => {
    if (imageUrl || imageCache.has(tile.id)) {
      if (!imageUrl) setImageUrl(imageCache.get(tile.id) ?? null);
      return;
    }

    searchSymbol(tile.label).then((result) => {
      if (result?.image_url) {
        imageCache.set(tile.id, result.image_url);
        setImageUrl(result.image_url);
      }
    });
  }, [tile.id, tile.label, imageUrl]);

  const isSuggestion = variant === 'suggestion';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isSuggestion ? styles.suggestionChip : { backgroundColor: innerColor, borderColor: baseColor },
        pressed && styles.chipPressed,
      ]}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.chipImage, { width: chipImageSize, height: chipImageSize }]}
          resizeMode="contain"
        />
      )}
      <Text style={isSuggestion ? styles.suggestionText : styles.chipText}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

export function lightenColor(hex: string, factor: number) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor));
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * factor));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  pieceContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  pieceContainerPressed: {},
  loadingOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.full,
    padding: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 2,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  suggestionChip: {
    backgroundColor: Colors.background.card,
    borderWidth: 0,
  },
  chipImage: {
    borderRadius: radius.md,
  },
  chipText: {
    color: Colors.neutral[900],
    fontWeight: '700',
    fontSize: 15,
  },
  suggestionText: {
    color: Colors.neutral[900],
    fontWeight: '600',
    fontSize: 14,
  },
});
 
