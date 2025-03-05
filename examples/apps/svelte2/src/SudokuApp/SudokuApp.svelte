<script lang="ts">
import { Latest, type ISessionClient } from "@fluidframework/presence/alpha";
import { Badge, Button, Heading, Indicator, P } from "svelte-5-ui-lib";
import type { SudokuAppProps } from "./props";
import SudokuGrid from "../SudokuGrid/SudokuGrid.svelte";
import type { CellCoordinate } from "../coordinate";
import { mapStringToColor } from "../colors";
import { loadIncludedPuzzle } from "../loadPuzzle";

const { data, presence, sessionClient }: SudokuAppProps = $props();
// Get the states workspace for the presence data. This workspace will be created if it doesn't exist.
// We create a value manager within the workspace to track and share individual pieces of state.
const appPresence = presence.getStates("v1:presence", {
	// Create a Latest value manager to track the selection state.
	selectionCoordinate: Latest<CellCoordinate>([0, 0]),
});

const selectionManager = appPresence.props.selectionCoordinate;

const handleResetButton = () => {
	for (const row of data.grid) {
		for (const cell of row) {
			if (!cell.startingClue) {
				cell.value = 0;
			}
			cell.remoteOwners.clear();
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
	for (const row of data.grid) {
		for (const cell of row) {
			cell.remoteOwners.delete(attendee);
		}
	}
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
					<Badge color={mapStringToColor(sessionId)} rounded class="px-2.5 py-0.5">
						<Indicator color={mapStringToColor(sessionId)} size="lg" class="me-1"
						></Indicator>
						<!-- {isMe(attendee) ? `(me) ${attendee.sessionId}` : attendee.sessionId} -->
						{sessionId}
					</Badge>
				</li>
			{:else}
				<li><Badge>No one else connected</Badge></li>
			{/each}
		{/key}
	</ul>
</P>

<P>
	<div class="inline-block h-max min-h-[447px]">
		<div class="inline-block h-max min-h-[447px]">
			<SudokuGrid grid={data.grid} {sessionClient} {selectionManager} />

			<div class="flex">
				<span class="grow-1">
					<Button onclick={handleResetButton}>Reset</Button>
				</span>

				<span class="grow-5">
						<span>Load:</span>
						<Button onclick={() => loadIncludedPuzzle(data, 0)}>Puzzle 1</Button>
						<Button onclick={() => loadIncludedPuzzle(data, 1)}>Puzzle 2</Button>
					</span>
			</div>
		</div>
	</div>
</P>
