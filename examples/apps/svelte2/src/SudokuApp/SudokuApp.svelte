<script lang="ts">
import { Latest, type ISessionClient } from "@fluidframework/presence/alpha";
import { Badge, Button, Heading, Indicator, P } from "svelte-5-ui-lib";
import type { SudokuAppProps } from "./props";
import SudokuGrid from "../SudokuGrid/SudokuGrid.svelte";
import type { CellCoordinate } from "../coordinate";
import { loadIncludedPuzzle } from "../loadPuzzle";
import { setContext } from "svelte";
import { SelectionManager } from "../selectionManager.svelte";
import type { SudokuCellViewData } from "../fluid/cellData.svelte";
import { SudokuAppUser } from "../user.svelte";
import { SelectionManagerContextKey, UserMetadataManagerContextKey } from "../constants";
import { UserMetadataManager } from "../userMetadataManager.svelte";

const { data, presence, sessionClient, user: rawUser }: SudokuAppProps = $props();

const user = new SudokuAppUser(rawUser?.fullName ?? presence.getMyself().sessionId);
console.log(`user`, user);

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
	userMetadata: Latest<SudokuAppUser>(user),
});
// appPresence.props.userMetadata.local = user;

/**
 * The selection manager tracks the currently selected cell for each connected client.
 */
const selectionManager = new SelectionManager(appPresence.props.selectionCoordinate);
const userMetadata = new UserMetadataManager(appPresence.props.userMetadata, user);

// Pass the selection state to context so we can access it in the SudokuCellPresence component
setContext(SelectionManagerContextKey, selectionManager);
setContext(UserMetadataManagerContextKey, userMetadata);

/**
 * A local reactive state variable to track the connected users.
 */
let connectedUsers = $state<ISessionClient[]>([]);

presence.events.on("attendeeJoined", () => {
	connectedUsers = getConnectedUsers();
	console.log("attendeeJoined", user.fullName, user.color);
	userMetadata.reactiveState.set(presence.getMyself(), user);
});

presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
	selectionManager.reactiveState.delete(session);
	userMetadata.reactiveState.delete(session);
	console.log("attendeeDisconnected", user.fullName, user.color);
	connectedUsers = getConnectedUsers();
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

<Heading tag="h2">{title}</Heading>

<P>
	<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
			{#each connectedUsers as session (session.sessionId)}
			{@const metadata = userMetadata.reactiveState.get(session)}
			<!-- {@debug metadata} -->
			{#if connectedUsers.length > 1}
				{@const isMe = session.sessionId === presence.getMyself().sessionId}
				{@const sessionText = isMe ? `${metadata?.fullName} (me)` : (metadata?.fullName)}
				<li>
					<Badge color={metadata?.color} rounded class="px-2.5 py-0.5">
						<Indicator color={metadata?.color} size="lg" class="me-1"
						></Indicator>
						{sessionText}
					</Badge>
				</li>
			{/if}
			{:else}
				<li><Badge color="secondary">No one else connected</Badge></li>
			{/each}
	</ul>
</P>

<P>
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
</P>
<P>
	<ul>
	{#each selectionManager.reactiveState as [session, selectedCell] (session.sessionId)}
		{#if session.getConnectionStatus() === "Connected"}
			<li>{session.sessionId}: {selectedCell}</li>
		{/if}
	{/each}
</ul>
</P>
