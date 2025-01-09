import type { CoordinateString } from "./coordinate";
import type { PuzzleGrid } from "./puzzles";

export interface SudokuAppProps {
	puzzle: PuzzleGrid;
	clientSessionId: string;
	presence: Map<CoordinateString, boolean>;
}
