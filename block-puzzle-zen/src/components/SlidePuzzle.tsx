import React from 'react';

interface SlidePuzzleProps {
  puzzle: number[][];
  onTileClick: (row: number, col: number) => void;
  canMove: (row: number, col: number) => boolean;
  moves: number;
  completed: boolean;
  bestMoves: number | null;
}

export const SlidePuzzle: React.FC<SlidePuzzleProps> = ({
  puzzle,
  onTileClick,
  canMove,
  moves,
  completed,
  bestMoves,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-amber-300/70 text-sm uppercase tracking-wider mb-1">
            Số bước
          </div>
          <div className="text-3xl font-bold text-amber-100 tabular-nums">
            {moves}
          </div>
        </div>
        {bestMoves !== null && (
          <div>
            <div className="text-amber-300/70 text-sm uppercase tracking-wider mb-1">
              Kỷ lục
            </div>
            <div className="text-2xl font-semibold text-amber-200/80 tabular-nums">
              {bestMoves}
            </div>
          </div>
        )}
      </div>

      {/* Puzzle grid */}
      <div className="relative">
        {/* Wood frame */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-xl shadow-2xl" />
        <div className="absolute -inset-3 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-lg" />

        <div className="relative grid grid-cols-4 gap-2 p-3 bg-amber-950/60 rounded-lg">
          {puzzle.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              const isEmpty = value === 0;
              const isMovable = !isEmpty && canMove(rowIndex, colIndex);

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => !isEmpty && onTileClick(rowIndex, colIndex)}
                  disabled={isEmpty || !isMovable}
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20
                    rounded-lg font-bold text-2xl sm:text-3xl
                    transition-all duration-200
                    ${isEmpty
                      ? 'bg-amber-900/30'
                      : isMovable
                        ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 hover:scale-105 hover:shadow-lg cursor-pointer active:scale-95'
                        : 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-200/80 cursor-default'
                    }
                  `}
                  style={{
                    boxShadow: !isEmpty
                      ? `inset 2px 2px 4px rgba(255,255,255,0.3),
                         inset -2px -2px 4px rgba(0,0,0,0.2),
                         3px 3px 6px rgba(0,0,0,0.3)`
                      : undefined,
                  }}
                >
                  {!isEmpty && value}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Completion message */}
      {completed && (
        <div className="text-center animate-bounce">
          <div className="text-3xl font-bold text-green-400 mb-2">
            🎉 Hoàn thành! 🎉
          </div>
          <div className="text-amber-200">
            Bạn đã giải xong trong {moves} bước
          </div>
        </div>
      )}

      {/* Instructions */}
      {!completed && (
        <div className="text-amber-300/60 text-sm text-center max-w-xs">
          Nhấn vào các ô cạnh ô trống để di chuyển. Sắp xếp các số từ 1-15 theo thứ tự.
        </div>
      )}
    </div>
  );
};
