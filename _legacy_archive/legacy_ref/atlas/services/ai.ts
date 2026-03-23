// Placeholder service for Gemini-like suggestions and board interpretation.
import { Tile } from "@/constants/tiles";

export async function suggestNextWords(sentence: Tile[]): Promise<Tile[]> {
  // TODO: call Gemini or other LLM with sentence context.
  return Promise.resolve([]);
}

export async function interpretBoard(
  _tiles: Tile[],
  _images: string[]
): Promise<string[]> {
  // TODO: send screenshot + placed tiles to model.
  return Promise.resolve([]);
}

export async function mapTranscriptToTiles(_text: string): Promise<string[]> {
  // TODO: call model to map raw transcript to tile IDs.
  return Promise.resolve([]);
}
 
