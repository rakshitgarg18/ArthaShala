import React, { useMemo } from 'react';
import Svg, { ClipPath, Defs, Path, Rect, Image as SvgImage, Text as SvgText } from 'react-native-svg';

let folderShapeCounter = 0;

export type FolderShapeProps = {
  width: number;
  height: number;
  strokeColor?: string;
  fillColor?: string;
  label?: string;
  imageUrl?: string;
  fontSize?: number;
};

export default function FolderShape({
  width,
  height,
  strokeColor = '#3b82f6',
  fillColor = '#93c5fd',
  label,
  imageUrl,
  fontSize = 24,
}: FolderShapeProps) {
  const clipPathId = useMemo(() => `clip-folder-${folderShapeCounter++}-${Math.random().toString(36).slice(2)}`, []);
  const strokeWidth = 2.5;

  // Folder shape with a short tab on the left and a lowered top baseline
  const tabWidth = width * 0.5; // wider tab on the left
  const tabHeight = height * 0.25; // taller tab bump
  const bodyTop = height * 0.12; // baseline of the folder top (lower than tab)
  const cornerRadius = 16;

  // Build folder path
  // Build folder path: small tab on the left, main top at bodyTop
  const startTabX = cornerRadius;
  const midTabX = startTabX + tabWidth * 0.5;
  const endTabX = startTabX + tabWidth;

  const path = `
    M ${cornerRadius} ${bodyTop}
    L ${startTabX} ${bodyTop}
    Q ${midTabX} ${bodyTop - tabHeight} ${endTabX} ${bodyTop}
    L ${width - cornerRadius} ${bodyTop}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${bodyTop + cornerRadius}
    L ${width} ${height - cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${height}
    L ${cornerRadius} ${height}
    A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${height - cornerRadius}
    L 0 ${bodyTop + cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${bodyTop}
    Z
  `.trim().replace(/\s+/g, ' ');

  // Mirror PuzzlePiece's sizing approach: expand viewBox so shape renders slightly smaller
  // PuzzlePiece uses padding = tabSize + 4 (with tabSize=32 in our usage), so 36 here.
  const padding = 36;
  const viewBox = `${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`;

  const cx = width / 2;
  const cy = height / 2;

  // Utility to lighten a hex color
  function lightenColor(hex: string, factor: number) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor));
    const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor));
    const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * factor));
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }
  const paperColor = lightenColor(fillColor, 0.85);

  return (
    <Svg width="100%" height="100%" viewBox={viewBox}>
      <Defs>
        <ClipPath id={clipPathId}>
          <Path d={path} />
        </ClipPath>
      </Defs>

      {/* Folder fill */}
      <Path d={path} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />

      {/* Paper bar inside the folder (full width, near top) */}
      <Rect
        x={0}
        y={bodyTop + height * 0.02}
        width={width}
        height={height * 0.09}
        rx={6}
        fill={lightenColor(fillColor, 0.95)}
        clipPath={`url(#${clipPathId})`}
      />

      {/* Optional image */}
      {imageUrl && (
        <SvgImage
          href={{ uri: imageUrl }}
          x={width * 0.25}
          y={height * 0.25}
          width={width * 0.5}
          height={height * 0.5}
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#${clipPathId})`}
        />
      )}

      {/* Optional label */}
      {label && (
        <SvgText
          x={cx}
          y={cy + fontSize / 3}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="600"
          fill="#000000"
          fontFamily="Calibri"
        >
          {label}
        </SvgText>
      )}
    </Svg>
  );
}
 
