<script lang="ts">
import { Button, Heading, Secondary } from "svelte-5-ui-lib";
import type { SelectionManager, SudokuAppProps, UserMetadataManager } from "./props";
import SudokuGrid from "$lib/components/SudokuGrid.svelte";
import { loadIncludedPuzzle } from "$lib/loadPuzzle";
import type { SudokuCellViewData } from "$lib/fluid/cellData.svelte";
import { getContext } from "svelte";
import { SelectionManagerContextKey, UserMetadataManagerContextKey } from "$lib/constants";

const { data, presence, sessionClient }: SudokuAppProps = $props();

/**
 * Returns all the connected users that presence is tracking.
 */
const getConnectedUsers = () =>
	[...presence.getAttendees()].filter((c) => c.getConnectionStatus() === "Connected");

const userMetadataManager = getContext<UserMetadataManager>(UserMetadataManagerContextKey);
const selectionManager = getContext<SelectionManager>(SelectionManagerContextKey);
// const sudokuUser = getContext<SudokuAppUser>(SudokuUserKey);

// The title is derived from the connected users array, which is updated when users join or leave.
const title = $derived.by(() => {
	const playerCount = userMetadataManager.data.size;
	return playerCount > 1
		? `${playerCount} players (including me, ${userMetadataManager.local.fullName})`
		: "";
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

<div>
	<Heading tag="h2">
		Sudoku <Secondary class="ms-2">{title}</Secondary>
	</Heading>

	<div>
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
	<hr/>
	<div>
		<h3>User metadata manager</h3>
		<ul>
			{#each userMetadataManager.unfilteredData as [session, userData] (session.sessionId)}
				<li>
					{session.sessionId.slice(0, 8)}: {session.getConnectionStatus()}
					{userData.fullName} ({userData.color})
				</li>
			{/each}
		</ul>
	</div>
	<hr />
	<div>
		<h3>Selection manager</h3>
		<ul>
			{#each selectionManager.data as [session, selectedCell] (session.sessionId)}
				<!-- {#if session.getConnectionStatus() === "Connected"} -->
				{@const user = userMetadataManager.data.get(session)}
				<li>{session.sessionId} {user?.fullName}: {selectedCell}</li>
				<!-- {/if} -->
			{/each}
		</ul>
	</div>
</div>

<!-- <pre><code>
		{#each userMetadata.reactiveState as [session, user] (session.sessionId)}
			session {session.sessionId}:
			{#if session.getConnectionStatus() === "Connected"}
				{user.fullName} ({user.color})
			{:else}
				Disconnected
			{/if}
		{/each}
	</code></pre> -->
