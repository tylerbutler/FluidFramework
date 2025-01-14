<script lang="ts">
import type { CoordinateString } from "./helpers/coordinate";
import type { SudokuAppProps } from "./helpers/props";
import { loadPuzzle } from "./helpers/puzzles";
import type { SudokuCell } from "./helpers/sudokuCell";

import PuzzleTable from "./PuzzleTable.svelte";

const { puzzle, presence, clientSessionId }: SudokuAppProps = $props();
let theme = $state("default");

const handleResetButton = () => {
	puzzle.forEach((value: SudokuCell, key: CoordinateString) => {
		if (!value.fixed && value.value !== 0) {
			value.value = 0;
			puzzle.set(key, value);
		}
	});
};

const loadPuzzle1 = () => {
	loadPuzzle(0, puzzle);
};

const loadPuzzle2 = () => {
	loadPuzzle(1, puzzle);
};

function onThemeChange(e: any) {
	theme = e.target.value;
}
</script>

<div class={`sudoku ${theme}`}>
	<div class="sudoku-wrapper">

		<PuzzleTable {puzzle} {clientSessionId} {presence} />

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
				<button onclick={loadPuzzle1}>Puzzle 1</button>
				<button onclick={loadPuzzle2}>Puzzle 2</button>
			</span>
		</div>
	</div>
</div>
