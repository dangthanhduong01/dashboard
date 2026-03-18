import React from 'react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  combo: number;
  streak: number;
  difficulty: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  combo,
  streak,
  difficulty,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4">
      {/* Score */}
      <div className="text-center">
        <div className="text-amber-300/70 text-xs sm:text-sm uppercase tracking-wider mb-1">
          Điểm
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-amber-100 tabular-nums">
          {score.toLocaleString()}
        </div>
      </div>

      {/* High Score */}
      <div className="text-center">
        <div className="text-amber-300/70 text-xs sm:text-sm uppercase tracking-wider mb-1">
          Kỷ lục
        </div>
        <div className="text-xl sm:text-2xl font-semibold text-amber-200/80 tabular-nums">
          {highScore.toLocaleString()}
        </div>
      </div>

      {/* Combo indicator */}
      {combo > 0 && (
        <div className="text-center animate-pulse">
          <div className="text-orange-400 text-xs sm:text-sm uppercase tracking-wider mb-1">
            Combo
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-300">
            x{combo}
          </div>
        </div>
      )}

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="text-center">
          <div className="text-yellow-400/70 text-xs sm:text-sm uppercase tracking-wider mb-1">
            Streak
          </div>
          <div className="text-lg sm:text-xl font-semibold text-yellow-300">
            🔥 {streak}
          </div>
        </div>
      )}

      {/* Difficulty level */}
      <div className="text-center">
        <div className="text-amber-300/70 text-xs sm:text-sm uppercase tracking-wider mb-1">
          Cấp độ
        </div>
        <div className="text-lg sm:text-xl font-semibold text-amber-200/80">
          {difficulty}
        </div>
      </div>
    </div>
  );
};

// Combo animation overlay
interface ComboAnimationProps {
  combo: number;
  visible: boolean;
}

export const ComboAnimation: React.FC<ComboAnimationProps> = ({
  combo,
  visible,
}) => {
  if (!visible || combo <= 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
      <div
        className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-bounce"
        style={{
          textShadow: '0 0 30px rgba(255, 165, 0, 0.5)',
          animation: 'comboPopIn 0.5s ease-out forwards',
        }}
      >
        COMBO x{combo}!
      </div>
    </div>
  );
};
