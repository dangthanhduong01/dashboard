import React from 'react';
import { Grid } from '../types/game';

interface GameGridProps {
  grid: Grid;
  previewCells?: { row: number; col: number; color: string }[];
  isValidPlacement?: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  previewCells = [],
  isValidPlacement = true,
}) => {
  const getPreviewCell = (row: number, col: number) => {
    return previewCells.find(p => p.row === row && p.col === col);
  };

  return (
    <div className="relative">
      {/* Wood frame background */}
      <div className="absolute -inset-3 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-xl shadow-2xl" />
      <div className="absolute -inset-2 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-lg" />

      {/* Grid container */}
      <div
        className="relative grid gap-[2px] p-2 bg-amber-950/50 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(9, 1fr)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const preview = getPreviewCell(rowIndex, colIndex);
            const isPreview = !!preview;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                  rounded-sm transition-all duration-150
                  ${cell.filled
                    ? 'shadow-inner'
                    : 'bg-amber-100/20 hover:bg-amber-100/30'
                  }
                  ${isPreview && !cell.filled
                    ? isValidPlacement
                      ? 'ring-2 ring-green-400 ring-opacity-70'
                      : 'ring-2 ring-red-400 ring-opacity-70'
                    : ''
                  }
                `}
                style={{
                  backgroundColor: cell.filled
                    ? cell.color
                    : isPreview && !cell.filled
                      ? isValidPlacement
                        ? `${preview.color}80`
                        : '#ff000040'
                      : undefined,
                  boxShadow: cell.filled
                    ? `inset 2px 2px 4px rgba(255,255,255,0.3),
                       inset -2px -2px 4px rgba(0,0,0,0.2),
                       2px 2px 4px rgba(0,0,0,0.2)`
                    : undefined,
                }}
              >
                {/* Wood grain effect */}
                {cell.filled && (
                  <div
                    className="w-full h-full rounded-sm opacity-30"
                    style={{
                      background: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.1) 2px,
                        rgba(0,0,0,0.1) 4px
                      )`,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3x3 grid lines overlay */}
      <div className="absolute inset-2 pointer-events-none">
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="border border-amber-600/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
