import type { CellCoordinate } from "../coordinate";

export function compareCells(cell1: CellCoordinate, cell2: CellCoordinate) {
	return cell1[0] === cell2[0] && cell1[1] === cell2[1];
}

export function getPresenceIndicatorPosition(index: number) {
	switch (index) {
		case 0:
			return "top-right";
		case 1:
			return "top-center";
		case 2:
			return "top-left";
		case 3:
			return "center-right";
		case 4:
			return "center-left";
		case 5:
			return "bottom-right";
		case 6:
			return "bottom-center";
		case 7:
			return "bottom-left";
		default:
			throw new Error("Invalid index");
	}
}
