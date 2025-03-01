<script lang="ts">
import { Latest, LatestMap, type ISessionClient } from "@fluidframework/presence/alpha";
import { Badge, Button, Darkmode, Heading, Indicator, P } from "svelte-5-ui-lib";
import type { SudokuAppProps } from "./props";
import { PUZZLES } from "./constants";
import PuzzleTable from "./PuzzleTable.svelte";
import type { CellCoordinate, CoordinateString } from "./coordinate";
import { SudokuPuzzle } from "./sudokuPuzzle.svelte";
import { mapStringToColor } from "./colors";

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

const handleResetButton = () => {
	for (const row of puzzle.grid) {
		for (const cell of row) {
			if (!cell.startingClue) {
				cell.value = 0;
			}
		}
	}
};

let title = $state("Sudoku");
const updateTitle = () => {
	// const playerCount = [...presence.getAttendees()].filter(
	// 	(c) => c.getConnectionStatus() === "Connected",
	// ).length;
	const playerCount = getConnectedUsers().length;
	title = playerCount > 1 ? `Sudoku: ${playerCount} players` : "Sudoku";
};

const getConnectedUsers = () =>
	[...presence.getAttendees()].filter((c) => c.getConnectionStatus() === "Connected");

let connectedUsers = $state<string[]>([]);

presence.events.on("attendeeJoined", () => {
	connectedUsers = getConnectedUsers().map((c) => c.sessionId);
	updateTitle();
});
presence.events.on("attendeeDisconnected", (attendee: ISessionClient) => {
	puzzle.removeAllOwnership(attendee.sessionId);
	updateTitle();
});

// const isMe = (sessionClient: ISessionClient) => presence.getMyself() === sessionClient;
</script>

<Heading tag="h2">{title}</Heading>

<P>
	<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
		{#key connectedUsers.length}
			{#each connectedUsers as sessionId (sessionId)}
				<li>
						<Badge
							color={mapStringToColor(sessionId)}
							rounded
							class="px-2.5 py-0.5"
						>
							<Indicator
								color={mapStringToColor(sessionId)}
								size="lg"
								class="me-1"
							></Indicator>
							<!-- {isMe(attendee) ? `(me) ${attendee.sessionId}` : attendee.sessionId} -->
							 {sessionId}
						</Badge>
				</li>
				{:else}
				<li><Badge>Disconnected</Badge></li>
			{/each}
		{/key}
	</ul>
</P>

<P>
	<div class={`inline-block h-max min-h-[447px] ${theme}`}>
		<div class="inline-block h-max min-h-[447px]">
			<PuzzleTable
				bind:grid={puzzle.grid}
				{sessionClient}
				{selectionManager}
			/>

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
					<Darkmode />
				</span>
				<span class="grow-1">
					<Button onclick={handleResetButton}>Reset</Button>
				</span>

				<span class="display-flex items-center">
					Load:
					<Button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[0])}
						>Puzzle 1</Button
					>
					<Button onclick={() => SudokuPuzzle.loadPuzzle(puzzle, PUZZLES[1])}
						>Puzzle 2</Button
					>
				</span>
			</div>
		</div>
	</div>
</P>
