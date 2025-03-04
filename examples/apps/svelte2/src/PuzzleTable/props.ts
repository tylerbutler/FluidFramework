import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";
import type { SudokuAppData, SudokuGrid } from "../fluid/dataSchema";

export interface PuzzleTableComponentProps {
	grid: SudokuGrid;
	readonly sessionClient: ISessionClient;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
}
