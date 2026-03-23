import React, { useCallback, useRef, useState } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export type StrokePoint = { x: number; y: number };
export type Stroke = {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
};

type DrawingCanvasProps = {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  height?: number;
};

function pointsToPath(points: StrokePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    // Single point - draw a small circle
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y}`;
  }

  // Use quadratic curves for smoother lines
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const xMid = (points[i].x + points[i + 1].x) / 2;
    const yMid = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y} ${xMid} ${yMid}`;
  }

  // Last point
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

export function DrawingCanvas({
  strokes,
  onStrokesChange,
  strokeColor = '#0f172a',
  strokeWidth = 4,
  backgroundColor = '#fffaf0',
  height = 200,
}: DrawingCanvasProps) {
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const containerRef = useRef<View>(null);
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const getPoint = useCallback((event: GestureResponderEvent): StrokePoint | null => {
    if (!layoutRef.current) return null;

    const { locationX, locationY } = event.nativeEvent;
    return { x: locationX, y: locationY };
  }, []);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const point = getPoint(event);
    if (point) {
      setCurrentStroke([point]);
    }
  }, [getPoint]);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    const point = getPoint(event);
    if (point) {
      setCurrentStroke((prev) => [...prev, point]);
    }
  }, [getPoint]);

  const handleTouchEnd = useCallback(() => {
    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        points: currentStroke,
        color: strokeColor,
        width: strokeWidth,
      };
      onStrokesChange([...strokes, newStroke]);
      setCurrentStroke([]);
    }
  }, [currentStroke, strokeColor, strokeWidth, strokes, onStrokesChange]);

  const handleLayout = useCallback(() => {
    containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      layoutRef.current = { x: pageX, y: pageY, width, height };
    });
  }, []);

  return (
    <View
      ref={containerRef}
      style={[styles.container, { backgroundColor, height }]}
      onLayout={handleLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderStart={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
      onResponderTerminate={handleTouchEnd}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <G>
          {/* Existing strokes */}
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
          {/* Current stroke being drawn */}
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

type ColorOption = { color: string; label: string };

const COLORS: ColorOption[] = [
  { color: '#0f172a', label: 'Black' },
  { color: '#dc2626', label: 'Red' },
  { color: '#2563eb', label: 'Blue' },
  { color: '#16a34a', label: 'Green' },
  { color: '#ca8a04', label: 'Yellow' },
  { color: '#9333ea', label: 'Purple' },
];

const WIDTHS = [2, 4, 8, 12];

type DrawingToolbarProps = {
  selectedColor: string;
  selectedWidth: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
};

export function DrawingToolbar({
  selectedColor,
  selectedWidth,
  onColorChange,
  onWidthChange,
  onUndo,
  onClear,
  canUndo,
}: DrawingToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.toolSection}>
        {COLORS.map((c) => (
          <Pressable
            key={c.color}
            onPress={() => onColorChange(c.color)}
            style={[
              styles.colorButton,
              { backgroundColor: c.color },
              selectedColor === c.color && styles.selectedTool,
            ]}
          />
        ))}
      </View>

      <View style={styles.toolSection}>
        {WIDTHS.map((w) => (
          <Pressable
            key={w}
            onPress={() => onWidthChange(w)}
            style={[
              styles.widthButton,
              selectedWidth === w && styles.selectedTool,
            ]}
          >
            <View style={[styles.widthIndicator, { width: w * 2, height: w * 2, backgroundColor: selectedColor }]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.toolSection}>
        <Pressable
          onPress={onUndo}
          disabled={!canUndo}
          style={[styles.actionButton, !canUndo && styles.disabledButton]}
        >
          <View style={styles.undoIcon} />
        </Pressable>
        <Pressable onPress={onClear} style={styles.actionButton}>
          <View style={styles.clearIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fde68a',
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 12,
  },
  toolSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTool: {
    borderColor: '#0f172a',
    transform: [{ scale: 1.15 }],
  },
  widthButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  widthIndicator: {
    borderRadius: 999,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  undoIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#0f172a',
    borderRadius: 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    transform: [{ rotate: '-45deg' }],
  },
  clearIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#dc2626',
    borderRadius: 4,
  },
});
 
