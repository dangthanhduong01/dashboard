import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameMode, Block } from './types/game';
import { useGameState } from './hooks/useGameState';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useSound } from './hooks/useSound';
import { GameGrid } from './components/GameGrid';
import { DraggableBlock, DragPreview } from './components/DraggableBlock';
import { ScoreBoard, ComboAnimation } from './components/ScoreBoard';
import { SlidePuzzle } from './components/SlidePuzzle';
import { GameControls, PauseOverlay, GameOverOverlay } from './components/GameControls';
import { Puzzle, Calendar, Sparkles } from 'lucide-react';

// Home screen component
const HomeScreen: React.FC<{
  onSelectMode: (mode: GameMode) => void;
}> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-bold text-amber-100 mb-3 tracking-tight">
          Block Puzzle
        </h1>
        <p className="text-amber-300/70 text-lg">Zen Edition</p>
      </div>

      {/* Decorative blocks */}
      <div className="flex gap-2 mb-12 opacity-60">
        {['#D4A574', '#B8860B', '#CD853F', '#A0522D', '#DEB887'].map((color, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-sm"
            style={{
              backgroundColor: color,
              boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.3),
                         inset -2px -2px 4px rgba(0,0,0,0.2)`,
              transform: `rotate(${(i - 2) * 5}deg)`,
            }}
          />
        ))}
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => onSelectMode('classic')}
          className="group flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xl font-semibold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Puzzle size={28} className="group-hover:rotate-12 transition-transform" />
          Chế độ Classic
        </button>

        <button
          onClick={() => onSelectMode('daily')}
          className="group flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xl font-semibold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Calendar size={28} className="group-hover:rotate-12 transition-transform" />
          Thử thách hàng ngày
        </button>
      </div>

      {/* Features */}
      <div className="mt-12 text-center text-amber-300/60 text-sm max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={16} />
          <span>Không giới hạn thời gian • Lối chơi thư giãn</span>
          <Sparkles size={16} />
        </div>
        <p>Hoạt động hoàn toàn offline</p>
      </div>
    </div>
  );
};

// Classic mode game component
const ClassicGame: React.FC<{
  onHome: () => void;
}> = ({ onHome }) => {
  const { gameState, placeBlock, canPlace, resetGame, togglePause } = useGameState();
  const { soundEnabled, toggleSound, playPlace, playClear, playGameOver, playClick } = useSound();

  const [draggingBlock, setDraggingBlock] = useState<Block | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [previewCells, setPreviewCells] = useState<{ row: number; col: number; color: string }[]>([]);
  const [isValidPlacement, setIsValidPlacement] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [lastCombo, setLastCombo] = useState(0);

  const gridRef = useRef<HTMLDivElement>(null);
  const prevCombo = useRef(0);
  const prevGameOver = useRef(false);

  // Play sounds on combo
  useEffect(() => {
    if (gameState.combo > 0 && gameState.combo !== prevCombo.current) {
      playClear(gameState.combo);
      setShowCombo(true);
      setLastCombo(gameState.combo);
      setTimeout(() => setShowCombo(false), 800);
    }
    prevCombo.current = gameState.combo;
  }, [gameState.combo, playClear]);

  // Play sound on game over
  useEffect(() => {
    if (gameState.gameOver && !prevGameOver.current) {
      playGameOver();
    }
    prevGameOver.current = gameState.gameOver;
  }, [gameState.gameOver, playGameOver]);

  const getGridPosition = useCallback((clientX: number, clientY: number) => {
    if (!gridRef.current || !draggingBlock) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / 9;

    // Calculate center of the block
    const blockWidth = draggingBlock.shape[0].length;
    const blockHeight = draggingBlock.shape.length;

    const col = Math.floor((clientX - rect.left) / cellSize - blockWidth / 2 + 0.5);
    const row = Math.floor((clientY - rect.top) / cellSize - blockHeight / 2 + 0.5);

    return { row, col };
  }, [draggingBlock]);

  const handleDragStart = useCallback((block: Block) => {
    if (gameState.isPaused || gameState.gameOver) return;
    setDraggingBlock(block);
    playClick();
  }, [gameState.isPaused, gameState.gameOver, playClick]);

  const handleDragMove = useCallback((x: number, y: number) => {
    setDragPosition({ x, y });

    const pos = getGridPosition(x, y);
    if (pos && draggingBlock) {
      const cells: { row: number; col: number; color: string }[] = [];
      for (let r = 0; r < draggingBlock.shape.length; r++) {
        for (let c = 0; c < draggingBlock.shape[r].length; c++) {
          if (draggingBlock.shape[r][c]) {
            cells.push({
              row: pos.row + r,
              col: pos.col + c,
              color: draggingBlock.color,
            });
          }
        }
      }
      setPreviewCells(cells);
      setIsValidPlacement(canPlace(draggingBlock, pos.row, pos.col));
    }
  }, [getGridPosition, draggingBlock, canPlace]);

  const handleDragEnd = useCallback(() => {
    if (!draggingBlock) return;

    const pos = getGridPosition(dragPosition.x, dragPosition.y);
    if (pos && canPlace(draggingBlock, pos.row, pos.col)) {
      placeBlock(draggingBlock, pos.row, pos.col);
      playPlace();
    }

    setDraggingBlock(null);
    setPreviewCells([]);
    setIsValidPlacement(false);
  }, [draggingBlock, dragPosition, getGridPosition, canPlace, placeBlock, playPlace]);

  const handleReset = useCallback(() => {
    playClick();
    resetGame();
  }, [playClick, resetGame]);

  const handleTogglePause = useCallback(() => {
    playClick();
    togglePause();
  }, [playClick, togglePause]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-4 px-2">
      {/* Score */}
      <ScoreBoard
        score={gameState.score}
        highScore={gameState.highScore}
        combo={gameState.combo}
        streak={gameState.streak}
        difficulty={gameState.difficulty}
      />

      {/* Game Grid */}
      <div ref={gridRef} className="my-4">
        <GameGrid
          grid={gameState.grid}
          previewCells={previewCells}
          isValidPlacement={isValidPlacement}
        />
      </div>

      {/* Available Blocks */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 p-4 min-h-[120px]">
        {gameState.availableBlocks.map(block => (
          <DraggableBlock
            key={block.id}
            block={block}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            disabled={gameState.isPaused || gameState.gameOver}
          />
        ))}
      </div>

      {/* Controls */}
      <GameControls
        isPaused={gameState.isPaused}
        soundEnabled={soundEnabled}
        onTogglePause={handleTogglePause}
        onToggleSound={toggleSound}
        onReset={handleReset}
        onHome={onHome}
        gameMode="classic"
      />

      {/* Drag Preview */}
      <DragPreview
        block={draggingBlock}
        position={dragPosition}
        visible={!!draggingBlock}
      />

      {/* Combo Animation */}
      <ComboAnimation combo={lastCombo} visible={showCombo} />

      {/* Pause Overlay */}
      <PauseOverlay
        visible={gameState.isPaused && !gameState.gameOver}
        onResume={handleTogglePause}
      />

      {/* Game Over Overlay */}
      <GameOverOverlay
        visible={gameState.gameOver}
        score={gameState.score}
        highScore={gameState.highScore}
        isNewHighScore={gameState.score >= gameState.highScore && gameState.score > 0}
        onRestart={handleReset}
        onHome={onHome}
      />
    </div>
  );
};

// Daily challenge game component
const DailyGame: React.FC<{
  onHome: () => void;
}> = ({ onHome }) => {
  const { challenge, moveTile, canMove, resetDaily, isSolved } = useDailyChallenge();
  const { soundEnabled, toggleSound, playClick, playClear } = useSound();

  const prevMoves = useRef(challenge.moves);

  useEffect(() => {
    if (challenge.moves > prevMoves.current) {
      playClick();
    }
    prevMoves.current = challenge.moves;
  }, [challenge.moves, playClick]);

  useEffect(() => {
    if (isSolved) {
      playClear(3);
    }
  }, [isSolved, playClear]);

  const handleTileClick = useCallback((row: number, col: number) => {
    moveTile(row, col);
  }, [moveTile]);

  const handleReset = useCallback(() => {
    playClick();
    resetDaily();
  }, [playClick, resetDaily]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-4 px-2">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-100 mb-1">
          Thử thách hàng ngày
        </h2>
        <p className="text-amber-300/70 text-sm">
          Slide Puzzle - {challenge.date}
        </p>
      </div>

      {/* Puzzle */}
      <SlidePuzzle
        puzzle={challenge.puzzle}
        onTileClick={handleTileClick}
        canMove={canMove}
        moves={challenge.moves}
        completed={challenge.completed}
        bestMoves={challenge.bestMoves}
      />

      {/* Controls */}
      <div className="mt-8">
        <GameControls
          isPaused={false}
          soundEnabled={soundEnabled}
          onTogglePause={() => {}}
          onToggleSound={toggleSound}
          onReset={handleReset}
          onHome={onHome}
          gameMode="daily"
        />
      </div>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
  }, []);

  const handleHome = useCallback(() => {
    setGameMode(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {gameMode === null && <HomeScreen onSelectMode={handleSelectMode} />}
        {gameMode === 'classic' && <ClassicGame onHome={handleHome} />}
        {gameMode === 'daily' && <DailyGame onHome={handleHome} />}
      </div>
    </div>
  );
};

export default App;
