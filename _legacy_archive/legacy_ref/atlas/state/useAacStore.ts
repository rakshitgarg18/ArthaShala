import { create } from "zustand";

import {
  Tile,
  buildTileMap,
  hydrateTilesForWords,
  initialTiles,
  loadTilesForFolder,
} from "@/constants/tiles";
import { computeSuggestions } from "@/utils/suggestions";
import { useSettingsStore } from "@/state/useSettingsStore";

type AacState = {
  tiles: Tile[];
  sentence: Tile[];
  folderPath: string[];
  suggestions: Tile[];
  addWord: (tileId: string) => void;
  clearSentence: () => void;
  undo: () => void;
  removeAtIndex: (index: number) => void;
  openFolder: (folderId: string) => void;
  goBack: () => void;
  ensureWordsLoaded: (words: string[]) => Tile[];
};

function mergeTiles(current: Tile[], additional: Tile[]): Tile[] {
  if (additional.length === 0) return current;
  const map = new Map<string, Tile>(current.map((tile) => [tile.id, tile]));
  for (const tile of additional) {
    map.set(tile.id, tile);
  }
  return Array.from(map.values());
}

function getCurrentTiles(): Tile[] {
  const { translatedTiles } = useSettingsStore.getState();
  return translatedTiles.length > 0 ? translatedTiles : initialTiles;
}

function ensureFolderTiles(folderId: string, tiles: Tile[]): Tile[] {
  const newTiles = loadTilesForFolder(folderId, tiles);
  return newTiles.length ? mergeTiles(tiles, newTiles) : tiles;
}

export const useAacStore = create<AacState>((set, get) => ({
  tiles: getCurrentTiles(),
  sentence: [],
  folderPath: [],
  suggestions: computeSuggestions([], getCurrentTiles()),
  addWord: (tileId) => {
    const tile = buildTileMap(getCurrentTiles())[tileId];
    if (!tile || tile.isFolder) return;

    const sentence = [...get().sentence, tile];
    set({ sentence, suggestions: computeSuggestions(sentence, getCurrentTiles()) });
  },
  clearSentence: () => {
    const tiles = getCurrentTiles();
    set({ sentence: [], suggestions: computeSuggestions([], tiles) });
  },
  removeAtIndex: (index) => {
    const next = get().sentence.filter((_, i) => i !== index);
    set({ sentence: next, suggestions: computeSuggestions(next, getCurrentTiles()) });
  },
  undo: () => {
    const sentence = get().sentence.slice(0, -1);
    set({ sentence, suggestions: computeSuggestions(sentence, getCurrentTiles()) });
  },
  openFolder: (folderId) => {
    set((state) => {
      const tiles = ensureFolderTiles(folderId, getCurrentTiles());
      const folderPath = [...state.folderPath, folderId];
      return {
        tiles,
        folderPath,
        suggestions: computeSuggestions(state.sentence, tiles),
      };
    });
  },
  goBack: () => {
    const path = [...get().folderPath];
    path.pop();
    set({ folderPath: path });
  },
  ensureWordsLoaded: (words) => {
    const tiles = getCurrentTiles();
    const merged = hydrateTilesForWords(words, tiles);
    if (merged === tiles) return tiles;
    set({
      tiles: merged,
      suggestions: computeSuggestions(get().sentence, merged),
    });
    return merged;
  },
}));

export function visibleTilesForPath(
  tiles: Tile[],
  folderPath: string[]
): Tile[] {
  const currentTiles = tiles.length > 0 ? tiles : getCurrentTiles();
  const current = folderPath[folderPath.length - 1];
  return currentTiles.filter((tile) => {
    if (tile.parentId === current) return true;
    if (!tile.parentId && !current) return true;
    return false;
  });
}

export function getBreadcrumbLabels(
  path: string[],
  tileMap: Record<string, Tile>
): string[] {
  const currentTileMap = tileMap || buildTileMap(getCurrentTiles());
  const labels: string[] = [];
  for (const id of path) {
    const tile = currentTileMap[id];
    if (tile) labels.push(tile.label);
  }
  return labels;
}

export function tilesMap(tiles: Tile[]): Record<string, Tile> {
  return buildTileMap(tiles.length > 0 ? tiles : getCurrentTiles());
}
 
