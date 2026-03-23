import React, { useMemo } from 'react';
import Svg, { ClipPath, Defs, G, Path, Image as SvgImage, Text as SvgText } from 'react-native-svg';

let puzzlePieceCounter = 0;

export type EdgeType = 'tab' | 'slot' | 'flat';

export type PuzzlePieceProps = {
  width: number;
  height: number;
  cornerRadius?: number;
  tabSize?: number;
  strokeColor?: string;
  fillColor?: string;
  label?: string;
  imageUrl?: string | null;
  imageSize?: number;
  fontSize?: number;
  seed?: string;
  edges?: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType };
};

// Simple seeded random for consistent edges per tile
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function getEdge(rand: () => number): EdgeType {
  const r = rand();
  if (r < 0.45) return 'tab';
  if (r < 0.9) return 'slot';
  return 'flat';
}

function getEdgeNoSlot(rand: () => number): EdgeType {
  const r = rand();
  if (r < 0.6) return 'tab';
  return 'flat';
}

/**
 * Builds a classic jigsaw puzzle piece path.
 * Each side can have a tab (outward bump), slot (inward notch), or be flat.
 * Uses smooth cubic bezier curves for the classic rounded puzzle look.
 */
function buildPuzzlePath(
  w: number,
  h: number,
  r: number,
  tabSize: number,
  edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType }
): string {
  // Tab dimensions - classic puzzle proportions
  const tabWidth = tabSize * 0.95;
  const tabHeight = tabSize;
  const neckWidth = tabSize * 0.45;

  const d: string[] = [];

  // Start at top-left after corner radius
  d.push(`M ${r} 0`);

  // === TOP EDGE ===
  const topMid = w / 2;
  if (edges.top === 'flat') {
    d.push(`L ${w - r} 0`);
  } else {
    const dir = edges.top === 'tab' ? -1 : 1; // -1 = outward (up), 1 = inward (down)
    // Line to start of tab
    d.push(`L ${topMid - tabWidth} 0`);
    // Neck going in/out
    d.push(`L ${topMid - neckWidth} 0`);
    // Smooth curve for the tab bulge
    d.push(
      `C ${topMid - neckWidth} ${dir * tabHeight * 0.4}, ` +
      `${topMid - tabWidth * 0.8} ${dir * tabHeight}, ` +
      `${topMid} ${dir * tabHeight}`
    );
    d.push(
      `C ${topMid + tabWidth * 0.8} ${dir * tabHeight}, ` +
      `${topMid + neckWidth} ${dir * tabHeight * 0.4}, ` +
      `${topMid + neckWidth} 0`
    );
    // Continue to corner
    d.push(`L ${topMid + tabWidth} 0`);
    d.push(`L ${w - r} 0`);
  }

  // Top-right corner
  d.push(`A ${r} ${r} 0 0 1 ${w} ${r}`);

  // === RIGHT EDGE ===
  const rightMid = h / 2;
  if (edges.right === 'flat') {
    d.push(`L ${w} ${h - r}`);
  } else {
    const dir = edges.right === 'tab' ? 1 : -1; // 1 = outward (right), -1 = inward (left)
    d.push(`L ${w} ${rightMid - tabWidth}`);
    d.push(`L ${w} ${rightMid - neckWidth}`);
    d.push(
      `C ${w + dir * tabHeight * 0.4} ${rightMid - neckWidth}, ` +
      `${w + dir * tabHeight} ${rightMid - tabWidth * 0.8}, ` +
      `${w + dir * tabHeight} ${rightMid}`
    );
    d.push(
      `C ${w + dir * tabHeight} ${rightMid + tabWidth * 0.8}, ` +
      `${w + dir * tabHeight * 0.4} ${rightMid + neckWidth}, ` +
      `${w} ${rightMid + neckWidth}`
    );
    d.push(`L ${w} ${rightMid + tabWidth}`);
    d.push(`L ${w} ${h - r}`);
  }

  // Bottom-right corner
  d.push(`A ${r} ${r} 0 0 1 ${w - r} ${h}`);

  // === BOTTOM EDGE ===
  const botMid = w / 2;
  if (edges.bottom === 'flat') {
    d.push(`L ${r} ${h}`);
  } else {
    const dir = edges.bottom === 'tab' ? 1 : -1; // 1 = outward (down), -1 = inward (up)
    d.push(`L ${botMid + tabWidth} ${h}`);
    d.push(`L ${botMid + neckWidth} ${h}`);
    d.push(
      `C ${botMid + neckWidth} ${h + dir * tabHeight * 0.4}, ` +
      `${botMid + tabWidth * 0.8} ${h + dir * tabHeight}, ` +
      `${botMid} ${h + dir * tabHeight}`
    );
    d.push(
      `C ${botMid - tabWidth * 0.8} ${h + dir * tabHeight}, ` +
      `${botMid - neckWidth} ${h + dir * tabHeight * 0.4}, ` +
      `${botMid - neckWidth} ${h}`
    );
    d.push(`L ${botMid - tabWidth} ${h}`);
    d.push(`L ${r} ${h}`);
  }

  // Bottom-left corner
  d.push(`A ${r} ${r} 0 0 1 0 ${h - r}`);

  // === LEFT EDGE ===
  const leftMid = h / 2;
  if (edges.left === 'flat') {
    d.push(`L 0 ${r}`);
  } else {
    const dir = edges.left === 'tab' ? -1 : 1; // -1 = outward (left), 1 = inward (right)
    d.push(`L 0 ${leftMid + tabWidth}`);
    d.push(`L 0 ${leftMid + neckWidth}`);
    d.push(
      `C ${dir * tabHeight * 0.4} ${leftMid + neckWidth}, ` +
      `${dir * tabHeight} ${leftMid + tabWidth * 0.8}, ` +
      `${dir * tabHeight} ${leftMid}`
    );
    d.push(
      `C ${dir * tabHeight} ${leftMid - tabWidth * 0.8}, ` +
      `${dir * tabHeight * 0.4} ${leftMid - neckWidth}, ` +
      `0 ${leftMid - neckWidth}`
    );
    d.push(`L 0 ${leftMid - tabWidth}`);
    d.push(`L 0 ${r}`);
  }

  // Top-left corner and close
  d.push(`A ${r} ${r} 0 0 1 ${r} 0`);
  d.push('Z');

  return d.join(' ');
}

