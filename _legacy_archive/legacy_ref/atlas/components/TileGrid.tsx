import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { TileCard } from '@/components/TileCard';
import { spacing } from '@/constants/Colors';
import { Tile } from '@/constants/tiles';

type TileGridProps = {
  tiles: Tile[];
  onTilePress: (tile: Tile) => void;
  onTileLongPress?: (tile: Tile) => void;
};

export function TileGrid({ tiles, onTilePress, onTileLongPress }: TileGridProps) {
  const { width } = useWindowDimensions();
  
  const { tileSize, columns } = useMemo(() => {
    const horizontalPad = spacing.xl * 2;
    const gap = spacing.lg;
    const available = width - horizontalPad;
    const minSize = 120;
    const maxSize = 160;
    const cols = Math.floor((available + gap) / (minSize + gap));
    const finalCols = Math.max(2, Math.min(3, cols));
    const calculated = Math.floor((available - (finalCols - 1) * gap) / finalCols);
    return {
      tileSize: Math.min(maxSize, Math.max(minSize, calculated)),
      columns: finalCols,
    };
  }, [width]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={{ right: 1 }}
      nestedScrollEnabled={true}
    >
      <View style={styles.grid}>
        {tiles.map((item) => (
          <View key={item.id} style={{ width: tileSize }}>
            <TileCard 
              tile={item} 
              onPress={() => onTilePress(item)}
              onLongPress={onTileLongPress ? () => onTileLongPress(item) : undefined}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
});
 
