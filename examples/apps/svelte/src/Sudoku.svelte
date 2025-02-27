<script lang="ts">
import { setContext } from "svelte";
import type { SudokuAppProps } from "./props";
import { PUZZLES } from "./constants";
import PuzzleTable from "./PuzzleTable.svelte";
import { Latest, LatestMap } from "@fluidframework/presence/alpha";
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

<h1>{title}</h1>
<div>My session ID: {presence.getMyself().sessionId}</div>

<div class={`sudoku ${theme}`}>
	<div class="sudoku-wrapper">
		<PuzzleTable bind:grid={puzzle.grid} {sessionClient} {selectionManager} {selectionMap} />

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
				<button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[0])}>Puzzle 1</button
				>
				<button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[1])}>Puzzle 2</button
				>
			</span>
		</div>
	</div>
</div>

<style>
/* :root {
	--themePrimary: #038387;
	--themeLighterAlt: #f0fafa;
	--themeLighter: #c7ebec;
	--themeLight: #9bd9db;
	--themeTertiary: #4bb4b7;
	--themeSecondary: #159196;
	--themeDarkAlt: #02767a;
	--themeDark: #026367;
	--themeDarker: #02494c;
	--neutralLighterAlt: #f8f8f8;
	--neutralLighter: #f4f4f4;
	--neutralLight: #eaeaea;
	--neutralQuaternaryAlt: #dadada;
	--neutralQuaternary: #d2d0ce;
	--neutralTertiaryAlt: #c8c8c8;
	--neutralTertiary: #bab8b7;
	--neutralSecondary: #a3a2a0;
	--neutralPrimaryAlt: #8d8b8a;
	--neutralPrimary: #323130;
	--neutralDark: #605e5d;
	--fg: #494847;
	--bg: #ffffff;
} */

/* Component Tokens */

/* .sudoku {
	--sudoku-bg: var(--bg);
	--sudoku-fg: var(--fg);
	--sudoku-cell-border-color: var(--fg);
	--sudoku-input-bg-focus: var(--themeLighterAlt);
	--sudoku-input-fg-focus: var(--themeDarker);
	--sudoku-input-bg: var(--bg);
	--sudoku-input-fg: var(--fg);
	--sudoku-input-border-color: var(--neutralQuaternary);
	--sudoku-input-border-color-focus: var(--themePrimary);
	--sudoku-button-bg: var(--themePrimary);
	--sudoku-button-bg-hover: var(--themeDarker);
	--sudoku-button-fg: var(--themeLighterAlt);
	--sudoku-button-border-hover: var(--themeLighter);
}

.sudoku-wrapper {
	display: inline-block;
}

.sudoku {
	height: 100%;
	min-height: 447px;
	display: inline-block;
	justify-content: center;
	padding: 10px;
	background: var(--sudoku-bg);
	color: var(--sudoku-fg);
}

.sudoku-theme-select {
	display: flex;
	align-items: center;
	flex-grow: 2;
}


.sudoku-theme-select label {
	display: block;
	font-size: 14px;
	margin-right: 6px;
	color: var(--fg);
}

.correct {
	--sudoku-input-bg: #9bf49b;
	--sudoku-input-fg: #073d07;
	--sudoku-input-border-color: #0b6a0b;
}

.wrong {
	--sudoku-input-bg: #e7999d;
	--sudoku-input-fg: #a4262c;
	--sudoku-input-border-color: #a4262c;
}

.startingClue {
	--sudoku-input-bg: var(--neutralLighter);
	--sudoku-input-fg: var(--neutralPrimary);
	--sudoku-input-border-color: var(--neutralPrimary);
}

.sudoku-reset {
	flex-grow: 1;
}

.sudoku-buttons {
	display: flex;
	margin-top: 8px;
}

.sudoku-load {
	display: flex;
	align-items: center;
}

.sudoku button {
	background: var(--sudoku-button-bg);
	color: var(--sudoku-button-fg);
	border: none;
	height: 32px;
	padding: 0 4px;
}

.sudoku button:hover {
	background: var(--sudoku-button-bg-hover);
}

.sudoku button:focus {
	outline-color: var(--sudoku-button-border-hover);
}

.sudoku-load button {
	margin-left: 8px;
}

.sudoku-cell {
	border-color: var(--sudoku-cell-border-color);
	height: 40px;
	width: 40px;
	border: none;
	box-sizing: border-box;
}

.sudoku-input {
	box-sizing: border-box;
	width: 38px;
	height: 38px;
	padding: 0;
	font-size: 14px;
	background: var(--sudoku-input-bg);
	color: var(--sudoku-input-fg);
	border-width: 1px;
	border-style: solid;
	border-color: var(--sudoku-input-border-color);
	border-radius: 2px;
	text-align: center;
	font-family: Segoe UI Semibold;
} */
</style>
