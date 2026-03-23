import {
  PlacedTile,
  Stroke,
  generateBoardSVG,
} from "@/components/InfiniteBoard";
import { Platform } from "react-native";

/**
 * Convert board strokes and tiles to a base64-encoded PNG image for vision API
 * Gemini requires raster images (PNG/JPEG), not SVG
 */
export async function drawingToBase64Image(
  strokes: Stroke[],
  placedTiles: PlacedTile[],
  width: number = 800,
  height: number = 600
): Promise<string> {
  // Generate SVG string
  const svgString = generateBoardSVG(strokes, placedTiles, width, height);

  // On web, convert SVG to PNG using canvas
  if (Platform.OS === "web") {
    try {
      const pngDataUrl = await svgToPngDataUrl(svgString, width, height);
      // Already contains the data:image/png;base64 prefix
      return pngDataUrl;
    } catch (error) {
      console.error("Failed to convert SVG to PNG:", error);
      // Fallback: return SVG (may not work with all vision APIs)
      return createSvgDataUri(svgString);
    }
  }

  // On native platforms, return an SVG data URI so we don't mislabel it as PNG
  // TODO: Use react-native-svg or expo-image-manipulator for native PNG conversion
  return createSvgDataUri(svgString);
}

/**
 * Convert SVG string to PNG base64 using canvas (web only)
 */
async function svgToPngDataUrl(
  svgString: string,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas first
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Fill with white background first
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Create a data URI from the SVG string (more reliable than blob)
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

    // Create an image element to load the SVG
    const img = new window.Image();

    img.onload = () => {
      try {
        // Draw the SVG image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to PNG base64 with data URL prefix
        const pngDataUrl = canvas.toDataURL("image/png");
        resolve(pngDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error("Failed to load SVG as image:", error);
      reject(new Error("Failed to load SVG as image"));
    };

    // Set crossOrigin to handle any CORS issues
    img.crossOrigin = "anonymous";
    img.src = dataUri;
  });
}

/**
 * Convert SVG string to base64 (for simpler vision API integration)
 */
export function svgToBase64(svgString: string): string {
  return btoa(svgString);
}

/**
 * Helper to create SVG data URI from SVG string
 */
export function createSvgDataUri(svgString: string): string {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${base64}`;
}
 
