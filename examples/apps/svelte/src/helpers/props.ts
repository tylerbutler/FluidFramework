import type { PuzzleGrid } from "./puzzles";

export interface SudokuAppProps {
	puzzle: PuzzleGrid;
	clientSessionId: string;
}
