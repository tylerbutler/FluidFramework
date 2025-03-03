import { SchemaFactory } from "fluid-framework";

const sf = new SchemaFactory("AppDataSchema");

export class SudokuCellData extends sf.object("SudokuCellData", {
	value: sf.number,
	startingClue: sf.boolean,
	coordinate: sf.array(sf.number),
}) {
	public remoteOwners: Set<string> = new Set();
}

// export class SudokuCells extends sf.array("SudokuCells", SudokuCellData){}

// export class SudokuRow extends sf.array("SudokuRow", sf.array("SudokuCells", SudokuCellData)){}

export class SudokuGrid extends sf.array(
	"SudokuRow",
	sf.array("SudokuCells", SudokuCellData),
) {}

// appData.initialize(
// 	new TodoList({
// 		title: "todo list",
// 		items: [
// 			new TodoItem({
// 				description: "first item",
// 				isComplete: true,
// 			}),
// 		],
// 	}),
// );
