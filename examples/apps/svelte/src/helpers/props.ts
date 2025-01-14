import type { CoordinateString } from "./coordinate";
import type { SudokuPuzzle } from "./puzzles";

export interface SudokuAppProps {
	puzzle: SudokuPuzzle;
	clientSessionId: string;
	presence: Map<CoordinateString, boolean>;
}
