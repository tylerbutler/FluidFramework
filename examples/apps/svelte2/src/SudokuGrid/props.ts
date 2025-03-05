import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";
import type { SudokuGrid } from "../fluid/dataSchema";

export interface SudokuGridComponentProps {
	grid: SudokuGrid;
	readonly sessionClient: ISessionClient;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
}