export default function PuzzlePiece({
  width,
  height,
  cornerRadius = 12,
  tabSize = 22,
  strokeColor = '#0f172a',
  fillColor = '#f3f4f6',
  label,
  imageUrl,
  imageSize,
  fontSize = 18,
  seed,
  edges,
}: PuzzlePieceProps) {
  const clipPathId = useMemo(() => `clip-puzzle-${puzzlePieceCounter++}-${Math.random().toString(36).slice(2)}`, []);
  const computedEdges = useMemo(() => {
    if (edges) return edges;
    if (seed) {
      const rand = seededRandom(seed);
      return {
        top: getEdge(rand),
        right: getEdge(rand),
        bottom: getEdgeNoSlot(rand),
        left: getEdge(rand),
      };
    }
    // Random if no seed
    const rand = () => Math.random();
    return {
      top: getEdge(rand),
      right: getEdge(rand),
      bottom: getEdgeNoSlot(rand),
      left: getEdge(rand),
    };
  }, [edges, seed]);

  // Expand viewBox so outward tabs are never clipped
  const padding = tabSize + 4;
  const viewBox = `${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`;

  const path = useMemo(
    () => buildPuzzlePath(width, height, cornerRadius, tabSize, computedEdges),
    [width, height, cornerRadius, tabSize, computedEdges]
  );

  const cx = width / 2;
  const cy = height / 2;
  
  // Calculate safe content area - avoid inward slots
  const tabWidth = tabSize * 0.95;
  const tabHeight = tabSize;
  const safeMargin = tabHeight + 8; // Extra padding beyond slot depth
  
  // Calculate available space considering slots on each edge
  const topInset = computedEdges.top === 'slot' ? safeMargin : 8;
  const rightInset = computedEdges.right === 'slot' ? safeMargin : 8;
  const bottomInset = computedEdges.bottom === 'slot' ? safeMargin : 8;
  const leftInset = computedEdges.left === 'slot' ? safeMargin : 8;
  
  const safeWidth = width - leftInset - rightInset;
  const safeHeight = height - topInset - bottomInset;
  
  const imgSize = imageSize ?? Math.min(safeWidth, safeHeight) * 0.55;

  // Position image centered, text below - adjusted for safe area
  const hasImage = !!imageUrl;
  const imgY = hasImage ? cy - imgSize / 2 - 2 : cy;
  const textY = hasImage ? cy + imgSize / 2 + fontSize + 4 : cy + fontSize / 3;

  return (
    <Svg width="100%" height="100%" viewBox={viewBox}>
      <Defs>
        <ClipPath id={clipPathId}>
          <Path d={path} />
        </ClipPath>
      </Defs>
      <Path d={path} fill={fillColor} stroke={strokeColor} strokeWidth={2.5} />
      <G clipPath={`url(#${clipPathId})`}>
        {imageUrl ? (
          <SvgImage
            href={{ uri: imageUrl }}
            x={cx - imgSize / 2}
            y={imgY}
            width={imgSize}
            height={imgSize}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : null}
        {label ? (
          <SvgText
            x={cx}
            y={textY}
            fontSize={fontSize}
            textAnchor="middle"
            fill="#000000"
            fontFamily="Calibri"
          >
            {label}
          </SvgText>
        ) : null}
      </G>
    </Svg>
  );
}
 
