import type { CellCoordinate } from "$lib/coordinate";
import type { SudokuCellViewData } from "$lib/fluid/cellData.svelte";
import type { SudokuAppData, SudokuGrid } from "$lib/fluid/dataSchema";
import type { IPresence, ISessionClient } from "@fluidframework/presence/alpha";
import type { ReactivePresenceWorkspace } from "./PresenceWorkspaceManager.svelte";
import type { SudokuClientUser } from "./User.svelte";

export type SelectionManager = ReactivePresenceWorkspace<CellCoordinate>;

export type UserMetadataManager = ReactivePresenceWorkspace<SudokuClientUser>;

export interface SudokuAppProps {
	readonly data: SudokuAppData;
	readonly presence: IPresence;
	readonly sessionClient: ISessionClient;
}

export interface CellPresenceProps {
	readonly coordinate: CellCoordinate;
}

export interface SudokuGridComponentProps {
	readonly grid: SudokuGrid;
	readonly sessionClient: ISessionClient;
}

export interface SudokuCellProps {
	readonly cellData: SudokuCellViewData;
	readonly currentSessionClient: ISessionClient;
	readonly onKeyDown: (keyString: string, coordIn: string) => void;
	readonly onFocus: (e: FocusEvent) => void;
}
