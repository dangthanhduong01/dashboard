import { useState, useCallback, useEffect } from 'react';
import { DailyChallenge } from '../types/game';

const PUZZLE_SIZE = 4;

// Generate a deterministic puzzle based on date
const generateDailyPuzzle = (dateStr: string): number[][] => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }

  // Generate a solvable 4x4 sliding puzzle
  const puzzle = Array.from({ length: 16 }, (_, i) => i);

  // Shuffle using seeded random
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let i = puzzle.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(hash + i) * (i + 1));
    [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
  }

  // Ensure solvable (check inversion count)
  let inversions = 0;
  for (let i = 0; i < puzzle.length; i++) {
    for (let j = i + 1; j < puzzle.length; j++) {
      if (puzzle[i] && puzzle[j] && puzzle[i] > puzzle[j]) {
        inversions++;
      }
    }
  }

  // Find empty position
  const emptyPos = puzzle.indexOf(0);
  const emptyRow = Math.floor(emptyPos / 4);

  // For 4x4, solvable if: inversions even when empty on even row from bottom
  // or inversions odd when empty on odd row from bottom
  const rowFromBottom = 4 - emptyRow;
  const isSolvable = (rowFromBottom % 2 === 0) ? (inversions % 2 === 0) : (inversions % 2 === 1);

  if (!isSolvable) {
    // Swap two non-zero tiles to make solvable
    const idx1 = puzzle.findIndex(v => v !== 0);
    const idx2 = puzzle.findIndex((v, i) => v !== 0 && i !== idx1);
    [puzzle[idx1], puzzle[idx2]] = [puzzle[idx2], puzzle[idx1]];
  }

  // Convert to 2D array
  const grid: number[][] = [];
  for (let i = 0; i < 4; i++) {
    grid.push(puzzle.slice(i * 4, (i + 1) * 4));
  }

  return grid;
};

const getTodayString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const loadDailyProgress = (): DailyChallenge | null => {
  try {
    const saved = localStorage.getItem('blockPuzzleDailyChallenge');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === getTodayString()) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }
  return null;
};

const saveDailyProgress = (challenge: DailyChallenge) => {
  try {
    localStorage.setItem('blockPuzzleDailyChallenge', JSON.stringify(challenge));
  } catch {
    // Ignore
  }
};

export const useDailyChallenge = () => {
  const todayStr = getTodayString();

  const [challenge, setChallenge] = useState<DailyChallenge>(() => {
    const saved = loadDailyProgress();
    if (saved) return saved;

    return {
      date: todayStr,
      puzzle: generateDailyPuzzle(todayStr),
      moves: 0,
      completed: false,
      bestMoves: null,
    };
  });

  useEffect(() => {
    saveDailyProgress(challenge);
  }, [challenge]);

  const findEmpty = useCallback((puzzle: number[][]): [number, number] => {
    for (let r = 0; r < PUZZLE_SIZE; r++) {
      for (let c = 0; c < PUZZLE_SIZE; c++) {
        if (puzzle[r][c] === 0) {
          return [r, c];
        }
      }
    }
    return [0, 0];
  }, []);

  const canMove = useCallback((row: number, col: number, puzzle: number[][]): boolean => {
    const [emptyRow, emptyCol] = findEmpty(puzzle);
    const rowDiff = Math.abs(row - emptyRow);
    const colDiff = Math.abs(col - emptyCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }, [findEmpty]);

  const moveTile = useCallback((row: number, col: number) => {
    setChallenge(prev => {
      if (prev.completed) return prev;
      if (!canMove(row, col, prev.puzzle)) return prev;

      const [emptyRow, emptyCol] = findEmpty(prev.puzzle);
      const newPuzzle = prev.puzzle.map(r => [...r]);
      newPuzzle[emptyRow][emptyCol] = newPuzzle[row][col];
      newPuzzle[row][col] = 0;

      const newMoves = prev.moves + 1;

      // Check if solved
      let solved = true;
      let expected = 1;
      for (let r = 0; r < PUZZLE_SIZE && solved; r++) {
        for (let c = 0; c < PUZZLE_SIZE && solved; c++) {
          if (r === PUZZLE_SIZE - 1 && c === PUZZLE_SIZE - 1) {
            if (newPuzzle[r][c] !== 0) solved = false;
          } else {
            if (newPuzzle[r][c] !== expected) solved = false;
            expected++;
          }
        }
      }

      const newBestMoves = solved
        ? (prev.bestMoves === null ? newMoves : Math.min(prev.bestMoves, newMoves))
        : prev.bestMoves;

      return {
        ...prev,
        puzzle: newPuzzle,
        moves: newMoves,
        completed: solved,
        bestMoves: newBestMoves,
      };
    });
  }, [canMove, findEmpty]);

  const resetDaily = useCallback(() => {
    setChallenge(prev => ({
      ...prev,
      puzzle: generateDailyPuzzle(prev.date),
      moves: 0,
      completed: false,
    }));
  }, []);

  const isSolved = challenge.completed;

  return {
    challenge,
    moveTile,
    canMove: (row: number, col: number) => canMove(row, col, challenge.puzzle),
    resetDaily,
    isSolved,
    findEmpty: () => findEmpty(challenge.puzzle),
  };
};
