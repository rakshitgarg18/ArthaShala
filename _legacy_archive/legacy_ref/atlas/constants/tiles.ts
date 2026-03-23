export type WordType =
  | "pronoun"
  | "action"
  | "social"
  | "pointer"
  | "people"
  | "place"
  | "feeling"
  | "need"
  | "number"
  | "response"
  | "general";

export type Tile = {
  id: string;
  label: string;
  color: string;
  wordType?: WordType;
  parentId?: string;
  isFolder?: boolean;
  speechText?: string;
  imageUrl?: string; // OpenSymbols image URL, loaded dynamically
};

type RawTile = {
  id?: string;
  label: string;
  wordType?: WordType;
  parentId?: string;
  isFolder?: boolean;
  speechText?: string;
  imageUrl?: string;
  color?: string;
};

import tilesDataJson from "@/constants/tiles.json";

type GeneralBucket = {
  id: string;
  label: string;
  rangeStart: string;
  rangeEnd: string;
};

type TilesData = {
  coreTiles: RawTile[];
  generalWords: string[];
  generalRoot?: { id: string; label: string };
  generalBuckets?: GeneralBucket[];
};

const wordTypePalette: Record<WordType, string> = {
  pronoun: "#FFD166",
  action: "#6EE7B7",
  social: "#F9A8D4",
  pointer: "#93C5FD",
  people: "#FECACA",
  place: "#A5F3FC",
  feeling: "#FBCFE8",
  need: "#C7F9CC",
  number: "#E9D5FF",
  response: "#FDE68A",
  general: "#CBD5E1",
};

const DEFAULT_COLOR = wordTypePalette.general;
const MAX_GENERAL_WORDS = 1000;

function normalizeId(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toTile(raw: RawTile, defaultWordType: WordType = "general"): Tile {
  const wordType = raw.wordType ?? defaultWordType;
  const color = raw.color ?? wordTypePalette[wordType] ?? DEFAULT_COLOR;

  return {
    id: raw.id ?? normalizeId(raw.label),
    label: raw.label,
    wordType,
    parentId: raw.parentId,
    isFolder: raw.isFolder,
    speechText: raw.speechText,
    imageUrl: raw.imageUrl,
    color,
  };
}

const tilesData = tilesDataJson as TilesData;

const defaultBuckets: GeneralBucket[] = [
  { id: "general-a-m", label: "A - M", rangeStart: "a", rangeEnd: "m" },
  { id: "general-n-z", label: "N - Z", rangeStart: "n", rangeEnd: "z" },
];

const generalRootConfig = tilesData.generalRoot ?? {
  id: "general",
  label: "General Words",
};
const bucketConfigs: GeneralBucket[] =
  tilesData.generalBuckets && tilesData.generalBuckets.length > 0
    ? tilesData.generalBuckets
    : defaultBuckets;

const coreTiles: Tile[] = tilesData.coreTiles.map((tile) =>
  toTile(tile, tile.wordType ?? "general")
);

const generalRootTile = toTile({
  id: generalRootConfig.id,
  label: generalRootConfig.label,
  wordType: "general",
  isFolder: true,
  color: wordTypePalette.general,
});

const bucketFolderTiles: Tile[] = bucketConfigs.map((bucket) =>
  toTile({
    id: bucket.id,
    label: bucket.label,
    wordType: "general",
    parentId: generalRootConfig.id,
    isFolder: true,
    color: wordTypePalette.general,
  })
);

const baseTiles: Tile[] = [...coreTiles, generalRootTile, ...bucketFolderTiles];

const generalBucketWords: Record<string, RawTile[]> = Object.fromEntries(
  bucketConfigs.map((bucket: GeneralBucket) => [bucket.id, [] as RawTile[]])
) as Record<string, RawTile[]>;

function bucketIdForWord(word: string): string {
  const first = word.trim().charAt(0).toLowerCase();
  const found = bucketConfigs.find(
    (bucket: GeneralBucket) =>
      first >= bucket.rangeStart && first <= bucket.rangeEnd
  );
  return found ? found.id : bucketConfigs[bucketConfigs.length - 1].id;
}

const usedIds = new Set(baseTiles.map((tile) => tile.id));
let generalCount = 0;

for (const word of tilesData.generalWords) {
  const label = word.trim();
  if (!label) continue;
  if (generalCount >= MAX_GENERAL_WORDS) break;

  const id = normalizeId(label);
  if (!id || usedIds.has(id)) continue;

  const bucketId = bucketIdForWord(label);
  generalBucketWords[bucketId].push({
    id,
    label,
    parentId: bucketId,
    wordType: "general",
  });

  usedIds.add(id);
  generalCount += 1;
}

export const initialTiles: Tile[] = baseTiles;

export function loadTilesForFolder(
  folderId: string,
  currentTiles: Tile[]
): Tile[] {
  const bucketWords = generalBucketWords[folderId];
  if (!Array.isArray(bucketWords) || bucketWords.length === 0) return [];

  const currentIds = new Set(currentTiles.map((tile) => tile.id));
  return bucketWords
    .map((raw) => ({ raw, id: raw.id ?? normalizeId(raw.label) }))
    .filter(({ id }) => id && !currentIds.has(id))
    .map(({ raw, id }) => toTile({ ...raw, id: id! }, "general"));
}

export function buildTileMap(tiles: Tile[]): Record<string, Tile> {
  if (!Array.isArray(tiles) || tiles.length === 0) return {};
  return Object.fromEntries(tiles.map((tile) => [tile.id, tile]));
}

function mergeTilesUnique(current: Tile[], additional: Tile[]): Tile[] {
  if (additional.length === 0) return current;
  const map = new Map<string, Tile>(current.map((tile) => [tile.id, tile]));
  for (const tile of additional) {
    map.set(tile.id, tile);
  }
  return Array.from(map.values());
}

export function hydrateTilesForWords(
  words: string[],
  currentTiles: Tile[]
): Tile[] {
  if (!Array.isArray(words) || words.length === 0) return currentTiles;

  let merged = currentTiles;
  const seenBuckets = new Set<string>();

  for (const word of words) {
    if (!word) continue;
    const bucketId = bucketIdForWord(word);
    if (seenBuckets.has(bucketId)) continue;

    const newlyLoaded = loadTilesForFolder(bucketId, merged);
    if (newlyLoaded.length > 0) {
      merged = mergeTilesUnique(merged, newlyLoaded);
    }

    seenBuckets.add(bucketId);
  }

  return merged;
}
 
