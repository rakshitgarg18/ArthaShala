import { Tile } from "@/constants/tiles";

const fallbackIds = [
  "please",
  "help",
  "more",
  "stop",
  "yes",
  "no",
  "go",
  "want",
];

export function computeSuggestions(sentence: Tile[], tiles: Tile[]): Tile[] {
  const last = sentence[sentence.length - 1];
  const pool: Tile[] = [];

  if (last) {
    const siblings = tiles.filter(
      (tile) =>
        !tile.isFolder && tile.parentId === last.parentId && tile.id !== last.id
    );
    pool.push(...siblings);
  }

  const fallbackTiles = fallbackIds
    .map((id) => tiles.find((tile) => tile.id === id))
    .filter((tile): tile is Tile => Boolean(tile));

  for (const tile of fallbackTiles) {
    if (!pool.find((t) => t.id === tile.id)) {
      pool.push(tile);
    }
  }

  return pool.slice(0, 8);
}
 
