<script lang="ts">
import { Latest, type ISessionClient } from "@fluidframework/presence/alpha";
import { El, Badge, Button } from "yesvelte";
import type { SudokuAppProps } from "./props";
import SudokuGrid from "../SudokuGrid/SudokuGrid.svelte";
import type { CellCoordinate } from "../coordinate";
import { mapStringToColor } from "../colors";
import { loadIncludedPuzzle } from "../loadPuzzle";
import { setContext } from "svelte";
import { SelectionManager, SelectionManagerContextKey } from "../selectionManager.svelte";
import type { SudokuCellViewData } from "../fluid/cellData.svelte";

const { data, presence, sessionClient }: SudokuAppProps = $props();

/**
 * Returns all the connected users that presence is tracking.
 */
const getConnectedUsers = () =>
	[...presence.getAttendees()].filter((c) => c.getConnectionStatus() === "Connected");

// Get the states workspace for the presence data. This workspace will be created if it doesn't exist.
// We create a value manager within the workspace to track and share individual pieces of state.
const appPresence = presence.getStates("v1:presence", {
	// Create a Latest value manager to track the latest coordinate for each user.
	selectionCoordinate: Latest<CellCoordinate>([0, 0]),
});

/**
 * The selection manager tracks the currently selected cell for each connected client.
 */
const selectionManager = new SelectionManager(appPresence.props.selectionCoordinate);

// Pass the selection state to context so we can access it in the SudokuCellPresence component
setContext(SelectionManagerContextKey, selectionManager);

/**
 * A local reactive state variable to track the connected users.
 */
let connectedUsers = $state<string[]>([]);

presence.events.on("attendeeJoined", () => {
	connectedUsers = getConnectedUsers().map((c) => c.sessionId);
});

presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
	selectionManager.reactiveState.delete(session);
	connectedUsers = getConnectedUsers().map((c) => c.sessionId);
});

// The title is derived from the connected users array, which is updated when users join or leave.
const title = $derived.by(() => {
	const playerCount = connectedUsers.length;
	return playerCount > 1 ? `Sudoku: ${playerCount} players` : "Sudoku";
});

const onPuzzleReset = () => {
	for (const row of data.grid) {
		for (const cellInternal of row) {
			const cell = cellInternal as SudokuCellViewData;
			if (!cell.startingClue) {
				cell.value = 0;
			}
		}
	}
};
</script>

<El tag="h2">{title}</El>

<El tag="p">
	<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
			{#each connectedUsers as sessionId (sessionId)}
			{@const isMe = sessionId === presence.getMyself().sessionId}
			{@const sessionText = isMe ? `${sessionId} (me)` : sessionId}
				<li>
					<Badge color={mapStringToColor(sessionId)} class="px-2.5 py-0.5">
						<Badge color={mapStringToColor(sessionId)} size="lg" class="me-1"
						></Badge>
						{sessionText}
					</Badge>
				</li>
			{:else}
				<li><Badge color="primary">No one else connected</Badge></li>
			{/each}
	</ul>
</El>

<El tag="p">
	<div class="inline-block h-max min-h-[447px]">
		<div class="inline-block h-max min-h-[447px]">
			<SudokuGrid grid={data.grid} {sessionClient} />

			<div class="flex">
				<span class="grow-1">
					<Button onclick={onPuzzleReset}>Reset</Button>
				</span>

				<span class="grow-5">
						<span>Load:</span>
						<Button onclick={() => loadIncludedPuzzle(data, 0)}>Puzzle 1</Button>
						<Button onclick={() => loadIncludedPuzzle(data, 1)}>Puzzle 2</Button>
					</span>
			</div>
		</div>
	</div>
</El>
<El tag="p">
	<ul>
	{#each selectionManager.reactiveState as [session, selectedCell] (session.sessionId)}
		{#if session.getConnectionStatus() === "Connected"}
			<li>{session.sessionId}: {selectedCell}</li>
		{/if}
	{/each}
</ul>
</El>
