import type { CellCoordinate } from "$lib/coordinate";
import type { SudokuCellViewData } from "$lib/fluid/cellData.svelte";
import type { SudokuAppData, SudokuGrid } from "$lib/fluid/dataSchema";
import type { Presence, Attendee } from "@fluidframework/presence/alpha";
import type { ReactiveStateWorkspace } from "./ReactiveStateWorkspace.svelte";
import type { SudokuClientUser } from "./User.svelte";

export type SelectionManager = ReactiveStateWorkspace<CellCoordinate>;

export type UserMetadataManager = ReactiveStateWorkspace<SudokuClientUser>;

export interface SudokuAppProps {
	readonly data: SudokuAppData;
	readonly presence: Presence;
	readonly sessionClient: Attendee;
}

export interface CellPresenceProps {
	readonly coordinate: CellCoordinate;
}

export interface SudokuGridComponentProps {
	readonly grid: SudokuGrid;
	readonly sessionClient: Attendee;
}

export interface SudokuCellProps {
	readonly cellData: SudokuCellViewData;
	readonly currentSessionClient: Attendee;
	readonly onKeyDown: (keyString: string, coordIn: string) => void;
	readonly onFocus: (e: FocusEvent) => void;
}
