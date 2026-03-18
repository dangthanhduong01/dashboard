// Game Types
export interface Position {
  row: number;
  col: number;
}

export interface Block {
  id: string;
  shape: boolean[][];
  color: string;
}

export interface Cell {
  filled: boolean;
  color: string;
}

export type Grid = Cell[][];

export interface GameState {
  grid: Grid;
  score: number;
  highScore: number;
  combo: number;
  streak: number;
  availableBlocks: Block[];
  gameOver: boolean;
  isPaused: boolean;
  difficulty: number;
  linesCleared: number;
}

export interface DailyChallenge {
  date: string;
  puzzle: number[][];
  moves: number;
  completed: boolean;
  bestMoves: number | null;
}

export type GameMode = 'classic' | 'daily';

// Block shapes
export const BLOCK_SHAPES: boolean[][][] = [
  // Single block
  [[true]],

  // Line 2
  [[true, true]],
  [[true], [true]],

  // Line 3
  [[true, true, true]],
  [[true], [true], [true]],

  // Line 4
  [[true, true, true, true]],
  [[true], [true], [true], [true]],

  // Line 5
  [[true, true, true, true, true]],
  [[true], [true], [true], [true], [true]],

  // Square 2x2
  [[true, true], [true, true]],

  // Square 3x3
  [[true, true, true], [true, true, true], [true, true, true]],

  // L shapes
  [[true, false], [true, false], [true, true]],
  [[true, true, true], [true, false, false]],
  [[true, true], [false, true], [false, true]],
  [[false, false, true], [true, true, true]],

  // J shapes
  [[false, true], [false, true], [true, true]],
  [[true, false, false], [true, true, true]],
  [[true, true], [true, false], [true, false]],
  [[true, true, true], [false, false, true]],

  // T shapes
  [[true, true, true], [false, true, false]],
  [[true, false], [true, true], [true, false]],
  [[false, true, false], [true, true, true]],
  [[false, true], [true, true], [false, true]],

  // S shapes
  [[false, true, true], [true, true, false]],
  [[true, false], [true, true], [false, true]],

  // Z shapes
  [[true, true, false], [false, true, true]],
  [[false, true], [true, true], [true, false]],

  // Corner 2x2
  [[true, true], [true, false]],
  [[true, true], [false, true]],
  [[true, false], [true, true]],
  [[false, true], [true, true]],

  // Big L
  [[true, false, false], [true, false, false], [true, true, true]],
  [[true, true, true], [false, false, true], [false, false, true]],
  [[true, true, true], [true, false, false], [true, false, false]],
  [[true, false, false], [true, false, false], [true, true, true]],
];

export const WOOD_COLORS = [
  '#D4A574', // Light oak
  '#B8860B', // Dark goldenrod
  '#CD853F', // Peru
  '#A0522D', // Sienna
  '#8B7355', // Burlywood dark
  '#DEB887', // Burlywood
  '#C4A484', // Tan
  '#966F33', // Wood brown
];
