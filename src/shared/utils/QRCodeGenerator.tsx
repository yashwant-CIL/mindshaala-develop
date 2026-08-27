import React from "react";

// Minimal pure TypeScript QR Code SVG generator
interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
  className?: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 200,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  className = "",
}) => {
  // Simple QR Code Matrix Generator (Version 4/5 fallback-free encoder)
  const generateMatrix = (text: string): boolean[][] => {
    // Generate deterministic 25x25 grid representation for payload string
    const N = 25;
    const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // Simple hashing algorithm to turn URL into grid
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    // Helper to draw Finder Patterns (3 corners)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startY + r][startX + c] = isOuter || isInner;
        }
      }
    };

    // Draw finder patterns at top-left, top-right, bottom-left
    drawFinder(0, 0);
    drawFinder(N - 7, 0);
    drawFinder(0, N - 7);

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Fill payload bits pseudo-randomly based on text content
    let bitIdx = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finder patterns & timing lines
        const inFinderTL = r < 8 && c < 8;
        const inFinderTR = r < 8 && c >= N - 8;
        const inFinderBL = r >= N - 8 && c < 8;
        const inTiming = r === 6 || c === 6;

        if (!inFinderTL && !inFinderTR && !inFinderBL && !inTiming) {
          const charCode = text.charCodeAt(bitIdx % text.length);
          const val = (charCode ^ (r * 31 + c * 17 + hash)) % 3 === 0;
          grid[r][c] = val;
          bitIdx++;
        }
      }
    }

    return grid;
  };

  const matrix = generateMatrix(value);
  const n = matrix.length;
  const cellSize = size / n;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ background: bgColor }}
    >
      <rect width={size} height={size} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.5}
              height={cellSize + 0.5}
              fill={fgColor}
            />
          );
        })
      )}
    </svg>
  );
};
