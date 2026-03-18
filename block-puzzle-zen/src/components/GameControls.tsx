import React from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameControlsProps {
  isPaused: boolean;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onReset: () => void;
  onHome: () => void;
  gameMode: GameMode;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  soundEnabled,
  onTogglePause,
  onToggleSound,
  onReset,
  onHome,
  gameMode,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      {/* Home button */}
      <button
        onClick={onHome}
        className="p-3 rounded-full bg-amber-800/50 hover:bg-amber-700/50 text-amber-200 transition-all hover:scale-110 active:scale-95"
        title="Về trang chủ"
      >
        <Home size={24} />
      </button>

      {/* Pause/Play button - only for classic mode */}
      {gameMode === 'classic' && (
        <button
          onClick={onTogglePause}
          className="p-3 rounded-full bg-amber-800/50 hover:bg-amber-700/50 text-amber-200 transition-all hover:scale-110 active:scale-95"
          title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
        >
          {isPaused ? <Play size={24} /> : <Pause size={24} />}
        </button>
      )}

      {/* Sound toggle */}
      <button
        onClick={onToggleSound}
        className="p-3 rounded-full bg-amber-800/50 hover:bg-amber-700/50 text-amber-200 transition-all hover:scale-110 active:scale-95"
        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="p-3 rounded-full bg-amber-800/50 hover:bg-amber-700/50 text-amber-200 transition-all hover:scale-110 active:scale-95"
        title="Chơi lại"
      >
        <RotateCcw size={24} />
      </button>
    </div>
  );
};

// Pause overlay
interface PauseOverlayProps {
  visible: boolean;
  onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  visible,
  onResume,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl font-bold text-amber-100 mb-6">
          TẠM DỪNG
        </div>
        <button
          onClick={onResume}
          className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xl font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Play className="inline-block mr-2" size={24} />
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

// Game Over overlay
interface GameOverOverlayProps {
  visible: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  visible,
  score,
  highScore,
  isNewHighScore,
  onRestart,
  onHome,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-4xl sm:text-5xl font-bold text-red-400 mb-4">
          KẾT THÚC
        </div>

        {isNewHighScore && (
          <div className="text-2xl text-yellow-400 mb-4 animate-pulse">
            🏆 KỶ LỤC MỚI! 🏆
          </div>
        )}

        <div className="mb-6">
          <div className="text-amber-300/70 text-sm uppercase tracking-wider mb-1">
            Điểm số
          </div>
          <div className="text-5xl font-bold text-amber-100 tabular-nums">
            {score.toLocaleString()}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-amber-300/70 text-sm uppercase tracking-wider mb-1">
            Kỷ lục
          </div>
          <div className="text-2xl font-semibold text-amber-200/80 tabular-nums">
            {highScore.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="inline-block mr-2" size={20} />
            Chơi lại
          </button>

          <button
            onClick={onHome}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-lg font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <Home className="inline-block mr-2" size={20} />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
