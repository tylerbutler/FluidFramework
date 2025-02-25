<script lang="ts">
	import type { LatestValueManager } from "@fluidframework/presence/alpha";
	import { Coordinate, type CellCoordinate, type CoordinateString } from "./coordinate";
	import { type SudokuAppProps } from "./props";
	import Cell from "./Cell.svelte";

	const {
		puzzle,
		sessionClient,
		selectionCoordinate,
	}: Omit<SudokuAppProps, "presence"> & {
		readonly selectionCoordinate: LatestValueManager<CellCoordinate>;
	} = $props();

	// const coordinateDataAttributeName = "cellcoordinate";

	const getCellInputElement = (coord: CoordinateString): HTMLInputElement =>
		document.getElementById(`${sessionClient.sessionId}-${coord}`) as HTMLInputElement;

	const moveCell = (keyString: string, coordIn: string) => {
		const coord = coordIn;
		let newCoord = coordIn;
		switch (keyString) {
			case "ArrowDown":
			case "s":
				newCoord = Coordinate.moveDown(coord);
				break;
			case "ArrowUp":
			case "w":
				newCoord = Coordinate.moveUp(coord);
				break;
			case "ArrowLeft":
			case "a":
				newCoord = Coordinate.moveLeft(coord);
				break;
			case "ArrowRight":
			case "d":
				newCoord = Coordinate.moveRight(coord);
				break;
			default:
				newCoord = coord;
		}

		const newCell = getCellInputElement(newCoord);
		newCell.focus();
		selectionCoordinate.local = Coordinate.asArrayNumbers(newCoord);
	};

	selectionCoordinate.events.on("updated", (coordinate) => {
		// const selectedCell = getCellInputElement(Coordinate.fromCellCoordinate(data.value));
		// selectedCell.classList.add("presence");
		puzzle.grid[coordinate.value[0]][coordinate.value[1]].selectedBysessionClients.add(
			coordinate.client,
		);
	});
</script>

<div>
	<table>
		<tbody>
			{#each puzzle.grid as row (row.toString())}
				<tr>
					{#each row as cell (cell.toString())}
						<Cell {cell} currentSessionClient={sessionClient} onKeyDown={moveCell}
						></Cell>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		border: none;
	}
</style>
