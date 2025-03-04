import type { ISessionClient, LatestValueManager } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "../coordinate";
import type { SudokuCellData } from "../fluid/cellData.svelte";

export interface CellComponentProps {
	cellData: SudokuCellData;
	readonly currentSessionClient: ISessionClient;
	readonly selectionManager: LatestValueManager<CellCoordinate>;
	onKeyDown: (keyString: string, coordIn: string) => void;
}
