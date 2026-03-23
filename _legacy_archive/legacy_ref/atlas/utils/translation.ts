import { Tile } from "@/constants/tiles";

const TRANSLATION_API_URL = "http://localhost:8244/translate";

export async function translateText(text: string, toLang: string): Promise<string> {
  if (toLang === 'en') return text; // No need to translate to English

  try {
    const response = await fetch(TRANSLATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: text,
        from_lang: "en",
        to_lang: toLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const result = await response.json();
    return result.translated || text; // Fallback to original
  } catch (error) {
    console.warn(`Translation failed for "${text}":`, error);
    return text; // Fallback to original
  }
}

export async function translateTiles(tiles: Tile[], toLang: string): Promise<Tile[]> {
  if (toLang === 'en') return tiles;

  const translatedTiles = await Promise.all(
    tiles.map(async (tile) => ({
      ...tile,
      label: await translateText(tile.label, toLang),
      speechText: tile.speechText ? await translateText(tile.speechText, toLang) : tile.speechText,
    }))
  );

  return translatedTiles;
} 
