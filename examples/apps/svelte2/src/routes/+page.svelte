<script lang="ts">
import { SignedIn, SignedOut } from "svelte-clerk";
import type { PageProps } from "./$types";

const { data }: PageProps = $props();
const { clerkUserProperties } = data;

if (clerkUserProperties === undefined) {
	// signed out
}
</script>

<div class="h-80 mt-[35px]">
<SignedIn>
	<p>Welcome, {clerkUserProperties?.fullName}!</p>
</SignedIn>

<SignedOut>
	<p>You need to log in.</p>
</SignedOut>
</div>
