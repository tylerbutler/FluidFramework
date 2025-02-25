<script lang="ts">
import type { SudokuAppProps } from "./helpers/props";
import { PUZZLES } from "./helpers/constants";
import PuzzleTable from "./PuzzleTable.svelte";
import { Latest } from "@fluidframework/presence/alpha";
import type { CellCoordinate } from "./helpers/coordinate";

const { puzzle, presence, sessionClientId }: SudokuAppProps = $props();
// Get the states workspace for the presence data. This workspace will be created if it doesn't exist.
// We create a value manager within the workspace to track and share individual pieces of state.
const appPresence = presence.getStates("v1:presence", {
	// Create a Latest value manager to track the selection state.
	selectionCoordinate: Latest<CellCoordinate>([0, 0]),
});

let theme = $state("default");
function onThemeChange(e: any) {
	theme = e.target.value;
}

const handleResetButton = () => {
	for (const row of puzzle.grid) {
		for (const cell of row) {
			if (!cell.fixed) {
				cell.value = 0;
			}
		}
	}
};
</script>

<div class={`sudoku ${theme}`}>
	<div class="sudoku-wrapper">
		<PuzzleTable {puzzle} {sessionClientId} presenceValueManager={appPresence.props.selectionCoordinate} />

		<div class="sudoku-buttons">
			<span class="sudoku-theme-select">
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

			<span class="sudoku-reset">
				<button onclick={handleResetButton}>Reset</button>
			</span>

			<span class="sudoku-load">
				Load:
				<button onclick={() => puzzle.loadPuzzle(PUZZLES[0])}>Puzzle 1</button>
				<button onclick={() => puzzle.loadPuzzle(PUZZLES[1])}>Puzzle 2</button>
			</span>
		</div>
	</div>
</div>
