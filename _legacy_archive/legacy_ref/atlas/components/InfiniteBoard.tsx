import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
    GestureResponderEvent,
    Image,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { Tile } from '@/constants/tiles';
import { BoardTile } from './BoardTile';

export type StrokePoint = { x: number; y: number };
export type Stroke = {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
};

export type PlacedTile = {
  id: string;
  tile: Tile;
  x: number;
  y: number;
};

export type PlacedImage = {
  id: string;
  uri: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type InfiniteBoardProps = {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  placedTiles: PlacedTile[];
  onPlacedTilesChange: (tiles: PlacedTile[]) => void;
  placedImages: PlacedImage[];
  onPlacedImagesChange: (images: PlacedImage[]) => void;
  strokeColor: string;
  strokeWidth: number;
  mode: 'draw' | 'pan' | 'erase' | 'select';
  onTileDrop?: (tile: Tile, x: number, y: number) => void;
  tileScales?: Record<string, number>;
  onTileScalesChange?: (scales: Record<string, number>) => void;
  drawOverlay?: boolean;  // When true, draw over tiles/images without selecting them
};

function pointsToPath(points: StrokePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xMid = (points[i].x + points[i + 1].x) / 2;
    const yMid = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y} ${xMid} ${yMid}`;
  }
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;
  return path;
}

function lightenColor(hex: string, factor: number) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor));
  const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor));
  const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * factor));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function InfiniteBoard({
  strokes,
  onStrokesChange,
  placedTiles,
  onPlacedTilesChange,
  placedImages,
  onPlacedImagesChange,
  strokeColor,
  strokeWidth,
  mode,
  tileScales: propTileScales,
  onTileScalesChange,
  drawOverlay = false,
}: InfiniteBoardProps) {
  const { width, height } = useWindowDimensions();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [draggingTile, setDraggingTile] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [draggingImage, setDraggingImage] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [resizingTile, setResizingTile] = useState<{ id: string; startX: number; startY: number; startScale: number } | null>(null);
  const [resizingImage, setResizingImage] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [localTileScales, setLocalTileScales] = useState<Record<string, number>>({});
  
  // Use prop scales if provided, otherwise use local state
  const tileScales = propTileScales ?? localTileScales;
  const setTileScales = useCallback((updater: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    if (onTileScalesChange) {
      if (typeof updater === 'function') {
        onTileScalesChange(updater(propTileScales ?? {}));
      } else {
        onTileScalesChange(updater);
      }
    } else {
      setLocalTileScales(updater as any);
    }
  }, [onTileScalesChange, propTileScales]);

  const lastPanRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<View>(null);
  
  // Refs to store latest values without causing re-renders in callbacks
  const placedTilesRef = useRef(placedTiles);
  const placedImagesRef = useRef(placedImages);
  placedTilesRef.current = placedTiles;
  placedImagesRef.current = placedImages;

  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => ({
      x: (screenX - offset.x) / scale,
      y: (screenY - offset.y) / scale,
    }),
    [offset, scale]
  );

  // Helper to check if a point is on a tile or image
  const findElementAtPoint = useCallback((canvasPoint: { x: number; y: number }) => {
    // Check images first (on top)
    for (let i = placedImagesRef.current.length - 1; i >= 0; i--) {
      const img = placedImagesRef.current[i];
      if (
        canvasPoint.x >= img.x &&
        canvasPoint.x <= img.x + img.width &&
        canvasPoint.y >= img.y &&
        canvasPoint.y <= img.y + img.height
      ) {
        return { type: 'image' as const, id: img.id, element: img };
      }
    }
    
    // Check tiles - base size is 100
    for (let i = placedTilesRef.current.length - 1; i >= 0; i--) {
      const pt = placedTilesRef.current[i];
      const tileScale = tileScales[pt.id] || 1;
      const tileSize = 100 * tileScale;
      if (
        canvasPoint.x >= pt.x &&
        canvasPoint.x <= pt.x + tileSize &&
        canvasPoint.y >= pt.y &&
        canvasPoint.y <= pt.y + tileSize
      ) {
        return { type: 'tile' as const, id: pt.id, element: pt };
      }
    }
    
    return null;
  }, [tileScales]);

  // Delete handlers for individual elements
  const handleDeleteTile = useCallback((tileId: string) => {
    onPlacedTilesChange(placedTilesRef.current.filter((pt) => pt.id !== tileId));
    if (selectedTileId === tileId) setSelectedTileId(null);
  }, [onPlacedTilesChange, selectedTileId]);

  const handleDeleteImage = useCallback((imageId: string) => {
    onPlacedImagesChange(placedImagesRef.current.filter((img) => img.id !== imageId));
    if (selectedImageId === imageId) setSelectedImageId(null);
  }, [onPlacedImagesChange, selectedImageId]);

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const canvasPoint = screenToCanvas(locationX, locationY);

      if (mode === 'pan') {
        lastPanRef.current = { x: locationX, y: locationY };
        return;
      }

      // In draw overlay mode, always draw - skip element detection
      if (drawOverlay && mode === 'draw') {
        setCurrentStroke([canvasPoint]);
        return;
      }

      // In draw, erase, or select mode, first check if tapping on an element
      const hitElement = findElementAtPoint(canvasPoint);
      
      if (hitElement) {
        if (hitElement.type === 'image') {
          const img = hitElement.element as PlacedImage;
          // Check if clicking on resize handle (bottom-right corner)
          const handleSize = 24 / scale;
          const isResizeHandle = 
            canvasPoint.x >= img.x + img.width - handleSize &&
            canvasPoint.y >= img.y + img.height - handleSize;
          
          if (isResizeHandle) {
            setResizingImage({
              id: img.id,
              startX: locationX,
              startY: locationY,
              startW: img.width,
              startH: img.height,
            });
          } else {
            setDraggingImage({ id: img.id, startX: locationX, startY: locationY });
          }
          setSelectedImageId(img.id);
          setSelectedTileId(null);
        } else {
          const pt = hitElement.element as PlacedTile;
          const tileScale = tileScales[pt.id] || 1;
          const tileSize = 100 * tileScale;
          // Check if clicking on resize handle (bottom-right corner) - make it bigger for easier targeting
          const handleSize = 30 / scale;
          const isResizeHandle = 
            canvasPoint.x >= pt.x + tileSize - handleSize &&
            canvasPoint.y >= pt.y + tileSize - handleSize;
          
          if (isResizeHandle) {
            setResizingTile({
              id: pt.id,
              startX: locationX,
              startY: locationY,
              startScale: tileScale,
            });
          } else {
            setDraggingTile({ id: pt.id, startX: locationX, startY: locationY });
          }
          setSelectedTileId(pt.id);
          setSelectedImageId(null);
        }
        return;
      }
      
      // No element hit - deselect and start drawing/erasing (not in select mode)
      setSelectedTileId(null);
      setSelectedImageId(null);
      
      if (mode === 'draw') {
        setCurrentStroke([canvasPoint]);
      } else if (mode === 'erase') {
        // Erase strokes that intersect with this point
        const eraseRadius = 15;
        const newStrokes = strokes.filter((stroke) => {
          return !stroke.points.some((p) => {
            const dist = Math.sqrt(Math.pow(p.x - canvasPoint.x, 2) + Math.pow(p.y - canvasPoint.y, 2));
            return dist < eraseRadius;
          });
        });
        if (newStrokes.length !== strokes.length) {
          onStrokesChange(newStrokes);
        }
      }
      // In select mode, just deselect (already done above)
    },
    [mode, screenToCanvas, findElementAtPoint, tileScales, scale, strokes, onStrokesChange, drawOverlay]
  );

  const handleTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const canvasPoint = screenToCanvas(locationX, locationY);

      if (mode === 'pan') {
        const dx = locationX - lastPanRef.current.x;
        const dy = locationY - lastPanRef.current.y;
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPanRef.current = { x: locationX, y: locationY };
        return;
      }
      
      // Handle dragging/resizing elements
      if (draggingTile) {
        const dx = (locationX - draggingTile.startX) / scale;
        const dy = (locationY - draggingTile.startY) / scale;
        onPlacedTilesChange(
          placedTilesRef.current.map((pt) =>
            pt.id === draggingTile.id ? { ...pt, x: pt.x + dx, y: pt.y + dy } : pt
          )
        );
        setDraggingTile({ ...draggingTile, startX: locationX, startY: locationY });
        return;
      }
      
      if (draggingImage) {
        const dx = (locationX - draggingImage.startX) / scale;
        const dy = (locationY - draggingImage.startY) / scale;
        onPlacedImagesChange(
          placedImagesRef.current.map((img) =>
            img.id === draggingImage.id ? { ...img, x: img.x + dx, y: img.y + dy } : img
          )
        );
        setDraggingImage({ ...draggingImage, startX: locationX, startY: locationY });
        return;
      }
      
      if (resizingTile) {
        const dx = (locationX - resizingTile.startX) / scale;
        // Allow unlimited resize like images - minimum 0.3 scale, no maximum
        const newScale = Math.max(0.3, resizingTile.startScale + dx / 80);
        setTileScales((prev) => ({ ...prev, [resizingTile.id]: newScale }));
        return;
      }
      
      if (resizingImage) {
        const dx = (locationX - resizingImage.startX) / scale;
        const dy = (locationY - resizingImage.startY) / scale;
        const newWidth = Math.max(50, resizingImage.startW + dx);
        const newHeight = Math.max(50, resizingImage.startH + dy);
        onPlacedImagesChange(
          placedImagesRef.current.map((img) =>
            img.id === resizingImage.id ? { ...img, width: newWidth, height: newHeight } : img
          )
        );
        return;
      }
      
      // Drawing or erasing
      if (mode === 'draw' && currentStroke.length > 0) {
        setCurrentStroke((prev) => [...prev, canvasPoint]);
      } else if (mode === 'erase') {
        const eraseRadius = 15;
        const newStrokes = strokes.filter((stroke) => {
          return !stroke.points.some((p) => {
            const dist = Math.sqrt(Math.pow(p.x - canvasPoint.x, 2) + Math.pow(p.y - canvasPoint.y, 2));
            return dist < eraseRadius;
          });
        });
        if (newStrokes.length !== strokes.length) {
          onStrokesChange(newStrokes);
        }
      }
    },
    [mode, currentStroke, screenToCanvas, draggingTile, draggingImage, resizingTile, resizingImage, scale, strokes, onPlacedTilesChange, onPlacedImagesChange, onStrokesChange]
  );

  const handleTouchEnd = useCallback(() => {
    if (mode === 'draw' && currentStroke.length > 0) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        points: currentStroke,
        color: strokeColor,
        width: strokeWidth,
      };
      onStrokesChange([...strokes, newStroke]);
      setCurrentStroke([]);
    }
    setDraggingTile(null);
    setDraggingImage(null);
    setResizingTile(null);
    setResizingImage(null);
  }, [mode, currentStroke, strokeColor, strokeWidth, strokes, onStrokesChange]);


  const handleDeleteSelected = useCallback(() => {
    if (selectedTileId) {
      onPlacedTilesChange(placedTiles.filter((pt) => pt.id !== selectedTileId));
      setSelectedTileId(null);
    }
    if (selectedImageId) {
      onPlacedImagesChange(placedImages.filter((img) => img.id !== selectedImageId));
      setSelectedImageId(null);
    }
  }, [selectedTileId, selectedImageId, placedTiles, placedImages, onPlacedTilesChange, onPlacedImagesChange]);

  // Grid pattern for infinite feel
  const gridSize = 40 * scale;
  const gridOffsetX = offset.x % gridSize;
  const gridOffsetY = offset.y % gridSize;

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderStart={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
      onResponderTerminate={handleTouchEnd}
    >
      {/* Grid background */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <G>
          {Array.from({ length: Math.ceil(width / gridSize) + 2 }).map((_, i) => (
            <Path
              key={`vline-${i}`}
              d={`M ${gridOffsetX + i * gridSize} 0 L ${gridOffsetX + i * gridSize} ${height}`}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: Math.ceil(height / gridSize) + 2 }).map((_, i) => (
            <Path
              key={`hline-${i}`}
              d={`M 0 ${gridOffsetY + i * gridSize} L ${width} ${gridOffsetY + i * gridSize}`}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
        </G>
      </Svg>

      {/* Placed tiles as puzzle pieces (positioned absolutely) */}
      {placedTiles.map((pt) => {
        const tileScale = tileScales[pt.id] || 1;
        const tileSize = 180 * scale * tileScale;
        const isSelected = selectedTileId === pt.id;
        return (
          <View
            key={`tile-${pt.id}`}
            style={[
              styles.placedTileContainer,
              {
                left: offset.x + pt.x * scale,
                top: offset.y + pt.y * scale,
                width: tileSize,
                height: tileSize,
              },
            ]}
            pointerEvents="box-none"
          >
            <BoardTile
              tile={pt.tile}
              isSelected={isSelected}
            />
            {/* X delete button - top right */}
            {isSelected && (
              <Pressable
                style={styles.deleteXButton}
                onPress={() => handleDeleteTile(pt.id)}
              >
                <MaterialIcons name="close" size={16} color="#fff" />
              </Pressable>
            )}
            {/* Resize handle - bottom right */}
            {isSelected && (
              <View style={styles.tileResizeHandle} pointerEvents="none">
                <MaterialIcons name="zoom-out-map" size={14} color="#fff" />
              </View>
            )}
          </View>
        );
      })}

      {/* Image overlays (positioned absolutely) */}
      {placedImages.map((img) => {
        const isSelected = selectedImageId === img.id;
        return (
          <View
            key={`img-${img.id}`}
            style={[
              styles.placedImage,
              {
                left: offset.x + img.x * scale,
                top: offset.y + img.y * scale,
                width: img.width * scale,
                height: img.height * scale,
                borderColor: isSelected ? '#0f172a' : 'transparent',
                borderWidth: isSelected ? 3 : 0,
              },
            ]}
            pointerEvents="box-none"
          >
            <Image
              source={{ uri: img.uri }}
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
              resizeMode="cover"
            />
            {/* X delete button - top right */}
            {isSelected && (
              <Pressable
                style={styles.deleteXButton}
                onPress={() => handleDeleteImage(img.id)}
              >
                <MaterialIcons name="close" size={16} color="#fff" />
              </Pressable>
            )}
            {/* Resize handle - bottom right */}
            {isSelected && (
              <View style={styles.imageResizeHandle} pointerEvents="none">
                <MaterialIcons name="zoom-out-map" size={16} color="#fff" />
              </View>
            )}
          </View>
        );
      })}

      {/* Drawing strokes - rendered last to appear on top of tiles and images */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <G transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
          {/* Strokes */}
          {strokes.map((stroke) => (
            <Path
              key={stroke.id}
              d={pointsToPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Current stroke */}
          {currentStroke.length > 0 && (
            <Path
              d={pointsToPath(currentStroke)}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </G>
      </Svg>
    </View>
  );
}

// Describe the board content for AI interpretation
// NOTE: The AI now receives the actual image, so we only provide supplementary text context
export function describeBoardContent(
  strokes: Stroke[],
  placedTiles: PlacedTile[],
  placedImages?: PlacedImage[]
): string {
  const parts: string[] = [];

  if (placedTiles.length > 0) {
    // Describe tiles with their relative positions (left-to-right, top-to-bottom order)
    const sortedTiles = [...placedTiles].sort((a, b) => {
      // Sort left-to-right, top-to-bottom
      if (Math.abs(a.y - b.y) < 40) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    const tileLabels = sortedTiles.map((pt) => pt.tile.label);
    parts.push(`Word tiles (in reading order): ${tileLabels.join(' → ')}`);
  }
  
  if (placedImages && placedImages.length > 0) {
    parts.push(`${placedImages.length} photo(s) placed on board`);
  }

  if (strokes.length > 0) {
    // Just note that there are drawings - let the AI vision interpret what they are
    const totalPoints = strokes.reduce((acc: number, s) => acc + s.points.length, 0);
    const complexity = totalPoints > 300 ? "detailed" : totalPoints > 100 ? "moderate" : "simple";
    parts.push(`Child's drawing present (${complexity}, ${strokes.length} stroke(s))`);
    
    // Describe spatial relationships between tiles and drawing areas
    if (placedTiles.length > 0) {
      const allShapeBounds = strokes.map(s => getStrokeBounds(s));
      const drawingBounds = allShapeBounds.reduce((acc, b) => ({
        minX: Math.min(acc.minX, b.x),
        minY: Math.min(acc.minY, b.y),
        maxX: Math.max(acc.maxX, b.x + b.width),
        maxY: Math.max(acc.maxY, b.y + b.height),
      }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
      
      const drawingCenter = {
        x: (drawingBounds.minX + drawingBounds.maxX) / 2,
        y: (drawingBounds.minY + drawingBounds.maxY) / 2,
      };
      
      const nearbyTiles = placedTiles.filter(pt => {
        const tileCenter = { x: pt.x + 40, y: pt.y + 40 };
        const distance = Math.sqrt(
          Math.pow(tileCenter.x - drawingCenter.x, 2) + 
          Math.pow(tileCenter.y - drawingCenter.y, 2)
        );
        return distance < 300;
      });
      
      if (nearbyTiles.length > 0) {
        const nearbyLabels = nearbyTiles.map(pt => `"${pt.tile.label}"`).join(', ');
        parts.push(`Tiles near drawing: ${nearbyLabels}`);
      }
    }
  }

  return parts.join('. ');
}

function getStrokeBounds(stroke: Stroke) {
  if (stroke.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of stroke.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Generate SVG string from strokes and tiles
export function generateBoardSVG(
  strokes: Stroke[],
  placedTiles: PlacedTile[],
  width: number = 800,
  height: number = 600
): string {
  // Calculate bounds of all content
  let minX = 0, minY = 0, maxX = width, maxY = height;

  for (const stroke of strokes) {
    const bounds = getStrokeBounds(stroke);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  for (const pt of placedTiles) {
    minX = Math.min(minX, pt.x);
    minY = Math.min(minY, pt.y);
    maxX = Math.max(maxX, pt.x + 80);
    maxY = Math.max(maxY, pt.y + 80);
  }

  const padding = 40;
  const contentWidth = maxX - minX + padding * 2;
  const contentHeight = maxY - minY + padding * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${contentWidth}" height="${contentHeight}" viewBox="0 0 ${contentWidth} ${contentHeight}">`;
  svg += `<rect width="${contentWidth}" height="${contentHeight}" fill="white"/>`;

  // Draw strokes
  for (const stroke of strokes) {
    const path = pointsToPath(stroke.points.map(p => ({
      x: p.x - minX + padding,
      y: p.y - minY + padding
    })));
    svg += `<path d="${path}" stroke="${stroke.color}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  }

  // Draw tiles as rectangles with text
  for (const pt of placedTiles) {
    const x = pt.x - minX + padding;
    const y = pt.y - minY + padding;
    svg += `<rect x="${x}" y="${y}" width="80" height="80" rx="12" fill="${pt.tile.color}" stroke="#0f172a" stroke-width="2"/>`;
    // Add tile label text
    svg += `<text x="${x + 40}" y="${y + 45}" text-anchor="middle" font-family="Calibri" font-size="12" font-weight="bold" fill="#0f172a">${pt.tile.label}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  placedTileContainer: {
    position: 'absolute',
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 20,
    pointerEvents: 'none',
  },
  placedImage: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'visible',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 8,
  },
  deleteXButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteXText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tileResizeHandle: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageResizeHandle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resizeIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -50,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '800',
    fontFamily: 'Calibri',
  },
});
 
