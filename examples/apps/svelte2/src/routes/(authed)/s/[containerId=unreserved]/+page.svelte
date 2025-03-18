<script lang="ts">
import type { PageProps } from "./$types";
import { SignedIn, SignedOut } from "svelte-clerk";
import SudokuApp from "$lib/components/SudokuApp/SudokuApp.svelte";
import { Latest } from "@fluidframework/presence/alpha";
import {
	PresenceWorkspaceAddress,
	SelectionManagerContextKey,
	UserMetadataManagerContextKey,
} from "$lib/constants";
import type { CellCoordinate } from "$lib/coordinate";
import { createNewUser, type SudokuUser } from "../../../../user.svelte";
import { UserMetadataManager } from "../../../../userMetadataManager.svelte";
import { SelectionManager } from "../../../../selectionManager.svelte";
import { setContext } from "svelte";
import { Badge, Indicator } from "svelte-5-ui-lib";

const { data }: PageProps = $props();
const { appData, clerkUserProperties, presence } = data;

// This is an authed route so these properties should not be undefined.
const sudokuUser = createNewUser(clerkUserProperties!);

// Get the states workspace for the presence data. This workspace will be created if it doesn't exist.
// We create a value manager within the workspace to track and share individual pieces of state.
const presenceWorkspace = presence.getStates(PresenceWorkspaceAddress, {
	// Create a Latest value manager to track the latest coordinate for each user.
	selectionCoordinate: Latest<CellCoordinate>([0, 0]),
	userMetadata: Latest<SudokuUser>(sudokuUser),
});

/**
 * The selection manager tracks the currently selected cell for each connected client.
 */
const selectionManager = new SelectionManager(
	presence,
	presenceWorkspace.props.selectionCoordinate,
);
setContext(SelectionManagerContextKey, selectionManager);

const userMetadataManager = new UserMetadataManager(
	presence,
	presenceWorkspace.props.userMetadata,
	// svelte-ignore state_referenced_locally
	// sudokuUser,
);
setContext(UserMetadataManagerContextKey, userMetadataManager);
userMetadataManager.local = sudokuUser;

// presence.events.on("attendeeJoined", () => {
// 	userMetadataManager.valueManager.local = sudokuUser;
// });

// presence.events.on("attendeeDisconnected", (session: ISessionClient) => {
// 	selectionManager..delete(session);
// 	// probably unnecessary
// 	userMetadataManager.valueManager.local = sudokuUser;
// });
</script>

<div class="p-8">
	<SignedIn>
		<div>
			<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
				{#each userMetadataManager.data as [session, metadata] (session.sessionId)}
					{#if session.getConnectionStatus() === "Connected"}
						{@const isMe = session.sessionId === presence.getMyself().sessionId}
						{@const sessionText =
							`${metadata?.fullName} [${session.sessionId.slice(0, 8)}]` +
							(isMe ? `(me)` : "")}
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
		</div>

		<SudokuApp data={appData.root} {presence} sessionClient={presence.getMyself()} />
	</SignedIn>
	<SignedOut>You need to be signed in.</SignedOut>
</div>
