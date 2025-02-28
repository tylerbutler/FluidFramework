<script lang="ts">
import { Latest, LatestMap } from "@fluidframework/presence/alpha";
import { Button, Heading, P } from "flowbite-svelte";
import { setContext } from "svelte";
import type { SudokuAppProps } from "./props";
import { PUZZLES } from "./constants";
import PuzzleTable from "./PuzzleTable.svelte";
import type { CellCoordinate, CoordinateString } from "./coordinate";
import { SudokuPuzzle } from "./sudokuPuzzle.svelte";

const { puzzle, presence, sessionClient }: SudokuAppProps = $props();
// Get the states workspace for the presence data. This workspace will be created if it doesn't exist.
// We create a value manager within the workspace to track and share individual pieces of state.
const appPresence = presence.getStates("v1:presence", {
	// Create a Latest value manager to track the selection state.
	selectionCoordinate: Latest<CellCoordinate>([0, 0]),
	selectionMap: LatestMap<string[], CoordinateString>(),
});

const selectionManager = appPresence.props.selectionCoordinate;
const selectionMap = appPresence.props.selectionMap;

let theme = $state("default");
function onThemeChange(e: any) {
	theme = e.target.value;
}

setContext("grid", puzzle.grid);

const handleResetButton = () => {
	for (const row of puzzle.grid) {
		for (const cell of row) {
			if (!cell.startingClue) {
				cell.value = 0;
			}
		}
	}
};

let title = $state(`Sudoku: ${presence.getAttendees().size} attendees`);
const updateTitle = () => {
	title = `Sudoku: ${
		[...presence.getAttendees()].filter((c) => c.getConnectionStatus() === "Connected").length
	} attendees`;
};
presence.events.on("attendeeJoined", () => updateTitle());
presence.events.on("attendeeDisconnected", () => updateTitle());
</script>

<Heading>{title}</Heading>
<P size="sm">My session ID: {presence.getMyself().sessionId}</P>

<P>
<div class={`inline-block h-max ${theme}`}>
	<div class="inline-block min-h-[447px] p-[10px]">
		<PuzzleTable bind:grid={puzzle.grid} {sessionClient} {selectionManager} {selectionMap} />

		<div class="display-flex">
			<span class="display-flex grow-2 items-center">
				<label for="theme-select">Theme: </label>
				<select value={theme} onchange={onThemeChange} id="theme-select" name="theme">
					<option aria-selected={theme === "default"} value="default">
						Default Theme{" "}
					</option>
					<option aria-selected={theme === "dark-theme"} value="dark-theme">
						Dark Theme
					</option>
				</select>
			</span>

			<span class="grow-1">
				<Button onclick={handleResetButton}>Reset</Button>
			</span>

			<span class="display-flex items-center">
				Load:
				<Button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[0])}>Puzzle 1</Button
				>
				<Button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[1])}>Puzzle 2</Button
				>
			</span>
		</div>
	</div>
</div>
</P>
