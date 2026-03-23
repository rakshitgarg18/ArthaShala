import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Tile } from '@/constants/tiles';
import { searchSymbol } from '@/services/opensymbols';
import FolderShape from './FolderShape';
import PuzzlePiece from './PuzzlePiece';

type BoardTileProps = {
  tile: Tile;
  isSelected: boolean;
};

// Cache images per tile id (shared with TileCard)
const imageCache = new Map<string, string | null>();

function lightenColor(hex: string, factor: number) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor));
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * factor));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function BoardTile({ tile, isSelected }: BoardTileProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(tile.imageUrl ?? imageCache.get(tile.id) ?? null);

  useEffect(() => {
    if (tile.isFolder || imageUrl) return;

    // Check cache first
    if (imageCache.has(tile.id)) {
      setImageUrl(imageCache.get(tile.id) ?? null);
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
      } catch (e) {
        console.error(`[BoardTile] Error loading "${tile.label}":`, e);
        imageCache.set(tile.id, null);
      }
    }

    loadImage();
    return () => { cancelled = true; };
  }, [tile.id, tile.label, tile.isFolder, imageUrl]);

  const baseColor = tile.color;
  const innerColor = lightenColor(baseColor, 0.3);
  const displayLabel = tile.label === 'I' ? 'I' : tile.label.toLowerCase();

  return (
    <>
      {tile.isFolder ? (
        <FolderShape
          width={180}
          height={180}
          strokeColor={isSelected ? '#000' : baseColor}
          fillColor={innerColor}
          label={displayLabel}
          fontSize={20}
        />
      ) : (
        <PuzzlePiece
          width={180}
          height={180}
          cornerRadius={14}
          tabSize={32}
          strokeColor={isSelected ? '#000' : baseColor}
          fillColor={innerColor}
          imageUrl={imageUrl ?? undefined}
          label={displayLabel}
          fontSize={20}
          seed={tile.id}
        />
      )}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 3,
            borderColor: '#000',
            borderRadius: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
 
