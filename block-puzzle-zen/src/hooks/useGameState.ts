import { useState, useCallback, useEffect } from 'react';
import { Grid, Cell, Block, GameState, BLOCK_SHAPES, WOOD_COLORS } from '../types/game';

const GRID_SIZE = 9;

const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({ filled: false, color: '' }))
  );
};

const getRandomColor = (): string => {
  return WOOD_COLORS[Math.floor(Math.random() * WOOD_COLORS.length)];
};

const getRandomBlock = (difficulty: number): Block => {
  // Higher difficulty = more complex shapes
  let maxShapeIndex = Math.min(
    Math.floor(10 + difficulty * 2),
    BLOCK_SHAPES.length
  );
  const shapeIndex = Math.floor(Math.random() * maxShapeIndex);
  const shape = BLOCK_SHAPES[shapeIndex];

  return {
    id: `block-${Date.now()}-${Math.random()}`,
    shape,
    color: getRandomColor(),
  };
};

const generateBlocks = (count: number, difficulty: number): Block[] => {
  return Array(count).fill(null).map(() => getRandomBlock(difficulty));
};

const canPlaceBlock = (grid: Grid, block: Block, startRow: number, startCol: number): boolean => {
  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (block.shape[r][c]) {
        const newRow = startRow + r;
        const newCol = startCol + c;

        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
          return false;
        }
        if (grid[newRow][newCol].filled) {
          return false;
        }
      }
    }
  }
  return true;
};

const canPlaceAnyBlock = (grid: Grid, blocks: Block[]): boolean => {
  for (const block of blocks) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlaceBlock(grid, block, row, col)) {
          return true;
        }
      }
    }
  }
  return false;
};

const checkAndClearLines = (grid: Grid): { newGrid: Grid; linesCleared: number } => {
  const rowsToRemove: number[] = [];
  const colsToRemove: number[] = [];

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every(cell => cell.filled)) {
      rowsToRemove.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let fullCol = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!grid[r][c].filled) {
        fullCol = false;
        break;
      }
    }
    if (fullCol) {
      colsToRemove.push(c);
    }
  }

  const totalCleared = rowsToRemove.length + colsToRemove.length;

  if (totalCleared === 0) {
    return { newGrid: grid, linesCleared: 0 };
  }

  // Create new grid with cleared lines
  const newGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (rowsToRemove.includes(r) || colsToRemove.includes(c)) {
        return { filled: false, color: '' };
      }
      return cell;
    })
  );

  return { newGrid, linesCleared: totalCleared };
};

const calculateScore = (linesCleared: number, combo: number, streak: number): number => {
  if (linesCleared === 0) return 0;

  // Base score per line
  let score = linesCleared * 10;

  // Multi-clear bonus
  if (linesCleared > 1) {
    score += (linesCleared - 1) * 20; // Bonus for clearing multiple lines
  }

  // Combo multiplier
  if (combo > 0) {
    score = Math.floor(score * (1 + combo * 0.25));
  }

  // Streak bonus
  if (streak > 1) {
    score = Math.floor(score * (1 + streak * 0.1));
  }

  return score;
};

const loadHighScore = (): number => {
  try {
    const saved = localStorage.getItem('blockPuzzleHighScore');
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

const saveHighScore = (score: number) => {
  try {
    localStorage.setItem('blockPuzzleHighScore', score.toString());
  } catch {
    // Ignore storage errors
  }
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createEmptyGrid(),
    score: 0,
    highScore: loadHighScore(),
    combo: 0,
    streak: 0,
    availableBlocks: generateBlocks(3, 1),
    gameOver: false,
    isPaused: false,
    difficulty: 1,
    linesCleared: 0,
  }));

  // Save high score when it changes
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      setGameState(prev => ({ ...prev, highScore: prev.score }));
      saveHighScore(gameState.score);
    }
  }, [gameState.score, gameState.highScore]);

  const placeBlock = useCallback((block: Block, startRow: number, startCol: number) => {
    setGameState(prev => {
      if (prev.gameOver || prev.isPaused) return prev;

      if (!canPlaceBlock(prev.grid, block, startRow, startCol)) {
        return prev;
      }

      // Place the block
      const newGrid = prev.grid.map((row, r) =>
        row.map((cell, c) => {
          const blockRow = r - startRow;
          const blockCol = c - startCol;

          if (
            blockRow >= 0 &&
            blockRow < block.shape.length &&
            blockCol >= 0 &&
            blockCol < block.shape[blockRow].length &&
            block.shape[blockRow][blockCol]
          ) {
            return { filled: true, color: block.color };
          }
          return cell;
        })
      );

      // Check and clear lines
      const { newGrid: clearedGrid, linesCleared } = checkAndClearLines(newGrid);

      // Calculate score
      const newCombo = linesCleared > 0 ? prev.combo + 1 : 0;
      const newStreak = linesCleared > 0 ? prev.streak + linesCleared : 0;
      const scoreGained = calculateScore(linesCleared, newCombo, prev.streak);

      // Remove used block and check for new blocks
      const remainingBlocks = prev.availableBlocks.filter(b => b.id !== block.id);

      // Generate new blocks when all are used
      const newBlocks = remainingBlocks.length === 0
        ? generateBlocks(3, prev.difficulty)
        : remainingBlocks;

      // Check game over
      const gameOver = !canPlaceAnyBlock(clearedGrid, newBlocks);

      // Increase difficulty based on lines cleared
      const totalLines = prev.linesCleared + linesCleared;
      const newDifficulty = Math.floor(totalLines / 10) + 1;

      return {
        ...prev,
        grid: clearedGrid,
        score: prev.score + scoreGained,
        combo: newCombo,
        streak: newStreak,
        availableBlocks: newBlocks,
        gameOver,
        difficulty: Math.min(newDifficulty, 15),
        linesCleared: totalLines,
      };
    });
  }, []);

  const canPlace = useCallback((block: Block, startRow: number, startCol: number): boolean => {
    return canPlaceBlock(gameState.grid, block, startRow, startCol);
  }, [gameState.grid]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      grid: createEmptyGrid(),
      score: 0,
      highScore: prev.highScore,
      combo: 0,
      streak: 0,
      availableBlocks: generateBlocks(3, 1),
      gameOver: false,
      isPaused: false,
      difficulty: 1,
      linesCleared: 0,
    }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  return {
    gameState,
    placeBlock,
    canPlace,
    resetGame,
    togglePause,
  };
};
